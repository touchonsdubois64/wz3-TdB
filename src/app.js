// ==================================================
// XPGN STUDIO — application
// ==================================================
//
// Reprend de cc2 : Chessground + chess.js, arbre de coups avec variantes,
// Stockfish (force maximale), tables de finales Lichess, notation
// (français / figurines / international), export PGN.
//
// Nouveautés : édition de la position (FEN ou glisser-déposer), translation,
// boutons Play / Start, panneau d'évaluation avec coups des tables et
// « Winning Zone » (cases vertes / jaunes / roses).
// ==================================================

import { Chessground } from '@lichess-org/chessground';
import '@lichess-org/chessground/assets/chessground.base.css';
import '@lichess-org/chessground/assets/chessground.brown.css';
import { Chess } from 'chess.js';
import { fillLabel, plainLabel, setupLibrary } from './library.js';
import { findPgnNodeByPath, parsePgn } from './pgn.js';
import { MOVE_NAGS, nagDisplay } from './nags.js';
import { setupMarks } from './marks-ui.js';
import { attachXpgnAnnotations, getXpgnNodePath, parseXpgn, stringifyXpgn } from './xpgn.js';
import { inheritXpgnAnnotations, updateXpgnAnnotationBranch } from './xpgn-annotations.js';
import { setupSettings } from './settings.js';

import './style.css';
import './studio-ui.css';
import './studio-ui.js';
import {
  EMPTY_PLACEMENT,
  buildFen,
  canShift,
  gridToPlacement,
  parseFen,
  placementToGrid,
  sanitizeCastling,
  shiftGrid,
  validateStructure,
} from './fen.js';
import { Engine, depthFromInfo, evaluationFromInfo, formatScore, parseInfo, scoreValue } from './engine.js';
import { annotateMoves, getMainlineMate, getTablebase, isCovered, mateText, uciOf } from './tablebase.js';

// ==================================================
// OUTILS
// ==================================================

const $ = (selector) => document.querySelector(selector);
// En développement, les ressources statiques historiques sont dans docs/ ;
// sur GitHub Pages, docs/ devient la racine du site publié.
const asset = (path) => new URL(import.meta.env.DEV ? `docs/${path}` : path, document.baseURI).href;

// Les icônes de l'interface principale sont déclarées directement dans index.html
// (contrairement aux pièces injectées par JavaScript). En mode dev, elles doivent
// pointer vers le dossier docs/ qui contient les ressources statiques du projet.
if (import.meta.env.DEV) {
  document.querySelectorAll('img[src^="./images/"], img[src^="./pieces/"]').forEach((image) => {
    const source = image.getAttribute('src');
    image.src = asset(source.replace(/^\.\//, ''));
  });
}
const escapeHtml = (text) =>
  String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const boardElement = $('#board');
const fenInput = $('#fen');
const messageElement = $('#message');
const zzButton = $('#zz-btn');
const pgnInput = $('#pgn');
const pgnMessage = $('#pgn-message');
const statusElement = $('#status');
const movesElement = $('#moves');

// suivi du défilement automatique de la liste des coups (voir centerCurrentMove)
let lastCenteredNode = null;
let clickedInMoves = false;
movesElement.addEventListener(
  'pointerdown',
  () => {
    clickedInMoves = true;
    setTimeout(() => (clickedInMoves = false), 400);
  },
  true,
);
const evalHead = $('#eval-head');
const evalMoves = $('#eval-moves');
const evalPill = $('#eval-pill');
const zoneButton = $('#zone');
const zoneLayer = $('#zone-layer');
const startButtons = { w: $('#start-white'), b: $('#start-black') };

const ROLE_LETTER = { pawn: 'P', knight: 'N', bishop: 'B', rook: 'R', queen: 'Q', king: 'K' };

// Les images des pièces sont injectées ici afin que leurs chemins restent
// valides quel que soit l'endroit où le site est hébergé.
(function injectPieceImages() {
  const rules = [];
  for (const color of ['white', 'black']) {
    for (const [role, letter] of Object.entries(ROLE_LETTER)) {
      const url = asset('pieces/alpha/' + color[0] + letter + '.svg');
      rules.push(`#board piece.${color}.${role} { background-image: url('${url}') !important; }`);
    }
  }
  rules.push('#board piece { background-size: contain !important; background-repeat: no-repeat !important; background-position: center !important; }');
  const style = document.createElement('style');
  style.textContent = rules.join('\n');
  document.head.appendChild(style);
})();

// ==================================================
// ÉTAT
// ==================================================

const game = new Chess();

let locked = false; // false : position éditable — true : partie en cours
let playerSide = 'analysis'; // 'white' | 'black' | 'analysis' : le Roi bicolore est choisi tant que l'utilisateur n'a pas indiqué son camp
let suspended = null; // édition reprise en cours de partie : { placement } (les coups restent affichés)
let positionTitle = null; // titre de la position choisie dans la bibliothèque

let editMeta = { turn: 'w', castling: '-', half: 0, full: 1 };

let currentStartFen = '';
let currentXpgnCourse = null;
let currentXpgnGames = [];
let currentXpgnMainPgn = null;
let currentXpgnCourseOnly = false;
let rootNode = null;
let currentNode = null;

let thinking = false;
let pendingPromotion = null;
let moveToken = 0; // invalide les calculs de Stockfish devenus obsolètes
let evalId = 0; // invalide les évaluations devenues obsolètes

let evalOn = false;
let zoneOn = false;
let zoneSig = '';
let tbList = null; // dernière liste de coups des tables, pour réaffichage

const engine = new Engine(asset('stockfish/stockfish-18-lite-single.js'));

// ==================================================
// ÉCHIQUIER
// ==================================================

const ground = Chessground(boardElement, {
  fen: EMPTY_PLACEMENT,
  orientation: 'white',
  coordinates: false,
  animation: { duration: 150 },
  highlight: { lastMove: false, check: false },
  premovable: { enabled: false },
  // Mode édition : pièces librement déplaçables, suppression hors de l'échiquier
  movable: { free: true, color: 'both', showDests: false, events: { after: onAfterMove } },
  draggable: { enabled: true, deleteOnDropOff: true },
  selectable: { enabled: false },
  events: { change: onBoardChange },
});

/** Disposition paysage / ordinateur (deux cadres) ou portrait (une colonne), choisie automatiquement. */
// (mêmes conditions que dans style.css : grande fenêtre d'ordinateur, ou téléphone tenu en paysage)
const landscapeQuery = window.matchMedia(
  '(orientation: landscape) and (min-width: 1260px) and (min-height: 520px), ' +
    '(orientation: landscape) and (pointer: coarse) and (min-width: 600px) and (max-height: 520px)',
);

/** Liste des coups, annotations et notation : dans le cadre de droite en paysage, sous l'échiquier en portrait. */
function placeBlocks() {
  const notation = $('.notation-control');
  const panel = $('#marks-panel');
  const moves = $('#moves');
  const title = $('#library-title');
  if (landscapeQuery.matches) {
    $('#frame-right').append(notation, panel, moves);
    $('.left').prepend(title); // titre de la position : au-dessus de l'échiquier
  } else {
    $('.left').append(panel, moves, notation);
    $('.cell-library').append(title);
  }
}
placeBlocks();
landscapeQuery.addEventListener('change', () => {
  placeBlocks();
  refreshGeometry();
});

/** Rectangle réel de l'échiquier : Chessground arrondit sa taille à un multiple de 8 pixels. */
function boardRect() {
  const board = boardElement.querySelector('cg-board');
  return (board || boardElement).getBoundingClientRect();
}

/** Les calques (zones, annotations) prennent exactement la taille de l'échiquier dessiné. */
function syncLayers() {
  const rect = boardRect();
  for (const layer of [zoneLayer, $('#marks-layer')]) {
    layer.style.width = rect.width + 'px';
    layer.style.height = rect.height + 'px';
  }
}

/**
 * Figurines d'édition : elles occupent la place entre le bord gauche de l'échiquier et les
 * 4 boutons de translation (de la même hauteur que les deux rangées de figurines), dont le bord droit
 * est aligné sur le milieu de la colonne h.
 */
function fitPalette() {
  const cell = $('.cell-palette');
  const shift = $('#shift');
  if (!cell || !shift) return;
  cell.style.removeProperty('--pal'); // on repart de la taille par défaut
  const style = getComputedStyle(cell);
  const cellRect = cell.getBoundingClientRect();
  const board = boardRect();
  const left = cellRect.left + (parseFloat(style.paddingLeft) || 0);
  // portrait : jusqu'au milieu de la colonne h ; paysage : toute la largeur de la colonne de commandes
  const right = landscapeQuery.matches ? cellRect.right : Math.min(board.right - board.width / 16, cellRect.right);
  const gap = parseFloat(style.columnGap) || 0;
  // largeur occupée = 6 figurines + le bloc des 4 flèches (3 cases de .7 figurine, voir .shift dans style.css)
  const size = Math.floor(((right - left - gap) / (6 + 3 * 0.7)) * 10) / 10;
  if (size >= 14) cell.style.setProperty('--pal', Math.min(size, 66) + 'px');
}

const refreshGeometry = () => {
  ground.redrawAll();
  syncLayers();
  fitPalette();
};
new ResizeObserver(refreshGeometry).observe(boardElement);
new ResizeObserver(fitPalette).observe($('.app'));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPalette);
window.addEventListener('resize', refreshGeometry);
window.addEventListener('load', refreshGeometry);

function onAfterMove(orig, dest) {
  if (!locked) {
    onBoardChange();
    return;
  }
  playerMove(orig, dest);
}

function onBoardChange() {
  if (locked) return;
  setPositionTitle(null);
  discardSuspendedIfModified();
  syncEditorFen();
  updateShiftButtons();
}

function setPositionTitle(title) {
  positionTitle = title ? plainLabel(title) : null; // texte brut, utilisé dans le PGN
  const label = $('#library-title');
  fillLabel(label, title || '');
  label.title = positionTitle || '';
}

/** Les coups affichés ne sont effacés qu'une fois la position réellement modifiée. */
function discardSuspendedIfModified() {
  if (!suspended || ground.getFen() === suspended.placement) return;
  suspended = null;
  rootNode = null;
  currentNode = null;
  marks.setItems([]);
  currentStartFen = '';
  updateMoves();
  updateNavigation();
}

// ==================================================
// ANNOTATIONS (crayon)
// ==================================================

// Position choisie dans la bibliothèque : donne accès à ses champs facultatifs « url » (solution) et « marks » (indice)
let currentLibraryPosition = null;
let xpgnDirty = false;

const marks = setupMarks({
  layer: $('#marks-layer'),
  panel: $('#marks-panel'),
  buttons: [...document.querySelectorAll('.marks-opener')],
  isWhite: () => ground.state.orientation === 'white',
  onItemsChange: (items) => {
    if (!currentNode) return;
    updateXpgnAnnotationBranch(currentNode, items);
    xpgnDirty = true;
  },
  // position à laquelle se rapportent les annotations téléchargées (bouton « Enregistrer »)
  getExportInfo: () =>
    currentLibraryPosition
      ? { title: currentLibraryPosition.title, fen: currentLibraryPosition.fen }
      : { title: positionTitle || '', fen: (locked && currentStartFen) || fenInput.value.trim() },
  onActiveChange: (active) => {
    if (active) disarm();
    // pendant l'annotation, un clic ne sélectionne plus de pièce (le glisser-déposer reste possible)
    if (locked) ground.set({ selectable: { enabled: !active } });
  },
});

// ==================================================
// INDICE : annotations enregistrées avec la position (champ « marks » de positions.js)
// ==================================================
//
// Le bouton « i » affiche, puis masque, les annotations de la position choisie dans la bibliothèque.
// Le code s'obtient avec le bouton « Enregistrer » de la barre Annotations (voir marks.js pour le format).
// L'indice disparaît dès qu'on charge une autre position.
// ==================================================

const hintButton = $('#hint-btn');

function refreshHintButton() {
  const shown = marks.isHintShown();
  hintButton.classList.toggle('active', shown);
  hintButton.setAttribute('aria-pressed', shown ? 'true' : 'false');
}

/** Nouvelle position : on efface les annotations tracées et on masque l'indice. */
function resetMarks() {
  marks.clear();
  marks.hideHint();
  refreshHintButton();
}

function toggleHint() {
  if (marks.isHintShown()) {
    marks.hideHint();
    refreshHintButton();
    return;
  }
  const position = currentLibraryPosition;
  if (!position) {
    showMessage('Choisissez d’abord une position dans la bibliothèque.', 'info');
    return;
  }
  if (!position.marks) {
    showMessage('Aucun indice enregistré pour cette position.', 'info');
    return;
  }
  const result = marks.showHint(position.marks);
  refreshHintButton();
  if (result.count === 0) {
    showMessage('Le code d’annotations de cette position est illisible : ' + (result.errors[0] || 'vide') + '.', 'error');
  } else if (result.errors.length > 0) {
    showMessage(result.errors.length + ' élément(s) du code d’annotations ignoré(s) : ' + result.errors[0] + '.', 'error');
  } else {
    hideMessage();
  }
}

hintButton.addEventListener('click', toggleHint);

// ==================================================
// SOLUTION : chapitre d'étude Lichess (champ « url » de positions.js)
// ==================================================
//
// L'url d'un chapitre (https://lichess.org/study/XXXXXXXX/YYYYYYYY) sert à télécharger
// son PGN via l'API de Lichess, puis à l'afficher comme n'importe quel PGN (loadPgn).
// L'étude doit être publique (ou non répertoriée) ; le PGN téléchargé est gardé en mémoire.
// ==================================================

const solutionCache = new Map();
let solutionBusy = false;

function parseStudyUrl(url) {
  const match = /lichess\.org\/study\/([A-Za-z0-9]{8})\/([A-Za-z0-9]{8})/.exec(String(url || ''));
  return match ? { studyId: match[1], chapterId: match[2] } : null;
}

async function showSolution() {
  const position = currentLibraryPosition;
  if (!position) {
    showMessage('Choisissez d’abord une position dans la bibliothèque.', 'info');
    return;
  }
  if (!position.url) {
    showMessage('Aucune solution enregistrée pour cette position.', 'info');
    return;
  }
  const ids = parseStudyUrl(position.url);
  if (!ids) {
    showMessage('L’adresse du chapitre Lichess n’est pas reconnue : ' + position.url, 'error');
    return;
  }
  if (solutionBusy) return;

  let pgn = solutionCache.get(position.url);
  if (!pgn) {
    solutionBusy = true;
    showMessage('Chargement de la solution…', 'info');
    try {
      const response = await fetch(
        'https://lichess.org/api/study/' + ids.studyId + '/' + ids.chapterId + '.pgn?comments=true&variations=true&clocks=false',
      );
      if (!response.ok) {
        throw new Error(response.status === 404 ? 'chapitre introuvable ou étude privée' : 'erreur ' + response.status);
      }
      pgn = await response.text();
      solutionCache.set(position.url, pgn);
    } catch (error) {
      showMessage('Solution inaccessible (' + (error.message || 'connexion impossible') + ').', 'error');
      return;
    } finally {
      solutionBusy = false;
    }
  }

  pgnInput.value = pgn.replace(/\s+/g, ' ').trim();
  lastPgn = pgnInput.value;
  if (loadPgn(pgn, { fromSolution: true })) setPositionTitle(position.title); // on garde le titre de la bibliothèque
}

$('#solution-btn').addEventListener('click', showSolution);

zzButton.addEventListener('click', () => {
  showMessage('« Cases clés et cases conjuguées » : outil à venir (annotations associées aux positions de positions.js).', 'info');
});

// ==================================================
// MESSAGES
// ==================================================

let messageTimer = null;

function showMessage(text, kind = 'error', target = messageElement) {
  hideMessage();
  target.textContent = text;
  target.className = 'message' + (kind === 'info' ? ' info' : '');
  clearTimeout(messageTimer);
  messageTimer = setTimeout(hideMessage, 7000);
}

function hideMessage() {
  messageElement.textContent = '';
  pgnMessage.textContent = '';
}

function setStatus(text) {
  statusElement.textContent = text;
}

// ==================================================
// COORDONNÉES ET INDICATEURS DU TRAIT
// ==================================================

function updateCoordinates() {
  const white = ground.state.orientation === 'white';
  const ranks = white ? '87654321' : '12345678';
  const files = white ? 'abcdefgh' : 'hgfedcba';
  $('.rank-labels').innerHTML = [...ranks].map((c) => `<span>${c}</span>`).join('');
  $('.file-labels').innerHTML = [...files].map((c) => `<span>${c}</span>`).join('');
}

// ==================================================
// ÉDITION : PALETTE DE FIGURINES
// ==================================================

const PALETTE = ['white', 'black'].flatMap((color) =>
  ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'].map((role) => ({ color, role })),
);

const ROLE_NAME = { king: 'Roi', queen: 'Dame', rook: 'Tour', bishop: 'Fou', knight: 'Cavalier', pawn: 'Pion' };

function buildPalette() {
  const palette = $('#palette');
  for (const entry of PALETTE) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'piece';
    const image = document.createElement('img');
    image.src = asset('pieces/alpha/' + entry.color[0] + ROLE_LETTER[entry.role] + '.svg');
    image.alt = '';
    image.draggable = false;
    button.appendChild(image);
    button.title = ROLE_NAME[entry.role] + (entry.color === 'white' ? ' blanc' : ' noir') + ' — glisser sur l’échiquier';
    button.setAttribute('aria-label', button.title);

    const piece = { color: entry.color, role: entry.role };
    button.addEventListener('pointerdown', (event) => {
      palettePress = { button, piece, x: event.clientX, y: event.clientY };
    });
    button.addEventListener('mousedown', (event) => {
      if (locked || event.button !== 0) return;
      event.preventDefault();
      ground.dragNewPiece(piece, event, true);
    });
    button.addEventListener(
      'touchstart',
      (event) => {
        if (locked) return;
        event.preventDefault();
        ground.dragNewPiece(piece, event, true);
      },
      { passive: false },
    );
    palette.appendChild(button);
  }
}

