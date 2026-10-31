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
  const frameRight = document.querySelector('#frame-right');
  const controls = document.querySelector('.controls');
  if (!app || !frameLeft || !frameRight || !controls) return;

  const icons = {
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"/><path d="m19.4 13.5 1.1.9-1.6 2.8-1.4-.5a7.8 7.8 0 0 1-1.6.9l-.2 1.5h-3.3l-.2-1.5a7.8 7.8 0 0 1-1.6-.9l-1.4.5-1.6-2.8 1.1-.9a7 7 0 0 1 0-1.9l-1.1-.9 1.6-2.8 1.4.5a7.8 7.8 0 0 1 1.6-.9l.2-1.5h3.3l.2 1.5a7.8 7.8 0 0 1 1.6.9l1.4-.5 1.6 2.8-1.1.9a7 7 0 0 1 0 1.9Z"/></svg>',
    create: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5h9l5 5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/><path d="M14 3.5V9h5M12 12v6m-3-3h6"/></svg>',
    position: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h18v18H3zM3 12h18M12 3v18"/><path d="M7 7h2v2H7zM15 15h2v2h-2z" fill="currentColor"/><path d="M17.5 5.5v5m-2.5-2.5h5"/></svg>',
    analysis: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18"/><path d="M8 4h8v7H8zM8 13h8v7H8z" fill="none"/><path d="M8 4h8v7H8z" fill="#171717"/><path d="M8 13h8v7H8z" fill="#fff"/></svg>',
    annotations: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3.5h10l5 5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/><path d="M14 3.5V9h5M7 13h8M7 16h5M15.5 17.5l4-4 1.5 1.5-4 4-2 .5z"/></svg>',
    save: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h14l3 3v15H3V4a1 1 0 0 1 1-1Z"/><path d="M7 3v6h10V3M7 21v-8h10v8"/></svg>'
  };
  const categories = [
    ['settings', 'Réglages'],
    ['create', 'Création'],
    ['position', 'Position'],
    ['analysis', 'Analyse'],
    ['annotations', 'Annotations'],
    ['save', 'Sauvegarde']
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

  app.prepend(toolbar);
  app.appendChild(drawer);

  const put = (category, element) => {
    if (element) panels.get(category).content.appendChild(element);
  };
  const take = (selector, category) => put(category, document.querySelector(selector));

  // Réglages : paramètres visuels et style de notation.
  take('.cell-settings', 'settings');
  take('.notation-native-select', 'settings');
  take('.notation-menu', 'settings');

  // Création : le formulaire de cours déjà présent dans Studio.
  const actionButtons = [...document.querySelectorAll('.notation-control button')];
  for (const button of actionButtons) {
    const label = (button.textContent || '').trim();
    if (label === 'Nouveau cours') put('create', button);
    else if (label === 'Commentaire' || label === 'Symbole') put('annotations', button);
    else if (label === 'PGN' || label === 'XPGN') put('save', button);
    else if (label === 'Ouvrir XPGN') put('position', button);
  }

  // Position : bibliothèque, chargement PGN/FEN et montage manuel.
  for (const selector of ['.cell-library', '.cell-pgn', '.cell-fen', '.cell-palette', '.cell-start', '.cell-play', '.cell-hints']) {
    take(selector, 'position');
  }

  // Analyse et annotations graphiques : on déplace les éléments existants, sans les recréer.
  take('.right', 'analysis');
  take('#marks-panel', 'annotations');
  const marksOpener = document.querySelector('.marks-opener');
  put('annotations', marksOpener);

  // Les actions ont quitté leur ancienne ligne de notation.
  const notation = document.querySelector('.notation-control');
  if (notation) notation.hidden = true;
  controls.hidden = true;

  function closeDrawer() {
    if (activeCategory === 'annotations' && marksOpener && marksOpener.classList.contains('active')) {
      marksOpener.click();
    }
    activeCategory = null;
    drawer.hidden = true;
    for (const [id, button] of buttons) {
      button.classList.remove('selected');
      button.setAttribute('aria-expanded', 'false');
      panels.get(id).panel.hidden = true;
    }
  }

  function openCategory(id) {
    if (activeCategory === id) {
      closeDrawer();
      return;
    }
    activeCategory = id;
    drawer.hidden = false;
    for (const [key, button] of buttons) {
      const selected = key === id;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-expanded', selected ? 'true' : 'false');
      panels.get(key).panel.hidden = !selected;
    }
    if (id === 'annotations' && marksOpener && !marksOpener.classList.contains('active')) {
      marksOpener.click();
    }
  }

  for (const [id, button] of buttons) button.addEventListener('click', () => openCategory(id));

  document.addEventListener('pointerdown', (event) => {
    if (drawer.hidden || toolbar.contains(event.target) || drawer.contains(event.target)) return;
    closeDrawer();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !drawer.hidden) closeDrawer();
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
  for (const button of panels.get('save').content.querySelectorAll('button')) {
    button.addEventListener('click', () => window.setTimeout(closeDrawer, 180));
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStudioUi, { once: true });
} else {
  initStudioUi();
}
