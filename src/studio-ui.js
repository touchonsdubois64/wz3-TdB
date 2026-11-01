// ==================================================
// XPGN STUDIO — nouvelle barre d’outils contextuelle
// Couche d’interface isolée : les fonctions existantes restent inchangées.
// ==================================================

const initStudioUi = () => {
  const wide = window.matchMedia(
    '(orientation: landscape) and (min-width: 1260px) and (min-height: 520px), ' +
    '(orientation: landscape) and (pointer: coarse) and (min-width: 600px) and (max-height: 520px)'
  );
  if (!wide.matches) return;

  const app = document.querySelector('.app');
  const frameLeft = document.querySelector('#frame-left');
  const controls = document.querySelector('.controls');
  if (!app || !frameLeft || !controls) return;

  const icons = {
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 10v7m0-10h.01"/></svg>',
    records: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h14l3 3v15H3V4a1 1 0 0 1 1-1Z"/><path d="M7 3v6h10V3M7 21v-8h10v8"/></svg>',
    settings: '<img src="' + new URL((import.meta.env.DEV ? 'docs/images/' : 'images/') + 'settings.svg', document.baseURI).href + '" alt="" aria-hidden="true">',
    create: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5h9l5 5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/><path d="M14 3.5V9h5M12 12v6m-3-3h6"/></svg>',
    position: '<img src="' + new URL((import.meta.env.DEV ? 'docs/images/' : 'images/') + 'create-position.svg', document.baseURI).href + '" alt="" aria-hidden="true">',
    analysis: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18"/><path d="M8 4h8v7H8zM8 13h8v7H8z" fill="none"/><path d="M8 4h8v7H8z" fill="#171717"/><path d="M8 13h8v7H8z" fill="#fff"/></svg>',
    annotations: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3.5h10l5 5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/><path d="M14 3.5V9h5M7 13h8M7 16h5M15.5 17.5l4-4 1.5 1.5-4 4-2 .5z"/></svg>',
    save: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h14l3 3v15H3V4a1 1 0 0 1 1-1Z"/><path d="M7 3v6h10V3M7 21v-8h10v8"/></svg>'
  };
  const categories = [
    ['info', 'Infos'],
    ['settings', 'Réglages'],
    ['records', 'Enregistrements'],
    ['create', 'Création'],
    ['position', 'Position']
  ];

  const toolbar = document.createElement('nav');
  toolbar.className = 'studio-toolbar';
  toolbar.setAttribute('aria-label', 'Outils XPGN Studio');
  const drawer = document.createElement('aside');
  drawer.className = 'studio-drawer';
  drawer.hidden = true;
  drawer.setAttribute('aria-label', 'Outils');

  const panels = new Map();
  const buttons = new Map();
  let activeCategory = null;

  for (const [id, label] of categories) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'studio-tool';
    button.innerHTML = icons[id] + '<span>' + label + '</span>';
    button.title = label;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-expanded', 'false');
    toolbar.appendChild(button);
    buttons.set(id, button);

    const panel = document.createElement('section');
    panel.className = 'studio-tool-panel';
    panel.dataset.category = id;
    panel.hidden = true;
    const heading = document.createElement('h2');
    heading.textContent = label;
    const content = document.createElement('div');
    content.className = 'studio-panel-content';
    panel.append(heading, content);
    drawer.appendChild(panel);
    panels.set(id, { panel, content });
  }

  // La barre compacte et ses panneaux prennent place dans la colonne à gauche de l'échiquier.
  const workspace = frameLeft.querySelector('.workspace');
  const evaluationColumn = workspace && workspace.querySelector(':scope > .right');
  if (!workspace || !evaluationColumn) return;
  evaluationColumn.prepend(toolbar);
  toolbar.after(drawer);

  // Les outils de position se déploient sous la barre, à gauche de l'échiquier.
  const positionTools = document.createElement('section');
  positionTools.className = 'studio-position-tools';
  positionTools.hidden = true;
  positionTools.setAttribute('aria-label', 'Chargement et préparation de position');
  drawer.after(positionTools);

  const put = (category, element) => {
    const target = panels.get(category);
    if (element && target) target.content.appendChild(element);
  };
  const take = (selector, category) => put(category, document.querySelector(selector));

  // Réglages : paramètres visuels et style de notation.
  take('.cell-settings', 'settings');
  take('.notation-native-select', 'settings');
  take('.notation-menu', 'settings');

  // Infos : rappel du fonctionnement de l'interface.
  const infoDialog = document.createElement('dialog');
  infoDialog.className = 'studio-info-dialog';
  infoDialog.innerHTML = '<div class="studio-info-head"><h2>À propos de XPGN Studio</h2><button type="button" class="studio-info-close" aria-label="Fermer">×</button></div>' +
    '<div class="studio-info-body"><p>XPGN Studio permet de créer, charger, examiner, annoter et enregistrer des positions et des parties d’échecs.</p>' +
    '<p><strong>Infos :</strong> ouvre cette présentation. <strong>Réglages :</strong> personnalise le thème, l’apparence de l’échiquier, les couleurs des cases, la taille des coordonnées et le type de notation.</p>' +
    '<p><strong>Enregistrements :</strong> donne accès aux fonctions d’export et de sauvegarde. <strong>Création :</strong> permet de créer un cours, d’ajouter des positions et du contenu pédagogique.</p>' +
    '<p><strong>Position :</strong> permet de charger une partie ou une position au format PGN, XPGN ou FEN, ou de préparer une position en plaçant manuellement les figurines.</p>' +
    '<p>La palette située au-dessus de l’échiquier sert aux annotations graphiques : couleurs, symboles, formes et flèches. Les commandes d’évaluation permettent de lancer l’analyse Stockfish et d’afficher les zones d’évaluation.</p>' +
    '<p>Les coups de la partie apparaissent dans le panneau de droite. La navigation permet de parcourir les positions successives de la partie.</p></div>';
  document.body.appendChild(infoDialog);
  infoDialog.querySelector('.studio-info-close').addEventListener('click', () => infoDialog.close());
  infoDialog.addEventListener('click', event => { if (event.target === infoDialog) infoDialog.close(); });

  // Création : le formulaire de cours déjà présent dans Studio.
  const actionButtons = [...document.querySelectorAll('.notation-control button')];
  for (const button of actionButtons) {
    const label = (button.textContent || '').trim();
    if (['Nouveau cours', 'Ajouter une position', 'Ajouter texte / exercice', 'Nouveau chapitre'].includes(label)) put('create', button);
    else if (label === 'Commentaire' || label === 'Symbole') put('create', button);
    else if (label === 'PGN' || label === 'XPGN') put('records', button);
    else if (label === 'Ouvrir XPGN') put('position', button);
  }

  // Position : bibliothèque, chargement PGN/FEN et montage manuel.
  // Conserver les champs et la palette de montage ; les commandes de jeu, de trait et d'indices restent hors de ce panneau.
  for (const selector of ['.cell-library', '.cell-pgn', '.cell-fen', '.cell-palette']) {
    const element = document.querySelector(selector);
    if (element) positionTools.appendChild(element);
  }

  // Chargement direct d'un fichier PGN depuis l'ordinateur.
  const pgnFileInput = document.createElement('input');
  pgnFileInput.type = 'file';
  pgnFileInput.accept = '.pgn,.txt,.xpgn,text/plain,application/x-chess-pgn,application/vnd.xpgn+json,application/json';
  pgnFileInput.hidden = true;
  document.body.appendChild(pgnFileInput);
  const browsePgn = document.createElement('button');
  browsePgn.type = 'button';
  browsePgn.className = 'studio-position-action studio-position-browse';
  browsePgn.setAttribute('aria-label', 'Naviguer dans les fichiers et importer un PGN ou un XPGN');
  browsePgn.innerHTML = '<img src="' + new URL((import.meta.env.DEV ? 'docs/images/' : 'images/') + 'open-folder.svg', document.baseURI).href + '" alt="" aria-hidden="true">';
  browsePgn.addEventListener('click', () => pgnFileInput.click());
  pgnFileInput.addEventListener('change', async () => {
    const file = pgnFileInput.files && pgnFileInput.files[0];
    if (!file) return;
    try {
      const isXpgn = file.name.toLowerCase().endsWith('.xpgn') || file.type === 'application/vnd.xpgn+json';
      const maxSize = isXpgn ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        window.alert(isXpgn
          ? 'Fichier XPGN trop volumineux : la taille maximale autorisée est de 25 Mo.'
          : 'Fichier PGN trop volumineux : la taille maximale autorisée est de 10 Mo.');
        return;
      }
      if (isXpgn) {
        await new Promise((resolve) => {
          window.dispatchEvent(new CustomEvent('xpgn:open-file', {
            detail: { file, onComplete: resolve }
          }));
        });
        closeDrawer();
        return;
      }
      const raw = await file.text();
      if (!raw.trim()) { window.alert('Le fichier PGN est vide.'); return; }
      const field = document.querySelector('#pgn');
      field.value = raw.trim();
      field.dispatchEvent(new Event('change', { bubbles: true }));
      window.setTimeout(closeDrawer, 220);
    } catch (error) {
      window.alert('Impossible de lire ce fichier PGN : ' + (error && error.message ? error.message : 'erreur de lecture'));
    } finally {
      pgnFileInput.value = '';
    }
  });
  positionTools.prepend(browsePgn);

  // Raccourcis de préparation : FEN de départ standard et échiquier vide.
  const presets = document.createElement('div');
  presets.className = 'studio-position-presets';
  const setFen = (value) => {
    const field = document.querySelector('#fen');
    field.value = value;
    field.dispatchEvent(new Event('change', { bubbles: true }));
    window.setTimeout(closeDrawer, 220);
  };
  for (const [label, fen, icon] of [
    ['Position initiale', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', 'starting-position.svg'],
    ['Échiquier vide', '8/8/8/8/8/8/8/8 w - - 0 1', 'empty-board.svg']
  ]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'studio-position-action studio-position-preset';
    const image = document.createElement('img');
    image.src = new URL((import.meta.env.DEV ? 'docs/images/' : 'images/') + icon, document.baseURI).href;
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    button.append(image);
    button.title = label;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', () => setFen(fen));
    presets.appendChild(button);
  }
  positionTools.appendChild(presets);
  // Ordre demandé : naviguer, répertoire, PGN, FEN, raccourcis, puis palette.
  const libraryCell = positionTools.querySelector('.cell-library');
  const pgnCell = positionTools.querySelector('.cell-pgn');
  const fenCell = positionTools.querySelector('.cell-fen');
  const paletteCell = positionTools.querySelector('.cell-palette');
  positionTools.append(browsePgn, ...(libraryCell ? [libraryCell] : []),
    ...(pgnCell ? [pgnCell] : []), ...(fenCell ? [fenCell] : []), presets,
    ...(paletteCell ? [paletteCell] : []));

  // Analyse et annotations graphiques : on déplace les éléments existants, sans les recréer.
  // Le panneau d'évaluation reste près de l'échiquier ; la palette graphique
  // est placée au-dessus de celui-ci par placeBlocks() dans app.js.
  const marksPanel = document.querySelector('#marks-panel');
  const boardColumn = document.querySelector('.left');
  if (marksPanel && boardColumn && marksPanel.parentElement !== boardColumn) boardColumn.prepend(marksPanel);
  // La palette reste affichée au-dessus de l'échiquier : aucun bouton crayon séparé.

  // Exporter le diagramme courant en PNG ou JPEG.
  const exportDiagram = async (format, filename = 'diagramme-echecs') => {
    const fenField = document.querySelector('#fen');
    const fen = (fenField && fenField.value.trim()) || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    const rows = fen.split(/\s+/)[0].split('/');
    const glyphs = { K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙', k:'♚', q:'♛', r:'♜', b:'♝', n:'♞', p:'♟' };
    let board;
    try {
      if (rows.length !== 8) throw new Error('FEN invalide');
      board = rows.map(row => {
        const squares = [];
        for (const char of row) {
          if (/^[1-8]$/.test(char)) for (let n = 0; n < Number(char); n++) squares.push('');
          else if (glyphs[char]) squares.push(char);
          else throw new Error('FEN invalide');
        }
        if (squares.length !== 8) throw new Error('FEN invalide');
        return squares;
      });
    } catch (error) {
      window.alert('La position ne peut pas être exportée : FEN invalide.');
      return;
    }

    const canvas = document.createElement('canvas');
    const size = 960, square = size / 8;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) { window.alert('La création de l’image a échoué.'); return; }
    const boardStyle = document.querySelector('#board cg-board');
    const rootStyle = getComputedStyle(document.documentElement);
    const light = rootStyle.getPropertyValue('--board-light').trim() || '#f0d9b5';
    const dark = rootStyle.getPropertyValue('--board-dark').trim() || '#b58863';
    const blackOrientation = Boolean(document.querySelector('#board .orientation-black'));
    const imageCache = new Map();
    const loadPiece = (piece) => {
      if (imageCache.has(piece)) return imageCache.get(piece);
      const color = piece === piece.toUpperCase() ? 'w' : 'b';
      const role = piece.toUpperCase();
      const image = new Image();
      const promise = new Promise((resolve) => {
        image.onload = () => resolve(image);
        image.onerror = () => resolve(null);
        image.src = new URL((import.meta.env.DEV ? './docs/pieces/alpha/' : './pieces/alpha/') + color + role + '.svg', document.baseURI).href;
      });
      imageCache.set(piece, promise);
      return promise;
    };
    const pieces = [...new Set(board.flat().filter(Boolean))];
    const loaded = await Promise.all(pieces.map(async piece => [piece, await loadPiece(piece)]));
    const pieceImages = new Map(loaded);
    for (let displayRank = 0; displayRank < 8; displayRank++) {
      for (let displayFile = 0; displayFile < 8; displayFile++) {
        const rank = blackOrientation ? 7 - displayRank : displayRank;
        const file = blackOrientation ? 7 - displayFile : displayFile;
        ctx.fillStyle = (displayRank + displayFile) % 2 ? dark : light;
        ctx.fillRect(displayFile * square, displayRank * square, square, square);
        const piece = board[rank][file];
        if (!piece) continue;
        const image = pieceImages.get(piece);
        if (image) {
          ctx.drawImage(image, displayFile * square + 5, displayRank * square + 5, square - 10, square - 10);
        } else {
          ctx.font = '104px "DejaVu Sans", "Segoe UI Symbol", serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = piece === piece.toUpperCase() ? '#fff' : '#171717';
          ctx.fillText(glyphs[piece], displayFile * square + square / 2, displayRank * square + square / 2 + 5);
        }
      }
    }
    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const extension = format === 'jpeg' ? 'jpg' : 'png';
    canvas.toBlob(blob => {
      if (!blob) { window.alert('La création de l’image a échoué.'); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = filename.replace(/[\\/:*?"<>|]+/g, '-').replace(/\\s+/g, '-').slice(0, 80) + '.' + extension;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, mime, format === 'jpeg' ? 0.94 : undefined);
  };
  const diagramButton = document.createElement('button');
  diagramButton.type = 'button';
  diagramButton.className = 'export-pgn-button xpgn-action-button studio-diagram-download';
  diagramButton.title = 'Télécharger le diagramme';
  diagramButton.setAttribute('aria-label', 'Télécharger le diagramme');
  diagramButton.innerHTML = '<svg class="studio-board-mark" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19"/><path d="M8.83 2.5v19M15.16 2.5v19M2.5 8.83h19M2.5 15.16h19"/></svg><span>Télécharger le diagramme</span>';
  diagramButton.addEventListener('click', async () => {
    const format = window.prompt('Format du diagramme : png ou jpeg', 'png');
    if (!format) return;
    const normalized = format.trim().toLowerCase();
    if (!['png', 'jpeg', 'jpg'].includes(normalized)) { window.alert('Choisis PNG ou JPEG.'); return; }
    const name = window.prompt('Nom du fichier (sans extension)', 'diagramme-echecs');
    if (name === null) return;
    await exportDiagram(normalized === 'jpg' ? 'jpeg' : normalized, name.trim() || 'diagramme-echecs');
  });
  panels.get('records').content.appendChild(diagramButton);

  // Un seul bouton de diagramme : le clic demande format et nom de fichier.
  const diagramButton = panels.get('records').content.querySelector('.studio-diagram-download');
  if (diagramButton) {
    diagramButton.innerHTML = '<svg class="studio-board-mark" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19"/><path d="M8.83 2.5v19M15.16 2.5v19M2.5 8.83h19M2.5 15.16h19"/></svg><span>Télécharger le diagramme</span>';
    diagramButton.addEventListener('click', async (event) => {
      if (event.__diagramDialogHandled) return;
      event.__diagramDialogHandled = true;
      event.stopImmediatePropagation();
      const format = window.prompt('Format du diagramme : png ou jpeg', 'png');
      if (!format) return;
      const normalized = format.trim().toLowerCase();
      if (!['png', 'jpeg', 'jpg'].includes(normalized)) {
        window.alert('Choisis PNG ou JPEG.');
        return;
      }
      const name = window.prompt('Nom du fichier (sans extension)', 'diagramme-echecs');
      if (name === null) return;
      await exportDiagram(normalized === 'jpg' ? 'jpeg' : normalized, name.trim() || 'diagramme-echecs');
    }, true);
  }
  for (const button of panels.get('records').content.querySelectorAll('button')) {
    if ((button.textContent || '').trim() === 'XPGN' && !button.querySelector('.studio-download-mark')) {
      const mark = document.createElement('span');
      mark.className = 'studio-download-mark';
      mark.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/></svg>';
      button.prepend(mark);
    }
  }

  // Les actions ont quitté leur ancienne ligne de notation.
  const notation = document.querySelector('.notation-control');
  if (notation) notation.hidden = true;
  controls.hidden = true;

  const settingsButton = document.querySelector('#settings-btn');
  const settingsMenu = document.querySelector('#settings-menu');
  const closeSettings = () => {
    if (settingsMenu) settingsMenu.hidden = true;
    if (settingsButton) settingsButton.setAttribute('aria-expanded', 'false');
  };

  function closeDrawer() {
    closeSettings();
    activeCategory = null;
    drawer.hidden = true;
    positionTools.hidden = true;
    for (const [id, button] of buttons) {
      button.classList.remove('selected');
      button.setAttribute('aria-expanded', 'false');
      panels.get(id).panel.hidden = true;
    }
  }

  function openCategory(id) {
    if (id === 'info') {
      closeDrawer();
      if (!infoDialog.open) infoDialog.showModal();
      return;
    }
    if (activeCategory === id) {
      closeDrawer();
      return;
    }
    closeSettings();
    activeCategory = id;
    const isPosition = id === 'position';
    drawer.hidden = isPosition;
    positionTools.hidden = !isPosition;
    for (const [key, button] of buttons) {
      const selected = key === id;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-expanded', selected ? 'true' : 'false');
      panels.get(key).panel.hidden = !selected;
    }
    if (id === 'settings' && settingsButton && settingsMenu && settingsMenu.hidden) settingsButton.click();
  }

  for (const [id, button] of buttons) button.addEventListener('click', () => openCategory(id));

  document.addEventListener('pointerdown', (event) => {
    if ((drawer.hidden && positionTools.hidden) || toolbar.contains(event.target) ||
        drawer.contains(event.target) || positionTools.contains(event.target) || evaluationColumn.contains(event.target)) return;
    closeDrawer();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && (!drawer.hidden || !positionTools.hidden)) closeDrawer();
  });

  // Après chargement/validation d'une position, le panneau Position se replie.
  const closeAfter = (element, eventName) => {
    if (element) element.addEventListener(eventName, () => window.setTimeout(closeDrawer, 180));
  };
  closeAfter(document.querySelector('#pgn'), 'change');
  closeAfter(document.querySelector('#fen'), 'change');
  closeAfter(document.querySelector('#start-white'), 'click');
  closeAfter(document.querySelector('#start-black'), 'click');
  const fileInput = [...document.querySelectorAll('input[type="file"]')].find(input => input.accept.includes('.xpgn'));
  closeAfter(fileInput, 'change');

  // Une sauvegarde validée referme également son panneau.
  for (const button of panels.get('records').content.querySelectorAll('button')) {
    button.addEventListener('click', () => window.setTimeout(closeDrawer, 180));
  }
};

// Attendre que app.js ait créé les boutons dynamiques (cours, commentaires,
// symboles, import/export) avant de répartir les commandes dans les panneaux.
if (document.readyState === 'complete') {
  initStudioUi();
} else {
  window.addEventListener('load', initStudioUi, { once: true });
}