// ==================================================
// ÉDITION : CLICS (sélection d'une figurine, cycle blanc → noir → vide)
// ==================================================
//
// • Clic sur une figurine de la palette, puis clic sur une case : dépôt.
// • Ensuite, chaque clic sur la case fait passer la pièce de blanche à noire,
//   puis à « rien », puis de nouveau à blanche, etc. (même type de pièce).
// Un simple clic se distingue d'un glisser-déposer par la distance parcourue.
// ==================================================

let pressed = null; // appui en cours sur l'échiquier
let palettePress = null; // appui en cours sur la palette
let armed = null; // figurine sélectionnée dans la palette : { button, piece }
let cycleMemory = null; // dernière case du cycle : { key, role }

function keyAtPoint(x, y) {
  const rect = boardRect();
  if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) return null;
  let file = Math.floor((8 * (x - rect.left)) / rect.width);
  let rank = 7 - Math.floor((8 * (y - rect.top)) / rect.height);
  if (ground.state.orientation === 'black') {
    file = 7 - file;
    rank = 7 - rank;
  }
  return 'abcdefgh'[file] + (rank + 1);
}

function disarm() {
  if (armed) armed.button.classList.remove('armed');
  armed = null;
  document.body.classList.remove('armed');
}

function arm(button, piece) {
  const same = armed && armed.button === button;
  disarm();
  marks.setActive(false); // une seule sélection à la fois : figurine ou annotation
  if (same) return; // un second clic sur la même figurine l'abandonne
  armed = { button, piece };
  button.classList.add('armed');
  document.body.classList.add('armed');
}

boardElement.addEventListener(
  'pointerdown',
  (event) => {
    pressed = null;
    const marking = marks.isActive();
    if ((locked && !marking) || event.button > 0) return;
    const key = keyAtPoint(event.clientX, event.clientY);
    if (!key) return;
    const piece = ground.state.pieces.get(key);
    pressed = { key, piece: piece ? { color: piece.color, role: piece.role } : null, x: event.clientX, y: event.clientY, marking };
  },
  true,
);

document.addEventListener('pointerup', (event) => {
  const board = pressed;
  const palette = palettePress;
  pressed = null;
  palettePress = null;

  // outil Annotations : un simple clic sur une case pose ou retire l'annotation choisie
  if (board && board.marking) {
    if (Math.hypot(event.clientX - board.x, event.clientY - board.y) > 6) return;
    if (keyAtPoint(event.clientX, event.clientY) !== board.key) return;
    setTimeout(() => marks.click(board.key), 0);
    return;
  }
  if (locked) return;

  if (palette) {
    const there = document.elementFromPoint(event.clientX, event.clientY);
    const moved = Math.hypot(event.clientX - palette.x, event.clientY - palette.y) > 6;
    if (!moved && there && palette.button.contains(there)) arm(palette.button, palette.piece);
    return;
  }

  if (!board) return;
  if (Math.hypot(event.clientX - board.x, event.clientY - board.y) > 6) return;
  if (keyAtPoint(event.clientX, event.clientY) !== board.key) return;
  // on laisse Chessground terminer son propre traitement du clic
  setTimeout(() => boardClick(board), 0);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') disarm();
});

// Un clic ailleurs que sur l'échiquier ou la palette abandonne la figurine sélectionnée.
document.addEventListener(
  'pointerdown',
  (event) => {
    if (!armed || !event.target.closest) return;
    if (event.target.closest('#board') || event.target.closest('#palette')) return;
    disarm();
  },
  true,
);

function boardClick({ key, piece }) {
  const current = ground.state.pieces.get(key);

  if (armed) {
    // La figurine reste sélectionnée : un clic sur une case libre en pose une nouvelle. Mais un clic sur
    // la case qu'on vient de modifier, ou sur une pièce du même type, continue le cycle ci-dessous
    // (blanche → noire → vide → blanche).
    const sameSquare = cycleMemory && cycleMemory.key === key;
    const sameRole = current && current.role === armed.piece.role;
    if (!sameSquare && !sameRole) {
      const { color, role } = armed.piece;
      ground.setPieces(new Map([[key, { color, role }]]));
      cycleMemory = { key, role };
      onBoardChange();
      return;
    }
  }

  if (current) {
    // la pièce a-t-elle été déplacée entre l'appui et le relâchement ?
    if (!piece || current.color !== piece.color || current.role !== piece.role) return;
    cycleMemory = { key, role: current.role };
    ground.setPieces(
      new Map([[key, current.color === 'white' ? { color: 'black', role: current.role } : undefined]]),
    );
    onBoardChange();
    return;
  }

  // case vide : si elle vient d'être vidée par le cycle, on y remet la pièce blanche
  if (!piece && cycleMemory && cycleMemory.key === key) {
    ground.setPieces(new Map([[key, { color: 'white', role: cycleMemory.role }]]));
    onBoardChange();
  }
}

// ==================================================
// ÉDITION : TRANSLATION DE LA POSITION
// ==================================================

const SHIFT_VECTORS = {
  // (dx, dy) en cases : dy > 0 = vers la rangée 8. Les flèches suivent l'écran,
  // donc le sens s'inverse quand l'échiquier est retourné.
  up: (o) => [0, o],
  down: (o) => [0, -o],
  left: (o) => [-o, 0],
  right: (o) => [o, 0],
};

function shiftVector(direction) {
  const orientation = ground.state.orientation === 'white' ? 1 : -1;
  return SHIFT_VECTORS[direction](orientation);
}

function updateShiftButtons() {
  const grid = placementToGrid(ground.getFen());
  document.querySelectorAll('.shift-btn').forEach((button) => {
    const [dx, dy] = shiftVector(button.dataset.dir);
    button.disabled = locked || !grid || !canShift(grid, dx, dy);
  });
}

function shiftPosition(direction) {
  if (locked) return;
  const grid = placementToGrid(ground.getFen());
  const [dx, dy] = shiftVector(direction);
  const shifted = grid && shiftGrid(grid, dx, dy);
  if (!shifted) return;
  ground.set({ fen: gridToPlacement(shifted) });
  cycleMemory = null;
  onBoardChange();
}

// ==================================================
// ÉDITION : CHAMP FEN
// ==================================================

function syncEditorFen() {
  const placement = ground.getFen();
  const grid = placementToGrid(placement);
  const castling = grid ? sanitizeCastling(grid, editMeta.castling) : '-';
  fenInput.value = buildFen(placement, editMeta.turn, castling, editMeta.half, editMeta.full);
  lastFenText = fenInput.value; // texte écrit par l'application : ne doit pas être relu comme une saisie
  fenInput.classList.remove('invalid');
}

let lastFenText = '';

function applyFenField(options = {}) {
  const text = fenInput.value.trim();
  if (!options.force && text === lastFenText) return false; // simple écho de ce que l'application a écrit
  if (!text) {
    fenInput.classList.remove('invalid');
    return false;
  }
  if (locked && text === game.fen()) return false; // rien n'a changé : on reste en partie

  const parsed = parseFen(text);
  if (!parsed) {
    fenInput.classList.add('invalid');
    showMessage('Ce code FEN n’est pas reconnu.');
    return false;
  }

  hideMessage();
  if (locked) leaveGame();
  currentLibraryPosition = options.libraryPosition || null; // un FEN saisi à la main n'a ni solution ni indice

  const grid = placementToGrid(parsed.placement);
  editMeta = {
    turn: parsed.turn,
    castling: sanitizeCastling(grid, parsed.castling),
    half: parsed.half,
    full: parsed.full,
  };

  ground.set({ fen: parsed.placement });
  cycleMemory = null;
  resetMarks();
  discardSuspendedIfModified();
  syncEditorFen();
  updateShiftButtons();
  setPositionTitle(options.title);

  // le FEN indique le trait : la partie démarre aussitôt (cliquer sur le bouton Trait
  // sélectionné ramène à l'édition, l'autre bouton change le trait)
  if (parsed.hasTurn) {
    if (!playerSide) setPlayerSide('analysis');
    onStartClick(parsed.turn);
  }
  return true;
}

fenInput.addEventListener('change', () => applyFenField());
fenInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') applyFenField();
});
fenInput.addEventListener('paste', () => setTimeout(() => applyFenField(), 0));

setupSettings({ button: $('#settings-btn'), menu: $('#settings-menu') });

setupLibrary({
  button: $('#library-btn'),
  menu: $('#library-menu'),
  onSelect: (position) => {
    // chaque position chargée repart en mode « analyse » (Roi bicolore), même si l'on jouait un camp contre Stockfish
    setPlayerSide('analysis');
    fenInput.value = position.fen;
    applyFenField({ title: position.title, force: true, libraryPosition: position });
  },
});

// ==================================================
// CHAMP PGN : afficher une partie ou une position
// ==================================================
//
// Le texte est lu avec ses variantes ; il s'ouvre en mode analyse.
// Avec un en-tête [FEN] on affiche la position de départ, sinon la fin de la partie.
// ==================================================

let lastPgn = '';

function loadPgn(raw, options = {}) {
  const text = String(raw || '').trim();
  if (!text) {
    pgnInput.classList.remove('invalid');
    return false;
  }

  const result = parsePgn(text, Chess);
  if (!result.root || (options.strict && result.error)) {
    pgnInput.classList.add('invalid');
    showMessage(result.error || 'PGN illisible.', 'error', pgnMessage);
    return false;
  }
  pgnInput.classList.remove('invalid');
  if (!options.preserveCourse) {
    currentXpgnCourse = null;
    currentXpgnGames = [];
    currentXpgnMainPgn = null;
    currentXpgnCourseOnly = false;
  }
  if (!options.fromSolution) currentLibraryPosition = null; // un PGN collé n'est plus la position de la bibliothèque

  cancelPromotion();
  invalidate();
  setPlayerSide('analysis'); // consulter une partie : les deux camps, sans Stockfish

  resetMarks();
  currentStartFen = result.startFen;
  rootNode = result.root;
  suspended = null;
  const target = result.hasFen ? result.root : result.endNode;
  if (!rebuildGameToNode(target)) {
    showMessage('Impossible d’afficher cette position.', 'error', pgnMessage);
    return false;
  }
  currentNode = target;
  marks.setItems(currentNode.xpgnAnnotations || []);

  locked = true;
  document.body.classList.add('locked');
  disarm();
  cycleMemory = null;
  applyLockedBoardConfig();
  fenInput.classList.remove('invalid');
  setPositionTitle(result.title);
  afterPosition();

  if (result.error) showMessage(result.error + ' Les coups précédents sont affichés.', 'error', pgnMessage);
  else showMessage(result.moveCount + (result.moveCount > 1 ? ' coups lus' : ' coup lu') + (result.hasFen ? ' (position de départ affichée)' : ' (fin de partie affichée)'), 'info', pgnMessage);
  return true;
}

