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
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"/><path d="m19.4 13.5 1.1.9-1.5 2.6-1.4-.6a7.8 7.8 0 0 1-1.7 1l-.2 1.5h-3l-.3-1.5a7.8 7.8 0 0 1-1.7-1l-1.4.6-1.5-2.6 1.1-.9a7 7 0 0 1 0-2l-1.1-.9 1.5-2.6 1.4.6a7.8 7.8 0 0 1 1.7-1l.3-1.5h3l.2 1.5a7.8 7.8 0 0 1 1.7 1l1.4-.6 1.5 2.6-1.1.9a7 7 0 0 1 0 2Z"/></svg>
    create: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5h9l5 5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/><path d="M14 3.5V9h5M12 12v6m-3-3h6"/></svg>',
    position: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h18v18H3zM3 12h18M12 3v18"/><path d="M7 7h2v2H7zM15 15h2v2h-2z" fill="currentColor"/><path d="M17.5 5.5v5m-2.5-2.5h5"/></svg>',
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
  pgnFileInput.accept = '.pgn,.txt,text/plain,application/x-chess-pgn';
  pgnFileInput.hidden = true;
  document.body.appendChild(pgnFileInput);
  const browsePgn = document.createElement('button');
  browsePgn.type = 'button';
  browsePgn.className = 'studio-position-action';
  browsePgn.innerHTML = '<span aria-hidden="true">📂</span> Naviguer — ouvrir un PGN';
  browsePgn.addEventListener('click', () => pgnFileInput.click());
  pgnFileInput.addEventListener('change', async () => {
    const file = pgnFileInput.files && pgnFileInput.files[0];
    if (!file) return;
    try {
      const raw = await file.text();
      if (!raw.trim()) { window.alert('Le fichier PGN est vide.'); return; }
      const field = document.querySelector('#pgn');
      field.value = raw.replace(/\s+/g, ' ').trim();
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
  for (const [label, fen, symbol] of [
    ['Position initiale', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '🚩'],
    ['Échiquier vide', '8/8/8/8/8/8/8/8', '▦']
  ]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'studio-position-action studio-position-preset';
    button.innerHTML = '<span aria-hidden="true">' + symbol + '</span> ' + label;
    button.addEventListener('click', () => setFen(fen));
    presets.appendChild(button);
  }
  positionTools.appendChild(presets);

  // Analyse et annotations graphiques : on déplace les éléments existants, sans les recréer.
  // Le panneau d'évaluation reste près de l'échiquier ; la palette graphique
  // est placée au-dessus de celui-ci par placeBlocks() dans app.js.
  const marksPanel = document.querySelector('#marks-panel');
  const boardColumn = document.querySelector('.left');
  if (marksPanel && boardColumn && marksPanel.parentElement !== boardColumn) boardColumn.prepend(marksPanel);
  // La palette reste affichée au-dessus de l'échiquier : aucun bouton crayon séparé.

  // Exporter le diagramme courant en image PNG, sans dépendance externe.
  const diagramButton = document.createElement('button');
  diagramButton.type = 'button';
  diagramButton.className = 'export-pgn-button xpgn-action-button studio-diagram-download';
  diagramButton.innerHTML = '<span class="studio-download-mark" aria-hidden="true">↓</span><span aria-hidden="true">▦</span> Télécharger le diagramme (PNG)';
  diagramButton.addEventListener('click', () => {
    const fenField = document.querySelector('#fen');
    const fen = (fenField && fenField.value.trim()) || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    const placement = fen.split(/\s+/)[0];
    const rows = placement.split('/');
    if (rows.length !== 8) {
      window.alert('La position affichée ne contient pas un FEN valide.');
      return;
    }
    const glyphs = { K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙', k:'♚', q:'♛', r:'♜', b:'♝', n:'♞', p:'♟' };
    let board;
    try {
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
      if (board.length !== 8) throw new Error('FEN invalide');
    } catch (error) {
      window.alert('La position ne peut pas être exportée : FEN invalide.');
      return;
    }
    const canvas = document.createElement('canvas');
    const size = 960, square = size / 8;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const light = getComputedStyle(document.documentElement).getPropertyValue('--board-light').trim() || '#f0d9b5';
    const dark = getComputedStyle(document.documentElement).getPropertyValue('--board-dark').trim() || '#b58863';
    for (let rank = 0; rank < 8; rank++) for (let file = 0; file < 8; file++) {
      ctx.fillStyle = (rank + file) % 2 ? dark : light;
      ctx.fillRect(file * square, rank * square, square, square);
      const piece = board[rank][file];
      if (piece) {
        ctx.font = '104px "DejaVu Sans", "Segoe UI Symbol", serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = piece === piece.toUpperCase() ? '#fff' : '#171717';
        ctx.shadowColor = piece === piece.toUpperCase() ? '#222' : '#fff';
        ctx.shadowBlur = 2;
        ctx.fillText(glyphs[piece], file * square + square / 2, rank * square + square / 2 + 5);
        ctx.shadowBlur = 0;
      }
    }
    canvas.toBlob(blob => {
      if (!blob) { window.alert('La création de l’image a échoué.'); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = 'diagramme-echecs.png';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  });
  panels.get('records').content.appendChild(diagramButton);

  // Harmoniser visuellement les deux exports avec une flèche de téléchargement.
  for (const button of panels.get('records').content.querySelectorAll('button')) {
    if ((button.textContent || '').trim() === 'XPGN' && !button.querySelector('.studio-download-mark')) {
      const mark = document.createElement('span');
      mark.className = 'studio-download-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = '↓';
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
