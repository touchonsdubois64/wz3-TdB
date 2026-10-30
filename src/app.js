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
import { parsePgn } from './pgn.js';
import { setupMarks } from './marks-ui.js';
import { attachXpgnAnnotations, getXpgnNodePath, parseXpgn, stringifyXpgn } from './xpgn.js';
import { setupSettings } from './settings.js';

import './style.css';
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
    currentNode.xpgnAnnotations = items;
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
      ? name + ' ont le trait : figer la position et commencer'
      : active
        ? 'Revenir à l’édition de la position'
        : name + ' ont le trait : l’autre camp passe (coup « -- » dans une variante entre crochets)';
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