pgnInput.addEventListener('paste', (event) => {
  const raw = event.clipboardData ? event.clipboardData.getData('text') : '';
  if (!raw) return;
  event.preventDefault(); // un champ d'une ligne perdrait les retours à la ligne du PGN
  pgnInput.value = raw.replace(/\s+/g, ' ').trim();
  lastPgn = pgnInput.value;
  loadPgn(raw);
});
pgnInput.addEventListener('change', () => {
  if (pgnInput.value.trim() === lastPgn) return;
  lastPgn = pgnInput.value.trim();
  loadPgn(pgnInput.value);
});
pgnInput.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  lastPgn = pgnInput.value.trim();
  loadPgn(pgnInput.value);
});

// ==================================================
// START : FIGER LA POSITION / REVENIR À L'ÉDITION
// ==================================================

/** Contrôle de légalité : le camp qui n'a pas le trait ne doit pas être en échec. */
function legalityError(placement, turn) {
  const other = turn === 'w' ? 'b' : 'w';
  const probe = new Chess();
  if (!probe.load(buildFen(placement, other))) return 'Cette position n’est pas valide.';
  if (probe.in_check()) {
    return 'Position illégale : le camp qui n’a pas le trait est en échec.';
  }
  return null;
}

/**
 * Indicateur de trait (disposition paysage) : disque blanc dans le prolongement de la rangée 1,
 * ou disque noir dans celui de la rangée 8.
 */
function updateTurnDisc() {
  const disc = $('#turn-disc');
  if (!disc) return;
  if (!locked) {
    disc.className = 'turn-disc';
    return;
  }
  const white = game.turn() === 'w';
  const flipped = ground.state.orientation === 'black';
  const atTop = white ? flipped : !flipped;
  disc.className = 'turn-disc ' + (white ? 'white' : 'black') + (atTop ? ' at-top' : ' at-bottom');
}

function updateStartButtons() {
  updateTurnDisc();
  $('.clock').dataset.turn = locked ? game.turn() : editMeta.turn; // le bouton du camp au trait est relevé
  for (const turn of ['w', 'b']) {
    const active = locked && game.turn() === turn;
    const name = turn === 'w' ? 'Les Blancs' : 'Les Noirs';
    startButtons[turn].classList.toggle('active', active);
    startButtons[turn].setAttribute('aria-pressed', active ? 'true' : 'false');
    startButtons[turn].title = !locked
      ? 'Trait aux ' + (turn === 'w' ? 'Blancs' : 'Noirs') + ' : démarrer sur cette position'
      : active
        ? 'Trait aux ' + (turn === 'w' ? 'Blancs' : 'Noirs') + ' : revenir à l’édition de la position'
        : 'Trait aux ' + (turn === 'w' ? 'Blancs' : 'Noirs') + ' : passer le trait à ce camp sans déplacer de pièce (coup nul « -- »)';
  }
}

/**
 * Change le trait depuis la position affichée : le camp qui devait jouer « passe »
 * (coup nul « -- ») et l'historique est conservé dans une sous-variante entre crochets.
 */
function changeTrait(turn) {
  if (turn === game.turn()) return;
  cancelPromotion();

  const parts = game.fen().split(' ');
  const passing = game.turn();
  const error = legalityError(parts[0], turn);
  if (error) {
    showMessage(error);
    return;
  }

  const half = (parseInt(parts[4] || '0', 10) || 0) + 1;
  const full = (parseInt(parts[5] || '1', 10) || 1) + (passing === 'b' ? 1 : 0);
  const nullFen = buildFen(parts[0], turn, parts[2], half, full);
  if (!game.load(nullFen)) {
    showMessage('Cette position n’est pas valide.');
    syncBoard();
    return;
  }
  hideMessage();

  const nullMove = { color: passing, from: null, to: null, san: '--', promotion: null, nullMove: true };
  let child = findChild(currentNode, nullMove);
  if (!child) {
    child = { parent: currentNode, move: nullMove, source: 'trait', children: [], fen: game.fen(), selectedChild: null, comment: null };
    currentNode.children.push(child);
  }
  inheritXpgnAnnotations(currentNode, child);
  currentNode.selectedChild = child;
  currentNode = child;
  marks.setItems(currentNode.xpgnAnnotations || []);
  child.fen = game.fen();
  afterPosition();
}

function requireMode() {
  showMessage('Choisissez d’abord un mode de jeu (Blancs, Noirs ou analyse) avec les boutons « Jeu ».');
  const group = $('.cell-play .button-group');
  group.classList.remove('attention');
  void group.offsetWidth; // relance l'animation
  group.classList.add('attention');
}

function onStartClick(turn) {
  if (locked) {
    // bouton du camp au trait : retour à l'édition ; autre bouton : changement de trait
    if (game.turn() === turn) leaveGame();
    else changeTrait(turn);
    return;
  }

  if (!playerSide) {
    requireMode();
    return;
  }

  // position inchangée depuis la sortie de la partie : on la reprend, coups conservés
  if (suspended && rootNode) {
    resumeGame(turn);
    return;
  }

  const placement = ground.getFen();
  const grid = placementToGrid(placement);
  const error = (grid && validateStructure(grid)) || legalityError(placement, turn);
  if (error) {
    showMessage(error);
    return;
  }

  hideMessage();
  const castling = sanitizeCastling(grid, editMeta.castling);
  const fen = buildFen(placement, turn, castling, editMeta.half, editMeta.full);
  if (!game.load(fen)) {
    showMessage('Cette position n’est pas valide.');
    return;
  }

  enterGame(game.fen());
}

/** Réglages de l'échiquier en mode partie. */
function applyLockedBoardConfig() {
  ground.set({
    highlight: { lastMove: true, check: true },
    draggable: { enabled: true, deleteOnDropOff: false },
    selectable: { enabled: !marks.isActive() },
    movable: { free: false, showDests: true },
  });
}

/** Passe en mode partie à partir d'un FEN (nouvelle racine, variantes effacées). */
function enterGame(fen) {
  game.load(fen);
  currentStartFen = game.fen();
  rootNode = createRoot();
  currentNode = rootNode;
  marks.setItems(currentNode.xpgnAnnotations || []);
  suspended = null;
  locked = true;
  document.body.classList.add('locked');
  disarm();
  cycleMemory = null;

  applyLockedBoardConfig();
  fenInput.classList.remove('invalid');
  afterPosition();
}

/** Reprend la partie là où on l'avait laissée (les coups n'ont pas été effacés). */
function resumeGame(turn) {
  if (!rebuildGameToNode(currentNode)) {
    showMessage('Impossible de reprendre la partie.');
    return;
  }
  suspended = null;
  locked = true;
  document.body.classList.add('locked');
  disarm();
  cycleMemory = null;

  applyLockedBoardConfig();
  fenInput.classList.remove('invalid');
  hideMessage();
  if (turn !== game.turn()) changeTrait(turn);
  else afterPosition();
}

/** Retour au mode édition, sur la position EN COURS (les coups restent affichés). */
function leaveGame() {
  invalidate();
  const parts = game.fen().split(' ');
  const grid = placementToGrid(parts[0]);
  editMeta = {
    turn: parts[1],
    castling: sanitizeCastling(grid, parts[2]),
    half: parseInt(parts[4] || '0', 10) || 0,
    full: parseInt(parts[5] || '1', 10) || 1,
  };
  suspended = { placement: parts[0] };

  locked = false;
  document.body.classList.remove('locked');
  pendingPromotion = null;
  hidePromotion();

  ground.set({
    fen: parts[0],
    lastMove: null,
    check: false,
    turnColor: 'white',
    highlight: { lastMove: false, check: false },
    draggable: { enabled: true, deleteOnDropOff: true },
    selectable: { enabled: false },
    movable: { free: true, color: 'both', showDests: false, dests: new Map() },
  });
  ground.cancelMove();
  ground.setAutoShapes([]);
  cycleMemory = null;

  updateStartButtons();
  updateMoves();
  updateNavigation();
  updateZoneAvailability();
  clearZone();
  clearEvaluation();
  syncEditorFen();
  updateShiftButtons();
  setStatus('Position éditable');
}

// ==================================================
// ARBRE DES COUPS (repris de cc2)
// ==================================================

function createRoot() {
  return { parent: null, move: null, source: 'root', children: [], fen: game.fen(), selectedChild: null, comment: null };
}

function createNode(parent, move, source) {
  return {
    parent,
    move: { color: move.color, from: move.from, to: move.to, san: move.san, promotion: move.promotion || null, nullMove: false },
    source,
    children: [],
    fen: game.fen(),
    selectedChild: null,
    comment: null,
    xpgnAnnotations: (parent.xpgnAnnotations || []).map((item) => ({ ...item })),
  };
}

function findChild(node, move) {
  return node.children.find(
    (child) =>
      child.move.from === move.from && child.move.to === move.to && (child.move.promotion || null) === (move.promotion || null),
  );
}

function getPath(node) {
  const path = [];
  for (let current = node; current && current.parent; current = current.parent) path.unshift(current);
  return path;
}

function getMainChild(node) {
  return node && node.children.length > 0 ? node.children[0] : null;
}

function rebuildGameToNode(node) {
  if (!game.load(currentStartFen)) return false;
  for (const child of getPath(node)) {
    if (child.move.nullMove) {
      if (!game.load(child.fen)) return false;
      continue;
    }
    const move = game.move({ from: child.move.from, to: child.move.to, promotion: child.move.promotion || 'q' });
    if (!move) return false;
  }
  return true;
}

function getLastMoveSquares() {
  return currentNode && currentNode.move && !currentNode.move.nullMove ? [currentNode.move.from, currentNode.move.to] : [];
}

function terminationComment() {
  if (game.in_checkmate()) return 'Mat';
  if (game.in_stalemate()) return 'Pat';
  if (game.insufficient_material()) return 'Nulle - Matériel';
  if (game.in_threefold_repetition()) return 'Nulle - Répétition';
  if (parseInt(game.fen().split(' ')[4] || '0', 10) >= 100) return 'Nulle - 50 coups';
  return 'Partie terminée';
}

function commitMove(move, source) {
  let child = findChild(currentNode, move);
  if (!child) {
    child = createNode(currentNode, move, source);
    currentNode.children.push(child);
  } else {
    inheritXpgnAnnotations(currentNode, child);
  }
  currentNode.selectedChild = child;
  currentNode = child;
  marks.setItems(currentNode.xpgnAnnotations || []);
  child.fen = game.fen();
  if (game.game_over()) child.comment = terminationComment();
  afterPosition();
}

function showNode(node) {
  if (!locked) return;
  cancelPromotion();
  if (!rebuildGameToNode(node)) return;
  currentNode = node;
  marks.setItems(currentNode.xpgnAnnotations || []);
  afterPosition();
}

// ==================================================
// RÈGLES DE JEU
// ==================================================

const isAnalysisMode = () => playerSide === 'analysis';
const playerColor = () => (isAnalysisMode() ? 'both' : playerSide);

function isPlayerTurn() {
  if (isAnalysisMode()) return true;
  return playerSide === 'white' ? game.turn() === 'w' : game.turn() === 'b';
}

function canUserMove() {
  return locked && !thinking && !pendingPromotion && !game.game_over() && isPlayerTurn();
}

function getDests() {
  const dests = new Map();
  for (const move of game.moves({ verbose: true })) {
    if (!dests.has(move.from)) dests.set(move.from, []);
    dests.get(move.from).push(move.to);
  }
  return dests;
}

/** Annule tout calcul en cours : à appeler à chaque changement de position. */
function invalidate() {
  moveToken++;
  evalId++;
  thinking = false;
  engine.cancel();
  resetAnalysis();
}

/** Cercles et flèches fournis par le PGN pour la position affichée. */
function syncShapes() {
  const shapes = locked && currentNode && currentNode.shapes ? currentNode.shapes : [];
  ground.setAutoShapes(shapes.map((shape) => ({ orig: shape.orig, dest: shape.dest, brush: shape.brush })));
}

/** Aligne l'échiquier sur la position de chess.js. */
function syncBoard() {
  const turn = game.turn() === 'w' ? 'white' : 'black';
  ground.set({
    fen: game.fen(),
    turnColor: turn,
    lastMove: getLastMoveSquares(),
    check: game.in_check() ? turn : false,
    movable: { free: false, color: playerColor(), showDests: true, dests: canUserMove() ? getDests() : new Map() },
  });
}

/** Tout ce qui doit être rafraîchi après un changement de position. */
function afterPosition() {
  invalidate();
  for (let node = currentNode; node; node = node.parent) node.collapsed = false; // la position affichée reste visible
  syncBoard();
  syncShapes();
  updateMoves();
  updateNavigation();
  updateStartButtons();
  updateZoneAvailability();
  clearZone();
  fenInput.value = game.fen();
  lastFenText = fenInput.value;
  fenInput.classList.remove('invalid');

  const engineToMove = !game.game_over() && !isAnalysisMode() && !isPlayerTurn();

  if (game.game_over()) {
    setStatus((currentNode && currentNode.comment) || terminationComment());
  } else if (isAnalysisMode()) {
    setStatus('Mode analyse');
  } else {
    setStatus(engineToMove ? 'Stockfish va jouer' : 'À vous de jouer');
  }

  requestEvaluation({ tablebaseOnly: engineToMove });
  if (engineToMove) askStockfish();
}

// ==================================================
// COUP DU JOUEUR ET PROMOTION
// ==================================================

function isPromotionMove(from, to) {
  const piece = game.get(from);
  return Boolean(piece && piece.type === 'p' && (to[1] === '8' || to[1] === '1'));
}

function playerMove(orig, dest) {
  if (thinking || pendingPromotion || !isPlayerTurn()) {
    syncBoard();
    return;
  }
  if (isPromotionMove(orig, dest)) {
    showPromotionChoice(orig, dest);
    return;
  }
  const move = game.move({ from: orig, to: dest });
  if (!move) {
    syncBoard();
    return;
  }
  commitMove(move, isAnalysisMode() ? 'analysis' : 'player');
}

function showPromotionChoice(from, to) {
  pendingPromotion = { from, to, color: game.turn() };
  ground.set({ movable: { dests: new Map() } });

  const choices = $('#promotion-choices');
  choices.innerHTML = '';
  for (const [type, title] of [['q', 'Dame'], ['r', 'Tour'], ['b', 'Fou'], ['n', 'Cavalier']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'promotion-piece';
    button.title = title;
    button.setAttribute('aria-label', title);
    const image = document.createElement('img');
    image.src = asset('pieces/alpha/' + pendingPromotion.color + type.toUpperCase() + '.svg');
    image.alt = title;
    button.appendChild(image);
    button.addEventListener('click', () => completePromotion(type));
    choices.appendChild(button);
  }
  const modal = $('#promotion-modal');
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
}

function hidePromotion() {
  const modal = $('#promotion-modal');
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  $('#promotion-choices').innerHTML = '';
}

function cancelPromotion() {
  pendingPromotion = null;
  hidePromotion();
}

function completePromotion(promotion) {
  if (!pendingPromotion) return;
  const { from, to } = pendingPromotion;
  cancelPromotion();
  const move = game.move({ from, to, promotion });
  if (!move) {
    syncBoard();
    return;
  }
  commitMove(move, isAnalysisMode() ? 'analysis' : 'player');
}

$('#promotion-cancel').addEventListener('click', () => {
  cancelPromotion();
  if (locked) syncBoard();
});

// ==================================================
// STOCKFISH JOUE (tables de finales en premier, comme dans cc2)
// ==================================================

function findImmediateCheckmate() {
  for (const candidate of game.moves({ verbose: true })) {
    const replay = new Chess();
    replay.load(game.fen());
    const move = replay.move({ from: candidate.from, to: candidate.to, promotion: candidate.promotion });
    if (move && replay.in_checkmate()) return candidate.from + candidate.to + (candidate.promotion || '');
  }
  return null;
}

async function bestTablebaseMove(fen) {
  if (!isCovered(fen)) return null;
  try {
    const data = await getTablebase(fen);
    const first = data.moves.find((move) => move && move.uci);
    return first ? first.uci : null;
  } catch (error) {
    return null; // hors ligne ou position non couverte : Stockfish prend le relais
  }
}

async function askStockfish() {
  if (isAnalysisMode() || game.game_over()) return;

  thinking = true;
  const token = ++moveToken;
  const fen = game.fen();
  const sideToMove = game.turn();
  updateMoves();
  syncBoard();
  setStatus('Stockfish réfléchit…');

  const mate = findImmediateCheckmate();
  if (mate) {
    playEngineMove(mate, token);
    return;
  }

  const tablebaseMove = await bestTablebaseMove(fen);
  if (token !== moveToken) return;
  if (tablebaseMove) {
    playEngineMove(tablebaseMove, token);
    return;
  }

  engine.search({
    fen,
    depth: 20,
    movetime: 20000,
    onInfo: (line) => showEngineEvaluation(line, sideToMove, token),
    onBest: (uci) => playEngineMove(uci, token),
  });
}

function playEngineMove(uci, token) {
  if (token !== moveToken || !thinking || isAnalysisMode()) return;
  const move = game.move({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci.slice(4, 5) : undefined,
  });
  thinking = false;
  if (!move) {
    syncBoard();
    updateMoves();
    return;
  }
  commitMove(move, 'stockfish');
}

// ==================================================
// ÉVALUATION (gélule) : Stockfish + tables de finales
// ==================================================

function setHead(text, sub) {
  evalHead.innerHTML = text ? escapeHtml(text) + (sub ? `<span class="sub">${escapeHtml(sub)}</span>` : '') : '';
}

function clearEvaluation() {
  evalId++;
  tbList = null;
  panelWanted = null;
  updateAnalysis();
  evalHead.innerHTML = '';
  evalMoves.innerHTML = '';
}

function showEngineEvaluation(line, sideToMove, token) {
  if (!evalOn || token !== moveToken) return;
  const text = evaluationFromInfo(line, sideToMove);
  if (!text) return;
  const depth = depthFromInfo(line);
  setHead(text, 'Stockfish' + (depth ? ' · profondeur ' + depth : ''));
}

function describeTablebase(tb, fen) {
  const side = fen.split(' ')[1] === 'w' ? 'white' : 'black';
  const other = side === 'white' ? 'black' : 'white';

  if (tb.checkmate) return { text: side === 'white' ? '0-1' : '1-0', sub: 'Mat' };
  if (tb.stalemate) return { text: '0.00', sub: 'Pat · Nulle' };

  switch (tb.category) {
    case 'draw':
      return { text: '0.00', sub: 'Nulle · tablebases' };
    case 'cursed-win':
    case 'blessed-loss':
      return { text: '0.00', sub: 'Nulle · règle des 50 coups' };
    case 'win':
    case 'loss': {
      const winner = tb.category === 'win' ? side : other;
      const label = winner === 'white' ? 'Blancs gagnent' : 'Noirs gagnent';
      if (Number.isFinite(tb.dtm) && tb.dtm !== 0) {
        return { text: mateText(winner, tb.dtm), sub: label + ' · tablebases' };
      }
      return { text: label, sub: 'Tablebases', winner, label };
    }
    default:
      return null; // résultat inconnu : Stockfish reste l'évaluation de secours
  }
}

async function requestEvaluation({ tablebaseOnly = false } = {}) {
  const id = ++evalId;
  tbList = null;
  panelWanted = null;
  evalHead.innerHTML = '';
  evalMoves.innerHTML = '';

  if (!evalOn || !locked) {
    updateAnalysis();
    return;
  }

  const fen = game.fen();
  const sideToMove = game.turn();

  if (game.game_over()) {
    if (game.in_checkmate()) setHead(sideToMove === 'w' ? '0-1' : '1-0', 'Mat');
    else setHead('0.00', 'Nulle');
    return;
  }

  let tb = null;
  if (isCovered(fen)) {
    try {
      tb = await getTablebase(fen);
    } catch (error) {
      tb = null;
    }
    if (id !== evalId) return;
  }

  const described = tb && describeTablebase(tb, fen);

  if (described) {
    setHead(described.text, described.sub);
    tbList = annotateMoves(game, tb);
    renderTablebaseMoves();

    if (described.winner) {
      // pas de DTM dans les tables : on suit la ligne principale jusqu'au mat
      const mate = await getMainlineMate(fen, described.winner);
      if (id === evalId && mate) setHead(mate, described.label + ' · tablebases');
    }
    return;
  }

  if (tb) {
    tbList = annotateMoves(game, tb);
    renderTablebaseMoves();
  }

  if (!tablebaseOnly) {
    // Stockfish évalue chaque coup légal (MultiPV) : en-tête et liste viennent de la même recherche
    panelWanted = { key: 'panel|' + fen, fen, ucis: legalUcis(), restrict: false, depth: PANEL_DEPTH, movetime: PANEL_MOVETIME };
    renderAnalysis();
    updateAnalysis();
  }
}

function verdictText(move) {
  if (move.outcome === null) return '<small>inconnu</small>';
  if (move.outcome === 'draw') return move.fifty ? 'Nulle <small>(50 coups)</small>' : 'Nulle';

  // « Blancs gagnent » / « Blancs perdent » : le sujet est le camp qui joue le coup
  const side = move.color === 'w' ? 'Blancs' : 'Noirs';
  let text = side + (move.outcome === 'win' ? ' gagnent' : ' perdent');
  if (move.dtm !== null && move.dtm !== 0) {
    // dtm : demi-coups mesurés après le coup, du point de vue de l'adversaire
    text += ` <small>#${Math.ceil((Math.abs(move.dtm) + 1) / 2)}</small>`;
  }
  return text;
}

function renderTablebaseMoves() {
  if (!tbList || tbList.length === 0) {
    evalMoves.innerHTML = '';
    return;
  }

  const playable = canUserMove();
  const table = document.createElement('table');
  table.className = 'tb-list';

  for (const move of tbList) {
    const row = document.createElement('tr');
    row.className = 'tb-row ' + (move.outcome || 'unknown') + (playable ? ' playable' : '');
    row.title = 'Résultat théorique après ce coup (tablebases)';

    const sanCell = document.createElement('td');
    const converted = convertSan(move.san, move.color === 'w' ? 'white' : 'black');
    if (notationMode() === 'figurines') sanCell.innerHTML = converted;
    else sanCell.textContent = converted;

    const verdictCell = document.createElement('td');
    verdictCell.className = 'verdict';
    verdictCell.innerHTML = verdictText(move);

    row.append(sanCell, verdictCell);
    if (playable) {
      row.addEventListener('click', () => {
        if (!canUserMove()) return;
        const played = game.move({ from: move.from, to: move.to, promotion: move.promotion || undefined });
        if (played) commitMove(played, isAnalysisMode() ? 'analysis' : 'player');
      });
    }
    table.appendChild(row);
  }

  evalMoves.innerHTML = '';
  evalMoves.appendChild(table);
}

evalPill.addEventListener('click', () => {
  evalOn = !evalOn;
  evalPill.classList.toggle('active', evalOn);
  evalPill.setAttribute('aria-expanded', evalOn ? 'true' : 'false');
  evalPill.title = evalOn ? 'Masquer l’évaluation' : 'Afficher l’évaluation';

  if (!evalOn) {
    if (!thinking) engine.cancel();
    clearEvaluation();
    return;
  }
  if (!locked) {
    showMessage('Choisissez le camp au trait (boutons Trait) pour évaluer la position.', 'info');
    return;
  }
  // pendant que Stockfish joue, son calcul alimente déjà l'évaluation
  requestEvaluation({ tablebaseOnly: thinking });
});

// ==================================================
// WINNING ZONE
// ==================================================

function zoneAvailable() {
  // en analyse : toujours ; en partie contre Stockfish : quand c'est à vous de jouer
  return locked && !game.game_over() && (isAnalysisMode() || isPlayerTurn());
}

function updateZoneAvailability() {
  zoneButton.classList.toggle('active', zoneOn);
  zoneButton.setAttribute('aria-pressed', zoneOn ? 'true' : 'false');
  zoneButton.classList.toggle('unavailable', !zoneAvailable());
}

function clearZone() {
  zoneSig = '';
  zoneCells.clear();
  zoneLayer.innerHTML = '';
  if (zoneWanted) {
    zoneWanted = null;
    updateAnalysis();
  }
}

/**
 * Cases que la pièce choisie pourrait occuper « si on pouvait la poser » :
 * toutes les cases de l'échiquier, sauf pour le Fou (cases de sa couleur)
 * et le Pion (sa colonne, rangées 2 à 7).
 */
function candidateSquares(selected, piece) {
  const squares = [];
  const selFile = selected.charCodeAt(0) - 97;
  const selRank = parseInt(selected[1], 10) - 1;
  for (let file = 0; file < 8; file++) {
    for (let rank = 0; rank < 8; rank++) {
      if (file === selFile && rank === selRank) continue;
      if (piece.type === 'b' && (file + rank) % 2 !== (selFile + selRank) % 2) continue;
      if (piece.type === 'p' && (file !== selFile || rank === 0 || rank === 7)) continue;
      squares.push('abcdefgh'[file] + (rank + 1));
    }
  }
  return squares;
}

/**
 * Position obtenue en posant la pièce sur `target`, trait à l'adversaire.
 * Renvoie null si cette position est impossible (case occupée par une pièce
 * du même camp ou par le Roi adverse, Roi du joueur en échec, etc.).
 */
function hypotheticalFen(selected, target) {
  const mover = game.turn();
  const opponent = mover === 'w' ? 'b' : 'w';
  const grid = placementToGrid(game.fen().split(' ')[0]);
  const at = (square) => [8 - parseInt(square[1], 10), square.charCodeAt(0) - 97];

  const [sr, sf] = at(selected);
  const letter = grid[sr][sf];
  grid[sr][sf] = '';

  const [tr, tf] = at(target);
  const occupant = grid[tr][tf];
  if (occupant) {
    const occupantIsWhite = occupant === occupant.toUpperCase();
    if (occupantIsWhite === (mover === 'w')) return null; // pièce du même camp
    if (occupant.toLowerCase() === 'k') return null; // Roi adverse
  }
  grid[tr][tf] = letter;

  const placement = gridToPlacement(grid);
  // le joueur ne doit pas être en échec une fois la pièce posée
  const probe = new Chess();
  if (!probe.load(buildFen(placement, mover)) || probe.in_check()) return null;

  return buildFen(placement, opponent);
}

/** Résultat pour le joueur : 'win' | 'draw' | 'loss' | null. */
async function hypotheticalOutcome(fen) {
  const probe = new Chess();
  if (!probe.load(fen)) return null;
  if (probe.in_checkmate()) return 'win';
  if (probe.in_stalemate() || probe.insufficient_material()) return 'draw';

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const data = await getTablebase(fen);
      return moveOutcomeOf(data); // la catégorie de la position vaut pour l'adversaire
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
    }
  }
  return null;
}

const zoneCells = new Map(); // case → élément coloré

function setZoneCell(square, outcome) {
  const known = zoneCells.get(square);
  if (known) {
    known.className = 'zone-cell ' + outcome;
    return;
  }
  addZoneCell(square, outcome);
}

function addZoneCell(square, outcome) {
  const white = ground.state.orientation === 'white';
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1], 10) - 1;
  const cell = document.createElement('div');
  cell.className = 'zone-cell ' + outcome;
  cell.dataset.square = square;
  cell.style.left = (white ? file : 7 - file) * 12.5 + '%';
  cell.style.top = (white ? 7 - rank : rank) * 12.5 + '%';
  zoneLayer.appendChild(cell);
  zoneCells.set(square, cell);
}

const ZONE_CONCURRENCY = 4;
// ==================================================
// ANALYSE STOCKFISH PAR COUP (MultiPV) : panneau et zones
// ==================================================
//
// Une seule recherche donne l'évaluation de chaque coup légal (ou de ceux de
// la pièce choisie, avec « searchmoves »). Le panneau d'évaluation et les
// couleurs de la zone lisent les mêmes valeurs : ils sont donc cohérents.
// ==================================================

const PANEL_DEPTH = 18; // tous les coups légaux
const PANEL_MOVETIME = 15000;
const ZONE_DEPTH = 22; // coups de la pièce choisie : moins de lignes, donc plus profond
const ZONE_MOVETIME = 15000;
const MAX_LINES = 40;

let analysisEngine = null; // second Stockfish, réservé à l'analyse (créé à la demande)
const analysisCache = new Map(); // fen → Map(coup UCI → { score, depth }), score du point de vue du joueur
let analysisRunning = null; // clé de la recherche en cours
const analysisFinished = new Set();
let panelWanted = null;
let zoneWanted = null;
let renderTimer = null;

function getAnalysisEngine() {
  if (!analysisEngine) analysisEngine = new Engine(asset('stockfish/stockfish-18-lite-single.js'));
  return analysisEngine;
}

const legalUcis = () => game.moves({ verbose: true }).map(uciOf);

function resetAnalysis() {
  if (analysisEngine) analysisEngine.cancel();
  analysisRunning = null;
  analysisFinished.clear();
  panelWanted = null;
  zoneWanted = null;
}

/** Classe un score (point de vue du joueur) selon le code couleur de la zone. */
function classifyScore(score) {
  if (score.mate !== undefined) return score.mate > 0 ? 'win' : 'loss';
  const cp = score.cp;
  if (cp === 0) return 'draw'; // jaune : 0.00
  if (cp >= 100) return 'win'; // vert : +1.00 ou plus
  if (cp > 0) return 'plus'; // bleu : entre 0.00 et +1.00
  if (cp <= -100) return 'loss'; // rose : -1.00 ou moins
  return 'minus'; // orange : entre -1.00 et 0.00
}

function recordInfo(fen, info) {
  if (!analysisCache.has(fen)) analysisCache.set(fen, new Map());
  const entries = analysisCache.get(fen);
  const known = entries.get(info.move);
  if (known && known.depth > info.depth) return false;
  entries.set(info.move, { score: info.score, depth: info.depth });
  return true;
}

/** Choisit la recherche à mener : la zone d'abord, sinon le panneau. */
function updateAnalysis() {
  const job = [zoneWanted, panelWanted].find((candidate) => candidate && !analysisFinished.has(candidate.key));

  if (!job) {
    if (analysisRunning && analysisEngine) analysisEngine.cancel();
    analysisRunning = null;
    return;
  }
  if (job.key === analysisRunning) return;

  analysisRunning = job.key;
  getAnalysisEngine().search({
    fen: job.fen,
    multipv: Math.min(job.ucis.length, MAX_LINES),
    searchmoves: job.restrict ? job.ucis : undefined,
    depth: job.depth,
    movetime: job.movetime,
    onInfo: (line) => {
      const info = parseInfo(line);
      if (info && recordInfo(job.fen, info)) scheduleRender();
    },
    onBest: () => {
      if (analysisRunning !== job.key) return;
      analysisRunning = null;
      analysisFinished.add(job.key);
      renderAnalysis();
      updateAnalysis(); // reprend la recherche du panneau si la zone l'avait interrompue
    },
  });
}

function scheduleRender() {
  if (renderTimer) return;
  renderTimer = setTimeout(() => {
    renderTimer = null;
    renderAnalysis();
  }, 120);
}

/** Met à jour le panneau et la zone à partir des valeurs mémorisées. */
function renderAnalysis() {
  const fen = game.fen();
  const entries = analysisCache.get(fen);
  if (!entries) return;
  if (zoneWanted && zoneWanted.fen === fen) paintEngineZone(entries);
  if (panelWanted && panelWanted.fen === fen && evalOn) renderEngineMoves(entries);
}

function renderEngineMoves(entries) {
  const turn = game.turn();
  const legal = new Map(game.moves({ verbose: true }).map((move) => [uciOf(move), move]));
  const rows = [...entries]
    .filter(([uci]) => legal.has(uci))
    .map(([uci, entry]) => ({ move: legal.get(uci), score: entry.score, depth: entry.depth }))
    .sort((a, b) => scoreValue(b.score) - scoreValue(a.score));
  if (rows.length === 0) return;

  // en-tête : meilleur coup (même recherche que la liste)
  const depth = Math.max(...rows.map((row) => row.depth));
  setHead(formatScore(rows[0].score, turn), 'Stockfish · profondeur ' + depth);

  const playable = canUserMove();
  const table = document.createElement('table');
  table.className = 'tb-list';
  for (const { move, score, depth: rowDepth } of rows) {
    const row = document.createElement('tr');
    row.className = 'tb-row ' + classifyScore(score) + (playable ? ' playable' : '');
    row.title = 'Évaluation de Stockfish après ce coup (point de vue des Blancs), profondeur ' + rowDepth;

    const sanCell = document.createElement('td');
    const converted = convertSan(move.san, move.color === 'w' ? 'white' : 'black');
    if (notationMode() === 'figurines') sanCell.innerHTML = converted;
    else sanCell.textContent = converted;

    const valueCell = document.createElement('td');
    valueCell.className = 'verdict';
    valueCell.textContent = formatScore(score, turn);

    row.append(sanCell, valueCell);
    if (playable) {
      row.addEventListener('click', () => {
        if (!canUserMove()) return;
        const played = game.move({ from: move.from, to: move.to, promotion: move.promotion || undefined });
        if (played) commitMove(played, isAnalysisMode() ? 'analysis' : 'player');
      });
    }
    table.appendChild(row);
  }
  evalMoves.innerHTML = '';
  evalMoves.appendChild(table);
}

/** Zone Stockfish : meilleure évaluation parmi les coups menant à chaque case. */
function paintEngineZone(entries) {
  const best = new Map();
  for (const [uci, entry] of entries) {
    if (!zoneWanted.ucis.includes(uci)) continue;
    const square = uci.slice(2, 4);
    const known = best.get(square);
    if (!known || scoreValue(entry.score) > scoreValue(known)) best.set(square, entry.score);
  }
  for (const [square, score] of best) setZoneCell(square, classifyScore(score));
}

/** Avec tablebases : cases accessibles d'abord (une seule requête), puis toutes les autres. */
async function tablebaseZone(selected, piece, signature, tb) {
  const painted = new Set();

  // 1. Cases directement accessibles : résultats déjà fournis par la position courante.
  const direct = new Map();
  for (const move of tb.moves) {
    if (move.uci.slice(0, 2) !== selected) continue;
    const outcome = moveOutcomeOf(move);
    if (!outcome) continue;
    const square = move.uci.slice(2, 4);
    const known = direct.get(square);
    if (!known || OUTCOME_PRIORITY[outcome] > OUTCOME_PRIORITY[known]) direct.set(square, outcome);
  }
  for (const [square, outcome] of direct) {
    addZoneCell(square, outcome);
    painted.add(square);
  }

  // 2. Cases que la pièce ne peut pas atteindre : une requête par position hypothétique.
  const jobs = candidateSquares(selected, piece)
    .filter((square) => !painted.has(square))
    .map((square) => ({ square, fen: hypotheticalFen(selected, square) }))
    .filter((job) => job.fen);

  let failures = 0;
  let next = 0;
  async function worker() {
    while (zoneSig === signature && next < jobs.length) {
      const job = jobs[next++];
      const outcome = await hypotheticalOutcome(job.fen);
      if (zoneSig !== signature) return;
      if (outcome) addZoneCell(job.square, outcome);
      else failures++;
    }
  }
  await Promise.all(Array.from({ length: ZONE_CONCURRENCY }, worker));

  if (zoneSig === signature && failures > 0) {
    showMessage('Tablebases : ' + failures + ' case(s) non évaluée(s) (service indisponible ou saturé).');
  }
}

const OUTCOME_PRIORITY = { win: 3, draw: 2, loss: 1 };

async function refreshZone() {
  const selected = ground.state.selected;
  if (!zoneOn || !zoneAvailable() || !selected) {
    clearZone();
    return;
  }
  const piece = game.get(selected);
  if (!piece || piece.color !== game.turn()) {
    clearZone();
    return;
  }

  const fen = game.fen();
  const signature = selected + '|' + fen + '|' + ground.state.orientation;
  if (signature === zoneSig) return;
  clearZone();
  zoneSig = signature;

  if (isCovered(fen)) {
    let tb = null;
    try {
      tb = await getTablebase(fen);
    } catch (error) {
      tb = null; // service indisponible : on se rabat sur Stockfish
    }
    if (zoneSig !== signature) return;
    if (tb) {
      await tablebaseZone(selected, piece, signature, tb);
      return;
    }
  }

  // Hors tablebases : Stockfish évalue les coups de la pièce choisie
  // (les valeurs déjà connues s'affichent immédiatement)
  const ucis = game.moves({ square: selected, verbose: true }).map(uciOf);
  if (ucis.length === 0) return; // pièce bloquée : rien à évaluer
  zoneWanted = { key: 'zone|' + fen + '|' + selected, fen, ucis, restrict: true, depth: ZONE_DEPTH, movetime: ZONE_MOVETIME };
  renderAnalysis();
  updateAnalysis();
}

function moveOutcomeOf(entry) {
  // la catégorie est donnée du point de vue du camp qui a le trait après le coup
  switch (entry.category) {
    case 'loss':
      return 'win'; // l'adversaire est perdant : zone de gain (vert)
    case 'draw':
    case 'cursed-win':
    case 'blessed-loss':
      return 'draw'; // nulle (jaune)
    case 'win':
      return 'loss'; // l'adversaire gagne : zone de défaite (rose)
    default:
      return null;
  }
}

zoneButton.addEventListener('click', () => {
  zoneOn = !zoneOn;
  updateZoneAvailability();
  clearZone();
  if (zoneOn && !zoneAvailable()) {
    showMessage('Winning Zone : figez la position avec un bouton Trait (mode analyse, ou à vous de jouer en mode Jeu).', 'info');
  }
  refreshZone();
});

// La sélection d'une pièce se fait au clavier/souris/doigt : on la relit après chaque geste.
boardElement.addEventListener('pointerdown', () => setTimeout(refreshZone, 0));
document.addEventListener('pointerup', () => setTimeout(refreshZone, 0));

// ==================================================
// NOTATION (français / figurines / international)
// ==================================================

const notationMode = () => $('#notation').value;

function convertSan(san, color) {
  const mode = notationMode();
  if (mode === 'international') return san;

  if (mode === 'french') {
    const conversion = { K: 'R', Q: 'D', R: 'T', B: 'F', N: 'C' };
    let result = san;
    if (conversion[result.charAt(0)]) result = conversion[result.charAt(0)] + result.substring(1);
    return result.replace(/=([QRBN])/g, (match, piece) => '=' + conversion[piece]);
  }

  // figurines : mêmes SVG « alpha » que l'échiquier
  const prefix = color === 'white' ? 'w' : 'b';
  const makePiece = (piece) =>
    `<img class="notation-piece" src="${asset('pieces/alpha/' + prefix + piece + '.svg')}" alt="${piece}">`;
  let result = String(san);
  if (/^[KQRBN]/.test(result)) result = makePiece(result.charAt(0)) + result.substring(1);
  return result.replace(/=([QRBN])/g, (match, piece) => '=' + makePiece(piece));
}

// ==================================================
// LISTE DES COUPS (repris de cc2)
// ==================================================

function getStartMoveInfo() {
  const parts = currentStartFen.trim().split(/\s+/);
  return { turn: parts[1] || 'w', fullmove: parseInt(parts[5] || '1', 10) || 1 };
}

function getMoveNumber(node) {
  const index = getPath(node).length - 1;
  const start = getStartMoveInfo();
  return start.turn === 'w' ? start.fullmove + Math.floor(index / 2) : start.fullmove + Math.floor((index + 1) / 2);
}

function createMoveButton(node, mainLine) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'move-text ' + (mainLine ? 'main-move' : 'variation-move');
  if (node === currentNode) button.classList.add('current-move');

  const converted = convertSan(node.move.san, node.move.color === 'w' ? 'white' : 'black');
  if (node.move.nullMove) button.title = 'Coup nul : le trait passe à l’autre camp, sans déplacement de pièce';
  if (notationMode() === 'figurines') {
    button.classList.add('figurine-notation');
    button.innerHTML = converted;
  } else {
    button.textContent = converted;
  }
  button.addEventListener('click', () => showNode(node));
  return button;
}

function addSpace(container) {
  container.appendChild(document.createTextNode(' '));
}

function appendMoveNumber(container, node, forceBlackNumber) {
  const number = getMoveNumber(node);
  if (node.move.color === 'w' || forceBlackNumber) {
    const span = document.createElement('span');
    span.className = 'move-number';
    span.textContent = number + (node.move.color === 'w' ? '. ' : '... ');
    container.appendChild(span);
  }
}

const variationDepthClass = (depth) => 'variation-depth-' + (((depth - 1) % 5) + 1);

function promoteVariation(node) {
  if (!node || !node.parent) return;
  const siblings = node.parent.children;
  const index = siblings.indexOf(node);
  if (index <= 0) return;
  [siblings[index - 1], siblings[index]] = [siblings[index], siblings[index - 1]];
  updateMoves();
}

/** Supprime une variante (et ses sous-variantes), après confirmation. */
function deleteVariation(node) {
  if (!node || !node.parent) return;
  if (!window.confirm('Supprimer cette variante et ses sous-variantes ?')) return;

  const parent = node.parent;
  const index = parent.children.indexOf(node);
  if (index < 0) return;

  let inside = false; // la position affichée se trouve-t-elle dans la variante supprimée ?
  for (let n = currentNode; n; n = n.parent) if (n === node) inside = true;

  parent.children.splice(index, 1);
  if (parent.selectedChild === node) parent.selectedChild = parent.children[0] || null;
  if (inside) showNode(parent);
  else updateMoves();
}

function toggleVariation(node) {
  node.collapsed = !node.collapsed;
  updateMoves();
}

function varButton(className, text, title, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'var-btn ' + className;
  button.title = title;
  button.setAttribute('aria-label', title);
  if (text) button.textContent = text;
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onClick();
  });
  return button;
}

/**
 * Début d'une sous-variante : chevron bleu (vers le haut = réduire à son premier coup,
 * vers le bas = déployer), puis, si elle est déployée, « + » vert (la remonter d'un niveau)
 * et « × » rouge (la supprimer).
 */
function appendVariationControls(container, node, { canPromote = true } = {}) {
  const collapsed = Boolean(node.collapsed);
  const toggle = varButton(
    'var-toggle ' + (collapsed ? 'collapsed' : 'expanded'),
    '',
    collapsed ? 'Déployer la variante' : 'Réduire la variante à son premier coup',
    () => toggleVariation(node),
  );
  toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  container.appendChild(toggle);
  if (collapsed) return;

  if (canPromote) container.appendChild(varButton('var-plus', '+', 'Remonter cette variante', () => promoteVariation(node)));
  container.appendChild(varButton('var-delete', '×', 'Supprimer cette variante', () => deleteVariation(node)));
}

/** Variante réduite : seulement son premier coup, suivi de « … » s'il y a une suite. */
function renderCollapsedVariation(node, container) {
  appendMoveNumber(container, node, node.move.color === 'b');
  container.appendChild(createMoveButton(node, false));
  if (node.children.length > 0) {
    const more = document.createElement('span');
    more.className = 'var-more';
    more.textContent = ' …';
    container.appendChild(more);
  }
}

function renderAlternativeGroup(mainNode, container, depth) {
  if (!mainNode || !mainNode.parent) return false;
  const alternatives = mainNode.parent.children.filter((child) => child !== mainNode);
  if (alternatives.length === 0) return false;

  if (depth === 1) container.appendChild(document.createElement('br'));

  const variation = document.createElement('span');
  variation.classList.add('variation', variationDepthClass(depth));
  alternatives.forEach((alternative, index) => {
    if (index > 0) variation.appendChild(document.createTextNode('; '));
    const square = alternative.move.nullMove; // changement de trait : crochets
    variation.appendChild(document.createTextNode(square ? '[ ' : '( '));
    appendVariationControls(variation, alternative);
    if (alternative.collapsed) renderCollapsedVariation(alternative, variation);
    else renderSequence(alternative, variation, { mainLine: false, variationDepth: depth, suppressAlternativesOnFirst: true });
    variation.appendChild(document.createTextNode(square ? ']' : ')'));
  });
  container.appendChild(variation);

  if (depth === 1) container.appendChild(document.createElement('br'));
  else addSpace(container);
  return true;
}

function renderSequence(startNode, container, options = {}) {
  const mainLine = options.mainLine === true;
  const variationDepth = options.variationDepth || 0;
  const suppressFirst = options.suppressAlternativesOnFirst === true;

  let node = startNode;
  let firstNode = true;
  let forceBlackNumber = false;

  while (node) {
    appendMoveNumber(container, node, node.move.color === 'b' && (firstNode || forceBlackNumber));
    container.appendChild(createMoveButton(node, mainLine));
    const nags = (node.nags || []).filter(nag => Number.isInteger(nag) && nag >= 0 && nag <= 255);
    if (nags.length) {
      const badge = document.createElement('span');
      badge.className = 'pgn-nags';
      badge.textContent = nags.map(nagDisplay).join(' ');
      container.appendChild(badge);
    }
    if (node.note) {
      const note = document.createElement('span');
      note.className = 'pgn-note';
      note.textContent = ' ' + node.note;
      container.appendChild(note);
    }

    if (node.comment) {
      const comment = document.createElement('span');
      comment.className = 'game-comment';
      comment.textContent = ' (' + node.comment + ')';
      container.appendChild(comment);
    }
    addSpace(container);

    let alternativesDisplayed = false;
    if (!(firstNode && suppressFirst)) {
      alternativesDisplayed = renderAlternativeGroup(node, container, variationDepth + 1);
    }

    const next = getMainChild(node);
    if (!next) break;

    if (next.move.nullMove) {
      // changement de trait : la suite s'ouvre dans une sous-variante entre crochets
      const bracket = document.createElement('span');
      bracket.classList.add('variation', variationDepthClass(variationDepth + 1));
      bracket.appendChild(document.createTextNode('[ '));
      appendVariationControls(bracket, next, { canPromote: false });
      if (next.collapsed) renderCollapsedVariation(next, bracket);
      else renderSequence(next, bracket, { mainLine: false, variationDepth: variationDepth + 1, suppressAlternativesOnFirst: true });
      bracket.appendChild(document.createTextNode(']'));
      container.appendChild(bracket);
      addSpace(container);
      renderAlternativeGroup(next, container, variationDepth + 1); // autres suites éventuelles
      break;
    }

    forceBlackNumber = alternativesDisplayed && next.move.color === 'b';
    node = next;
    firstNode = false;
  }
}

// ==================================================
// DÉFILEMENT AUTOMATIQUE DE LA LISTE DES COUPS (paysage)
// ==================================================
//
// Quand on parcourt la partie avec les boutons de navigation (ou le clavier), le cadre de droite défile
// pour amener le coup affiché au milieu. Le défilement n'a lieu qu'au changement de position : il ne
// reprend donc pas la main si l'on fait défiler le cadre à la main, et il est ignoré quand on clique
// soi-même sur un coup de la liste (la liste ne doit pas bouger sous le doigt).
// ==================================================

function centerCurrentMove() {
  if (currentNode === lastCenteredNode) return; // pas de changement de position : on ne touche à rien
  lastCenteredNode = currentNode;
  if (!landscapeQuery.matches || clickedInMoves) return;
  const frame = $('#frame-right');
  const current = movesElement.querySelector('.current-move');
  if (!frame || !current || frame.scrollHeight <= frame.clientHeight) return;
  const frameRect = frame.getBoundingClientRect();
  const rect = current.getBoundingClientRect();
  const delta = rect.top + rect.height / 2 - (frameRect.top + frame.clientHeight / 2);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  frame.scrollTo({ top: frame.scrollTop + delta, behavior: reduced ? 'auto' : 'smooth' });
}

function updateMoves() {
  movesElement.innerHTML = '';
  movesElement.classList.toggle('suspended', !locked && Boolean(rootNode));
  if (rootNode && rootNode.note) {
    const intro = document.createElement('span');
    intro.className = 'pgn-note';
    intro.textContent = rootNode.note + ' ';
    movesElement.appendChild(intro);
  }
  if (rootNode && rootNode.children.length > 0) {
    renderSequence(getMainChild(rootNode), movesElement, { mainLine: true, variationDepth: 0 });
  }
  if (thinking) {
    const note = document.createElement('span');
    note.className = 'thinking';
    note.textContent = ' Stockfish réfléchit…';
    movesElement.appendChild(note);
  }
  centerCurrentMove();
}

function updateNavigation() {
  const atRoot = !currentNode || currentNode === rootNode;
  const atEnd = !currentNode || currentNode.children.length === 0;
  $('#first').disabled = !locked || atRoot;
  $('#previous').disabled = !locked || atRoot;
  $('#next').disabled = !locked || atEnd;
  $('#last').disabled = !locked || atEnd;
  $('#restart').disabled = !locked;
}

$('#first').addEventListener('click', () => rootNode && showNode(rootNode));
$('#previous').addEventListener('click', () => currentNode && currentNode.parent && showNode(currentNode.parent));
$('#next').addEventListener('click', () => {
  const child = getMainChild(currentNode);
  if (child) showNode(child);
});
$('#last').addEventListener('click', () => {
  let node = currentNode;
  while (node && getMainChild(node)) node = getMainChild(node);
  if (node) showNode(node);
});
$('#restart').addEventListener('click', () => {
  if (locked) enterGame(currentStartFen);
});
$('#flip').addEventListener('click', () => {
  ground.toggleOrientation();
  marks.render();
  updateTurnDisc();
  updateCoordinates();
  updateShiftButtons();
  clearZone();
  refreshZone();
});

// ==================================================
// PGN (repris de cc2)
// ==================================================

const escapePgnValue = (value) => String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');

function getPgnMoveText(node, ply) {
  const start = getStartMoveInfo();
  const number = start.fullmove + Math.floor((ply + (start.turn === 'w' ? 0 : 1)) / 2);
  if (node.move.color === 'w') return number + '. ' + node.move.san;
  return ply === 0 ? number + '... ' + node.move.san : node.move.san;
}

const BRUSH_LETTER = { red: 'R', green: 'G', blue: 'B', yellow: 'Y' };

/** Commentaire { … } d'une position : texte + [%csl …] (cercles) + [%cal …] (flèches). */
function pgnComment(node) {
  const parts = [];
  if (node.note) parts.push(node.note.replace(/[{}]/g, ' '));
  // Directives PGN non converties en éléments graphiques : [%eval], [%clk], etc.
  for (const directive of node.directives || []) {
    if (directive) parts.push('[%' + directive.replace(/[{}]/g, ' ') + ']');
  }
  const shapes = node.shapes || [];
  const circles = shapes.filter((shape) => !shape.dest).map((shape) => (BRUSH_LETTER[shape.brush] || 'G') + shape.orig);
  const arrows = shapes.filter((shape) => shape.dest).map((shape) => (BRUSH_LETTER[shape.brush] || 'G') + shape.orig + shape.dest);
  if (circles.length) parts.push('[%csl ' + circles.join(',') + ']');
  if (arrows.length) parts.push('[%cal ' + arrows.join(',') + ']');
  return parts.length ? ' {' + parts.join(' ') + '}' : '';
}

function exportPgnMove(node, ply) {
  if (!node) return '';
  const nags = (node.nags || []).filter((nag) => Number.isInteger(nag) && nag >= 0 && nag <= 255);
  return getPgnMoveText(node, ply) +
    (nags.length ? ' ' + nags.map((nag) => '$' + nag).join(' ') : '') +
    pgnComment(node);
}

/**
 * Les alternatives d'un nœud remplacent son coup principal suivant.
 * En PGN, elles se placent après ce coup, en revenant à sa position parente.
 */
function exportPgnContinuation(node, ply) {
  if (!node) return '';
  const main = getMainChild(node);
  if (!main) return '';
  let text = ' ' + exportPgnMove(main, ply + 1);
  for (const alternative of node.children.filter((child) => child !== main)) {
    const variation = exportPgnLine(alternative, ply + 1);
    if (variation) text += ' (' + variation + ')';
  }
  return text + exportPgnContinuation(main, ply + 1);
}

function exportPgnLine(node, ply) {
  if (!node) return '';
  return exportPgnMove(node, ply) + exportPgnContinuation(node, ply);
}

function buildPgn() {
  let pgn = '[Event "' + escapePgnValue(positionTitle || 'XPGN Studio') + '"]\\n[Site "XPGN Studio"]\\n';
  if (currentStartFen) pgn += '[FEN "' + escapePgnValue(currentStartFen) + '"]\\n[SetUp "1"]\\n';
  pgn += '[Result "*"]\\n\\n';
  if (rootNode && pgnComment(rootNode)) pgn += pgnComment(rootNode).trim() + ' ';
  if (rootNode && rootNode.children.length > 0) {
    const main = getMainChild(rootNode);
    pgn += exportPgnMove(main, 0);
    for (const alternative of rootNode.children.filter((child) => child !== main)) {
      const variation = exportPgnLine(alternative, 0);
      if (variation) pgn += ' (' + variation + ')';
    }
    pgn += exportPgnContinuation(main, 0) + ' ';
  }
  return pgn + '*\\n';
}

function downloadPgn() {
  const blob = new Blob([buildPgn()], { type: 'application/x-chess-pgn;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'xpgn-studio.pgn';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function setupPgnButton() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'export-pgn-button';
  button.title = 'Télécharger toutes les variantes en PGN';
  button.setAttribute('aria-label', 'Télécharger toutes les variantes en PGN');
  const icon = document.createElement('img');
  icon.src = asset('images/download-pgn.png');
  icon.alt = '';
  icon.className = 'export-pgn-icon';
  const label = document.createElement('span');
  label.textContent = 'PGN';
  button.append(icon, label);
  button.addEventListener('click', downloadPgn);
  $('.notation-control').append(button);
}

function buildXpgnDocument() {
  const annotations = [];
  const visit = (node) => {
    if (node.xpgnAnnotations && node.xpgnAnnotations.length) {
      annotations.push({ at: { path: getXpgnNodePath(node) }, scope: { branch: 'node', durationPlies: 0 }, items: node.xpgnAnnotations });
    }
    for (const child of node.children || []) visit(child);
  };
  if (rootNode && !currentXpgnCourseOnly) visit(rootNode);
  const document = { format: 'XPGN', version: 1, annotations };
  if (rootNode && !currentXpgnCourseOnly) document.game = { pgn: buildPgn() };
  if (currentXpgnGames.length) document.games = currentXpgnGames;
  if (currentXpgnCourse) document.course = currentXpgnCourse;
  return document;
}

async function downloadXpgn() {
  if ((!rootNode || !locked) && !currentXpgnCourse) {
    showMessage('Chargez une partie ou un cours avant l’export XPGN.', 'info');
    return;
  }
  try {
    const content = stringifyXpgn(buildXpgnDocument());
    const documentTitle = currentXpgnCourse && currentXpgnCourse.title ? currentXpgnCourse.title : (positionTitle || 'partie');
    const safeName = documentTitle.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'partie';
    const filename = safeName + '.xpgn';

    // Sur les navigateurs compatibles, laisser l'utilisateur choisir son dossier
    // de projet et écrire directement le fichier. Sinon, téléchargement classique.
    if (typeof window.showSaveFilePicker === 'function') {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Document XPGN',
          accept: { 'application/vnd.xpgn+json': ['.xpgn'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(new Blob([content], { type: 'application/vnd.xpgn+json;charset=utf-8' }));
      await writable.close();
      showMessage('Document XPGN enregistré : ' + filename, 'success', pgnMessage);
      return;
    }

    const blob = new Blob([content], { type: 'application/vnd.xpgn+json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showMessage('Téléchargement XPGN lancé : ' + filename, 'success', pgnMessage);
  } catch (error) {
    if (error && error.name === 'AbortError') return;
    showMessage('Export XPGN impossible : ' + error.message, 'error', pgnMessage);
  }
}

function openXpgnFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const document = parseXpgn(reader.result);
      if (!document.game) {
        // Les cours autonomes sont validés et peuvent être réexportés ; leur
        // affichage et leur édition pédagogique seront ajoutés à l'interface ensuite.
        currentXpgnCourse = document.course || null;
        currentXpgnGames = document.games || [];
        currentXpgnMainPgn = null;
        currentXpgnCourseOnly = Boolean(currentXpgnCourse);
        if (!currentXpgnCourse) throw new Error('Aucune partie principale ou aucun cours à ouvrir.');
        // Un cours autonome ne doit pas réutiliser par accident l'arbre PGN
        // d'une partie ouverte auparavant dans Studio.
        if (locked) leaveGame();
        rootNode = null;
        currentNode = null;
        currentStartFen = '';
        suspended = null;
        marks.setItems([]);
        updateMoves();
        updateNavigation();
        showCourseReader();
        showMessage('Cours XPGN ouvert : vous pouvez parcourir ses chapitres et consulter ses diagrammes.', 'success', pgnMessage);
        return;
      }
      // Un document XPGN doit contenir une partie intégralement lisible.
      if (!loadPgn(document.game.pgn, { strict: true, preserveCourse: true })) {
        throw new Error('La partie PGN intégrée est invalide ou incomplète.');
      }
      currentXpgnCourse = document.course || null;
      currentXpgnGames = document.games || [];
      currentXpgnMainPgn = document.game.pgn;
      currentXpgnCourseOnly = false;
      const linked = attachXpgnAnnotations(rootNode, document.annotations);
      marks.setItems(currentNode.xpgnAnnotations || []);
      afterPosition();
      if (currentXpgnCourse) showCourseReader();
      showMessage(
        'Fichier XPGN ouvert : ' + linked.attached + ' annotation(s) restaurée(s)' +
        (linked.unresolved.length ? ', ' + linked.unresolved.length + ' chemin(s) non retrouvé(s).' : '') +
        (currentXpgnCourse ? ' Le cours est également ouvert dans le lecteur.' : ''),
        linked.unresolved.length || currentXpgnCourse ? 'info' : 'success',
        pgnMessage,
      );
    } catch (error) {
      showMessage('Fichier XPGN invalide : ' + error.message, 'error', pgnMessage);
    }
  };
  reader.onerror = () => showMessage('Impossible de lire ce fichier XPGN.', 'error', pgnMessage);
  reader.readAsText(file, 'UTF-8');
}

function setupXpgnControls() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xpgn,application/vnd.xpgn+json,application/json';
  input.hidden = true;
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (file) openXpgnFile(file);
    input.value = '';
  });
  document.body.appendChild(input);

  const makeButton = (label, title, action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'export-pgn-button xpgn-action-button';
    button.title = title;
    button.textContent = label;
    button.addEventListener('click', action);
    $('.notation-control').append(button);
  };
  makeButton('Ouvrir XPGN', 'Ouvrir un document .xpgn', () => input.click());
  makeButton('XPGN', 'Télécharger la partie, ses annotations et le cours au format .xpgn', downloadXpgn);
  setupCourseAuthoring();
  setupCourseReader();
  setupMoveAnnotations();
}


const COURSE_PIECES = { K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟' };
let courseReaderDialog = null;
function courseDiagram(fen) {
  const placement = String(fen || '').trim().split(/\\s+/)[0];
  const rows = placement.split('/');
  if (rows.length !== 8) return null;
  const board = document.createElement('div');
  board.className = 'xpgn-course-board';
  rows.forEach((row, rank) => {
    let files = [];
    for (const token of row) {
      if (/^[1-8]$/.test(token)) files.push(...Array(Number(token)).fill(''));
      else files.push(token);
    }
    if (files.length !== 8) return;
    files.forEach((piece, file) => {
      const square = document.createElement('span');
      square.className = 'xpgn-course-square ' + ((rank + file) % 2 ? 'dark' : 'light');
      square.textContent = COURSE_PIECES[piece] || '';
      board.appendChild(square);
    });
  });
  return board;
}
function renderCourseChapter(index) {
  if (!currentXpgnCourse || !courseReaderDialog) return;
  const course = currentXpgnCourse;
  const chapter = course.chapters[index] || course.chapters[0];
  const body = courseReaderDialog.querySelector('.xpgn-course-reader-body');
  body.innerHTML = '';
  const heading = document.createElement('h3');
  heading.textContent = chapter.title;
  body.appendChild(heading);
  for (const block of chapter.blocks) {
    if (block.type === 'heading') {
      const h = document.createElement('h' + (block.level || 2));
      h.textContent = block.text;
      body.appendChild(h);
    } else if (block.type === 'text') {
      const p = document.createElement('p');
      p.className = 'xpgn-course-text';
      p.textContent = block.text;
      body.appendChild(p);
    } else if (block.type === 'diagram' || block.type === 'exercise') {
      const section = document.createElement('section');
      section.className = 'xpgn-course-block';
      if (block.type === 'exercise') {
        const prompt = document.createElement('p');
        prompt.textContent = 'Exercice : ' + block.prompt;
        section.appendChild(prompt);
      }
      let fen = block.position && block.position.fen;
      if (!fen && block.position) {
        const gameId = block.position.gameId;
        const entry = gameId ? currentXpgnGames.find(item => item.id === gameId) : null;
        const sourcePgn = gameId ? (entry && entry.pgn) : currentXpgnMainPgn;
        if (sourcePgn) {
          const parsed = parsePgn(sourcePgn, Chess);
          const node = findPgnNodeByPath(parsed.root, block.position.path || []);
          if (node) fen = node.fen;
        } else if (block.position.path && block.position.path.length === 0) {
          fen = currentStartFen || new Chess().fen();
        }
      }
      if (fen) {
        const board = courseDiagram(fen);
        if (board) section.appendChild(board);
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = 'Voir le FEN';
        const code = document.createElement('code');
        code.textContent = fen;
        details.append(summary, code);
        section.appendChild(details);

        // Le lecteur peut replacer la position sur l'échiquier, y compris
        // lorsqu'elle appartient à une partie de la bibliothèque (gameId).
        const navigate = document.createElement('button');
        navigate.type = 'button';
        navigate.className = 'xpgn-course-navigate';
        navigate.textContent = 'Afficher sur l’échiquier';
        if (block.position.path && !block.position.gameId && rootNode) {
          const target = findPgnNodeByPath(rootNode, block.position.path);
          if (target) {
            navigate.addEventListener('click', () => {
              courseReaderDialog.close();
              showNode(target);
            });
            section.appendChild(navigate);
          }
        }
      } else {
        const note = document.createElement('p');
        note.textContent = 'Cette position est référencée dans une partie intégrée (' + (block.position.gameId || 'partie principale') + ') mais son chemin n’a pas pu être résolu.';
        section.appendChild(note);
      }
      if (block.caption) {
        const caption = document.createElement('p');
        caption.className = 'xpgn-course-caption';
        caption.textContent = block.caption;
        section.appendChild(caption);
      }
      if (block.type === 'exercise') {
        const answer = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = 'Afficher la solution';
        const solution = document.createElement('p');
        solution.textContent = 'Coups attendus (UCI) : ' + block.expectedMoves.join(' ') + (block.explanation ? ' — ' + block.explanation : '');
        answer.append(summary, solution);
        section.appendChild(answer);
      }
      body.appendChild(section);
    }
  }
  courseReaderDialog.querySelector('.xpgn-course-chapter-select').value = String(index);
  courseReaderDialog.querySelector('.xpgn-course-prev').disabled = index <= 0;
  courseReaderDialog.querySelector('.xpgn-course-next').disabled = index >= course.chapters.length - 1;
  courseReaderDialog.dataset.chapter = String(index);
}
function setupCourseReader() {
  courseReaderDialog = document.createElement('dialog');
  courseReaderDialog.className = 'xpgn-course-reader';
  courseReaderDialog.innerHTML = `
    <div class="xpgn-course-reader-head"><div><h2 class="xpgn-course-reader-title"></h2><p class="xpgn-course-reader-description"></p></div><button type="button" class="xpgn-course-close" aria-label="Fermer">×</button></div>
    <label>Chapitre <select class="xpgn-course-chapter-select"></select></label>
    <article class="xpgn-course-reader-body"></article>
    <div class="xpgn-course-reader-actions"><button type="button" class="xpgn-course-prev">Précédent</button><button type="button" class="xpgn-course-next">Suivant</button><button type="button" class="xpgn-course-close">Fermer</button></div>`;
  document.body.appendChild(courseReaderDialog);
  const select = courseReaderDialog.querySelector('select');
  select.addEventListener('change', () => renderCourseChapter(Number(select.value)));
  courseReaderDialog.querySelector('.xpgn-course-prev').addEventListener('click', () => renderCourseChapter(Math.max(0, Number(courseReaderDialog.dataset.chapter || 0) - 1)));
  courseReaderDialog.querySelector('.xpgn-course-next').addEventListener('click', () => renderCourseChapter(Math.min(currentXpgnCourse.chapters.length - 1, Number(courseReaderDialog.dataset.chapter || 0) + 1)));
  courseReaderDialog.querySelectorAll('.xpgn-course-close').forEach(button => button.addEventListener('click', () => courseReaderDialog.close()));
}
function showCourseReader(chapterIndex = 0) {
  if (!currentXpgnCourse || !courseReaderDialog) return;
  const course = currentXpgnCourse;
  courseReaderDialog.querySelector('.xpgn-course-reader-title').textContent = course.title;
  courseReaderDialog.querySelector('.xpgn-course-reader-description').textContent = course.description || '';
  const select = courseReaderDialog.querySelector('select');
  select.innerHTML = '';
  course.chapters.forEach((chapter, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = chapter.title;
    select.appendChild(option);
  });
  renderCourseChapter(Math.max(0, Math.min(course.chapters.length - 1, chapterIndex)));
  if (!courseReaderDialog.open) courseReaderDialog.showModal();
}
function setupMoveAnnotations() {
  const add = (label, title, action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'export-pgn-button xpgn-action-button';
    button.textContent = label;
    button.title = title;
    button.addEventListener('click', action);
    $('.notation-control').append(button);
  };

  // Commentaires multilignes : le texte est rattaché à la position sélectionnée.
  const commentDialog = document.createElement('dialog');
  commentDialog.className = 'xpgn-course-dialog';
  commentDialog.innerHTML = `
    <form class="xpgn-course-form">
      <div class="xpgn-course-head"><h2>Commentaire de la position</h2><button type="button" class="xpgn-course-close" aria-label="Fermer">×</button></div>
      <label for="xpgn-move-comment">Commentaire (plusieurs lignes possibles)
        <textarea id="xpgn-move-comment" name="comment" rows="8" maxlength="20000" placeholder="Décrivez l’idée, le plan ou l’évaluation de la position…"></textarea>
      </label>
      <div class="xpgn-course-actions"><button type="button" class="xpgn-comment-cancel">Annuler</button><button type="submit">Enregistrer</button></div>
    </form>`;
  document.body.appendChild(commentDialog);
  const commentForm = commentDialog.querySelector('form');
  const commentText = commentForm.elements.namedItem('comment');
  const closeComment = () => commentDialog.close();
  commentDialog.querySelector('.xpgn-course-close').addEventListener('click', closeComment);
  commentDialog.querySelector('.xpgn-comment-cancel').addEventListener('click', closeComment);
  commentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!currentNode) return;
    currentNode.note = commentText.value.trim();
    updateMoves();
    closeComment();
  });

  add('Commentaire', 'Rédiger un commentaire multilignes sur la position sélectionnée', () => {
    if (!currentNode) {
      showMessage('Sélectionnez une partie ou une position avant d’ajouter un commentaire.', 'info', pgnMessage);
      return;
    }
    commentText.value = currentNode.note || '';
    commentDialog.showModal();
    commentText.focus();
  });

  // Sélecteur NAG : codes PGN standards, ajout et retrait sans saisie de numéro.
  const nagDialog = document.createElement('dialog');
  nagDialog.className = 'xpgn-course-dialog';
  nagDialog.innerHTML = `
    <form class="xpgn-course-form">
      <div class="xpgn-course-head"><h2>Symbole d’évaluation</h2><button type="button" class="xpgn-course-close" aria-label="Fermer">×</button></div>
      <label for="xpgn-move-nag">Symbole PGN (NAG)
        <select id="xpgn-move-nag" name="nag"></select>
      </label>
      <p class="xpgn-course-note">Les symboles sont enregistrés sous leur code NAG PGN pour rester compatibles avec les autres logiciels d’échecs.</p>
      <div class="xpgn-course-actions"><button type="button" class="xpgn-nag-remove">Retirer ce symbole</button><button type="button" class="xpgn-nag-cancel">Fermer</button><button type="submit">Ajouter</button></div>
    </form>`;
  document.body.appendChild(nagDialog);
  const nagForm = nagDialog.querySelector('form');
  const nagSelect = nagForm.elements.namedItem('nag');
  for (const item of MOVE_NAGS) {
    const option = document.createElement('option');
    option.value = String(item.nag);
    option.textContent = '$' + item.nag + ' — ' + item.label;
    nagSelect.appendChild(option);
  }
  const closeNag = () => nagDialog.close();
  nagDialog.querySelector('.xpgn-course-close').addEventListener('click', closeNag);
  nagDialog.querySelector('.xpgn-nag-cancel').addEventListener('click', closeNag);
  nagForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!currentNode || !currentNode.parent) return;
    const nag = Number(nagSelect.value);
    currentNode.nags = [...new Set([...(currentNode.nags || []), nag])];
    updateMoves();
    closeNag();
  });
  nagDialog.querySelector('.xpgn-nag-remove').addEventListener('click', () => {
    if (!currentNode || !currentNode.parent) return;
    const nag = Number(nagSelect.value);
    currentNode.nags = (currentNode.nags || []).filter((value) => value !== nag);
    updateMoves();
    closeNag();
  });

  add('Symbole', 'Choisir un symbole d’évaluation PGN pour le coup sélectionné', () => {
    if (!currentNode || !currentNode.parent) {
      showMessage('Sélectionnez un coup dans la notation pour lui associer un symbole.', 'info', pgnMessage);
      return;
    }
    nagSelect.value = String((currentNode.nags || [])[0] || 1);
    nagDialog.showModal();
  });
}

function setupCourseAuthoring() {
  const dialog = document.createElement('dialog');
  dialog.className = 'xpgn-course-dialog';
  dialog.innerHTML = `
    <form class="xpgn-course-form">
      <div class="xpgn-course-head">
        <h2>Créer un cours XPGN</h2>
        <button type="button" class="xpgn-course-close" aria-label="Fermer">×</button>
      </div>
      <label>Titre du cours
        <input name="title" required maxlength="300" value="Nouveau cours d’échecs">
      </label>
      <label>Description
        <textarea name="description" rows="2" maxlength="5000" placeholder="Quel est l’objectif de ce cours ?"></textarea>
      </label>
      <label>Titre du premier chapitre
        <input name="chapter" required maxlength="300" value="Introduction">
      </label>
      <label>Explication
        <textarea name="text" rows="5" maxlength="20000" required placeholder="Rédigez votre explication…"></textarea>
      </label>
      <label class="xpgn-course-check">
        <input name="diagram" type="checkbox" checked>
        Ajouter la position actuellement affichée comme diagramme
      </label>
      <p class="xpgn-course-note">Le cours sera enregistré dans un fichier .xpgn avec la partie courante, si elle existe.</p>
      <div class="xpgn-course-actions">
        <button type="button" class="xpgn-course-cancel">Annuler</button>
        <button type="submit" class="xpgn-course-create">Créer le cours</button>
      </div>
    </form>`;
  document.body.appendChild(dialog);

  const form = dialog.querySelector('form');
  const close = () => dialog.close();
  dialog.querySelector('.xpgn-course-close').addEventListener('click', close);
  dialog.querySelector('.xpgn-course-cancel').addEventListener('click', close);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const title = String(data.get('title') || '').trim();
    const chapterTitle = String(data.get('chapter') || '').trim();
    const explanation = String(data.get('text') || '').trim();
    if (!title || !chapterTitle || !explanation) {
      showMessage('Le titre du cours, le titre du chapitre et l’explication sont obligatoires.', 'error', pgnMessage);
      return;
    }
    const blocks = [
      { id: 'introduction', type: 'heading', text: 'Introduction', level: 2 },
      { id: 'explication', type: 'text', text: explanation },
    ];
    if (data.get('diagram') && rootNode && currentNode) {
      blocks.push({
        id: 'diagramme-1',
        type: 'diagram',
        position: { path: getXpgnNodePath(currentNode) },
        caption: 'Position de travail',
      });
    }
    currentXpgnCourse = {
      title,
      description: String(data.get('description') || '').trim() || undefined,
      language: 'fr',
      chapters: [{
        id: 'chapitre-1',
        title: chapterTitle,
        blocks,
      }],
    };
    currentXpgnGames = [];
    currentXpgnCourseOnly = !rootNode;
    close();
    showCourseReader();
    showMessage('Cours créé et ouvert. Utilisez le bouton XPGN pour enregistrer le document et son contenu.', 'success', pgnMessage);
  });

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'export-pgn-button xpgn-action-button';
  button.textContent = 'Nouveau cours';
  button.title = 'Créer un document de cours XPGN';
  button.addEventListener('click', () => {
    const diagram = form.elements.namedItem('diagram');
    diagram.disabled = !rootNode || !currentNode;
    diagram.checked = Boolean(rootNode && currentNode);
    dialog.showModal();
  });
  $('.notation-control').append(button);

  const getActiveCourseChapterIndex = () => {
    if (!currentXpgnCourse || !currentXpgnCourse.chapters.length) return -1;
    const selected = courseReaderDialog ? Number(courseReaderDialog.dataset.chapter) : NaN;
    return Number.isInteger(selected) && selected >= 0 && selected < currentXpgnCourse.chapters.length
      ? selected
      : currentXpgnCourse.chapters.length - 1;
  };

  const addPositionButton = document.createElement('button');
  addPositionButton.type = 'button';
  addPositionButton.className = 'export-pgn-button xpgn-action-button';
  addPositionButton.textContent = 'Ajouter une position';
  addPositionButton.title = 'Ajouter la position affichée au dernier chapitre du cours';
  addPositionButton.addEventListener('click', () => {
    if (!currentXpgnCourse || !currentXpgnCourse.chapters.length) {
      showMessage('Créez ou ouvrez d’abord un cours XPGN.', 'info', pgnMessage);
      return;
    }
    if (!locked || !currentNode) {
      showMessage('Affichez d’abord une position de partie sur l’échiquier.', 'info', pgnMessage);
      return;
    }
    const chapterIndex = getActiveCourseChapterIndex();
    const chapter = currentXpgnCourse.chapters[chapterIndex];
    const usedIds = new Set(chapter.blocks.map(block => block.id).filter(Boolean));
    let suffix = chapter.blocks.length + 1;
    let id = 'position-' + suffix;
    while (usedIds.has(id)) id = 'position-' + (++suffix);
    chapter.blocks.push({
      id,
      type: 'diagram',
      position: { path: getXpgnNodePath(currentNode) },
      caption: 'Position ' + (chapter.blocks.filter(block => block.type === 'diagram' || block.type === 'exercise').length + 1),
    });
    showCourseReader(chapterIndex);
    showMessage('Position ajoutée au chapitre « ' + chapter.title + ' ». Vous pouvez en ajouter d’autres après avoir navigué dans la partie.', 'success', pgnMessage);
  });
  $('.notation-control').append(addPositionButton);

  // Ajout de blocs pédagogiques sans quitter le cours : texte, exercice et chapitre.
  const addBlockDialog = document.createElement('dialog');
  addBlockDialog.className = 'xpgn-course-dialog';
  addBlockDialog.innerHTML = `
    <form class="xpgn-course-form">
      <div class="xpgn-course-head"><h2>Ajouter au cours</h2><button type="button" class="xpgn-course-close" aria-label="Fermer">×</button></div>
      <label>Type de contenu
        <select name="kind">
          <option value="text">Texte explicatif</option>
          <option value="exercise">Exercice sur la position actuelle</option>
        </select>
      </label>
      <label class="xpgn-add-text-field">Texte
        <textarea name="text" rows="6" maxlength="20000" placeholder="Rédigez l’explication…"></textarea>
      </label>
      <label class="xpgn-add-exercise-field" hidden>Consigne de l’exercice
        <textarea name="prompt" rows="3" maxlength="5000" placeholder="Que doit trouver le lecteur ?"></textarea>
      </label>
      <label class="xpgn-add-exercise-field" hidden>Réponse attendue
        <select name="move"></select>
      </label>
      <label class="xpgn-add-exercise-field" hidden>Explication de la solution
        <textarea name="explanation" rows="3" maxlength="5000" placeholder="Pourquoi ce coup est-il correct ?"></textarea>
      </label>
      <p class="xpgn-course-note xpgn-add-exercise-field" hidden>La réponse proposée est un coup disponible dans la position actuelle. Pour créer l’exercice, placez-vous d’abord sur cette position dans la partie.</p>
      <div class="xpgn-course-actions"><button type="button" class="xpgn-add-cancel">Annuler</button><button type="submit">Ajouter au chapitre</button></div>
    </form>`;
  document.body.appendChild(addBlockDialog);
  const addBlockForm = addBlockDialog.querySelector('form');
  const kindSelect = addBlockForm.elements.namedItem('kind');
  const textField = addBlockForm.querySelector('.xpgn-add-text-field');
  const exerciseFields = [...addBlockForm.querySelectorAll('.xpgn-add-exercise-field')];
  const moveSelect = addBlockForm.elements.namedItem('move');
  const updateBlockKind = () => {
    const exercise = kindSelect.value === 'exercise';
    textField.hidden = exercise;
    exerciseFields.forEach(field => { field.hidden = !exercise; });
    if (exercise) {
      moveSelect.innerHTML = '';
      for (const [index, child] of (currentNode?.children || []).entries()) {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = child.move.san + (child.move.nullMove ? ' (coup nul)' : '');
        moveSelect.appendChild(option);
      }
    }
  };
  kindSelect.addEventListener('change', updateBlockKind);
  const closeBlockDialog = () => addBlockDialog.close();
  addBlockDialog.querySelector('.xpgn-course-close').addEventListener('click', closeBlockDialog);
  addBlockDialog.querySelector('.xpgn-add-cancel').addEventListener('click', closeBlockDialog);
  addBlockForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!currentXpgnCourse || !currentXpgnCourse.chapters.length) return;
    const chapterIndex = getActiveCourseChapterIndex();
    const chapter = currentXpgnCourse.chapters[chapterIndex];
    const data = new FormData(addBlockForm);
    const used = new Set(chapter.blocks.map(block => block.id).filter(Boolean));
    const prefix = kindSelect.value === 'exercise' ? 'exercice' : 'texte';
    let number = chapter.blocks.length + 1;
    let id = prefix + '-' + number;
    while (used.has(id)) id = prefix + '-' + (++number);
    if (kindSelect.value === 'text') {
      const text = String(data.get('text') || '').trim();
      if (!text) {
        showMessage('Le texte du bloc ne peut pas être vide.', 'error', pgnMessage);
        return;
      }
      chapter.blocks.push({ id, type: 'text', text });
    } else {
      const prompt = String(data.get('prompt') || '').trim();
      const child = currentNode && currentNode.children[Number(data.get('move'))];
      if (!locked || !currentNode || !prompt || !child) {
        showMessage('Pour ajouter un exercice, sélectionnez une position avec au moins un coup de réponse.', 'error', pgnMessage);
        return;
      }
      const move = child.move;
      const uci = move.nullMove ? '0000' : move.from + move.to + (move.promotion || '');
      chapter.blocks.push({
        id,
        type: 'exercise',
        prompt,
        position: { path: getXpgnNodePath(currentNode) },
        expectedMoves: [uci],
        ...(String(data.get('explanation') || '').trim() ? { explanation: String(data.get('explanation')).trim() } : {}),
      });
    }
    closeBlockDialog();
    showCourseReader(chapterIndex);
    showMessage('Contenu ajouté au chapitre « ' + chapter.title + ' ». Pensez à enregistrer le fichier XPGN.', 'success', pgnMessage);
  });

  const addBlockButton = document.createElement('button');
  addBlockButton.type = 'button';
  addBlockButton.className = 'export-pgn-button xpgn-action-button';
  addBlockButton.textContent = 'Ajouter texte / exercice';
  addBlockButton.title = 'Ajouter un bloc de texte ou un exercice au chapitre courant';
  addBlockButton.addEventListener('click', () => {
    if (!currentXpgnCourse) {
      showMessage('Créez ou ouvrez d’abord un cours XPGN.', 'info', pgnMessage);
      return;
    }
    kindSelect.value = 'text';
    updateBlockKind();
    addBlockDialog.showModal();
  });
  $('.notation-control').append(addBlockButton);

  const chapterDialog = document.createElement('dialog');
  chapterDialog.className = 'xpgn-course-dialog';
  chapterDialog.innerHTML = `
    <form class="xpgn-course-form">
      <div class="xpgn-course-head"><h2>Nouveau chapitre</h2><button type="button" class="xpgn-course-close" aria-label="Fermer">×</button></div>
      <label>Titre du chapitre<input name="title" required maxlength="300" placeholder="Titre du chapitre"></label>
      <div class="xpgn-course-actions"><button type="button" class="xpgn-chapter-cancel">Annuler</button><button type="submit">Créer le chapitre</button></div>
    </form>`;
  document.body.appendChild(chapterDialog);
  const chapterForm = chapterDialog.querySelector('form');
  const closeChapterDialog = () => chapterDialog.close();
  chapterDialog.querySelector('.xpgn-course-close').addEventListener('click', closeChapterDialog);
  chapterDialog.querySelector('.xpgn-chapter-cancel').addEventListener('click', closeChapterDialog);
  chapterForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!currentXpgnCourse) return;
    const title = String(new FormData(chapterForm).get('title') || '').trim();
    if (!title) return;
    const usedChapterIds = new Set(currentXpgnCourse.chapters.map(chapter => chapter.id));
    let chapterNumber = currentXpgnCourse.chapters.length + 1;
    let id = 'chapitre-' + chapterNumber;
    while (usedChapterIds.has(id)) id = 'chapitre-' + (++chapterNumber);
    currentXpgnCourse.chapters.push({
      id,
      title,
      blocks: [{ id: id + '-introduction', type: 'heading', text: title, level: 2 }],
    });
    closeChapterDialog();
    showCourseReader(currentXpgnCourse.chapters.length - 1);
    showMessage('Chapitre « ' + title + ' » créé. Vous pouvez maintenant y ajouter du texte, des positions et des exercices.', 'success', pgnMessage);
  });
  const addChapterButton = document.createElement('button');
  addChapterButton.type = 'button';
  addChapterButton.className = 'export-pgn-button xpgn-action-button';
  addChapterButton.textContent = 'Nouveau chapitre';
  addChapterButton.title = 'Ajouter un chapitre au cours XPGN';
  addChapterButton.addEventListener('click', () => {
    if (!currentXpgnCourse) {
      showMessage('Créez ou ouvrez d’abord un cours XPGN.', 'info', pgnMessage);
      return;
    }
    chapterForm.reset();
    chapterDialog.showModal();
  });
  $('.notation-control').append(addChapterButton);
}

// ==================================================
// MENU DE NOTATION (repris de cc2)
// ==================================================

function setupNotationMenu() {
  const select = $('#notation');
  select.classList.add('notation-native-select');

  const menu = document.createElement('div');
  menu.className = 'notation-menu';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'notation-menu-button';
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  button.title = 'Choisir la notation';

  const preview = document.createElement('span');
  preview.className = 'notation-menu-preview';
  const arrow = document.createElement('span');
  arrow.className = 'notation-menu-arrow';
  arrow.textContent = '▾';
  button.append(preview, arrow);

  const list = document.createElement('div');
  list.className = 'notation-menu-list';
  list.setAttribute('role', 'listbox');
  list.hidden = true;

  const choices = [
    { value: 'french', text: 'R D T F C' },
    { value: 'figurines', pieces: ['wK', 'wQ', 'wR', 'wB', 'wN'] },
    { value: 'international', text: 'K Q R B N' },
  ];

  function fill(container, choice) {
    container.innerHTML = '';
    if (choice.pieces) {
      for (const piece of choice.pieces) {
        const image = document.createElement('img');
        image.src = asset('pieces/alpha/' + piece + '.svg');
        image.alt = '';
        image.className = 'notation-menu-piece';
        container.appendChild(image);
      }
    } else {
      container.textContent = choice.text;
    }
  }

  const closeMenu = () => {
    list.hidden = true;
    button.setAttribute('aria-expanded', 'false');
  };

  const update = () => {
    fill(preview, choices.find((c) => c.value === select.value) || choices[0]);
    list.querySelectorAll('.notation-menu-option').forEach((item) => {
      const selected = item.dataset.value === select.value;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
  };

  for (const choice of choices) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'notation-menu-option';
    item.dataset.value = choice.value;
    item.setAttribute('role', 'option');
    fill(item, choice);
    item.addEventListener('click', () => {
      select.value = choice.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      closeMenu();
    });
    list.appendChild(item);
  }

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    list.hidden = !list.hidden;
    button.setAttribute('aria-expanded', list.hidden ? 'false' : 'true');
  });
  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  select.addEventListener('change', update);

  menu.append(button, list);
  select.insertAdjacentElement('afterend', menu);
  update();
}

$('#notation').addEventListener('change', () => {
  updateMoves();
  renderTablebaseMoves();
});

// ==================================================
// BOUTONS PLAY (camp du joueur) ET START
// ==================================================

function setPlayerSide(mode) {
  playerSide = mode;
  document.querySelectorAll('.mode-btn').forEach((button) => {
    const selected = playerSide === button.dataset.mode;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', selected ? 'true' : 'false');
  });
  updateZoneAvailability();
  clearZone();
}

document.querySelectorAll('.mode-btn').forEach((button) => {
  button.addEventListener('click', () => {
    if (playerSide === button.dataset.mode) return; // un mode reste toujours choisi
    setPlayerSide(button.dataset.mode);
    // en partie : Stockfish reprend la main si c'est à lui de jouer
    if (locked) afterPosition();
  });
});

startButtons.w.addEventListener('click', () => onStartClick('w'));
startButtons.b.addEventListener('click', () => onStartClick('b'));

document.querySelectorAll('.shift-btn').forEach((button) => {
  button.addEventListener('click', () => shiftPosition(button.dataset.dir));
});

// ==================================================
// INITIALISATION
// ==================================================

buildPalette();
setupNotationMenu();
setupPgnButton();
setupXpgnControls();
updateCoordinates();
updateNavigation();
updateShiftButtons();
updateStartButtons();
updateZoneAvailability();
setStatus('Position éditable');
