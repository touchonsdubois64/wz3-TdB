// ==================================================
// RÉGLAGES (roue dentée) : thème général (clair / classique / sombre), aspect de l'échiquier
// (couleurs ou « diag. » façon diagramme de livre), taille des coordonnées et couleurs des cases.
// Les choix sont mémorisés dans le navigateur (localStorage).
// ==================================================

const STORAGE_KEY = 'winning-zone.settings';

const PRESETS = [
  { id: 'classique', label: 'Classique', light: '#f0d9b5', dark: '#bdac8d' },
  { id: 'brun', label: 'Brun', light: '#f0d9b5', dark: '#b58863' },
  { id: 'vert', label: 'Vert', light: '#eeeed2', dark: '#769656' },
  { id: 'bleu', label: 'Bleu', light: '#dee3e6', dark: '#8ca2ad' },
  { id: 'gris', label: 'Gris', light: '#ebebeb', dark: '#a6a6a6' },
];
const DEFAULT = PRESETS[0];

const THEMES = [['clair', 'Clair'], ['classique', 'Classique'], ['dark', 'Sombre']];

// Taille des coordonnées (a-h, 1-8) : multiple de la taille d'origine
const COORD_SIZES = [
  { id: 'petites', label: 'Petites', scale: 1 },
  { id: 'moyennes', label: 'Moyennes', scale: 1.5 },
  { id: 'grandes', label: 'Grandes', scale: 2 },
];

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved) {
      const valid = (value) => /^#[0-9a-f]{6}$/i.test(value);
      return {
        light: valid(saved.light) ? saved.light : DEFAULT.light,
        dark: valid(saved.dark) ? saved.dark : DEFAULT.dark,
        theme: THEMES.some(([id]) => id === saved.theme) ? saved.theme : 'classique',
        board: saved.board === 'diag' ? 'diag' : 'couleurs',
        coords: COORD_SIZES.some((size) => size.id === saved.coords) ? saved.coords : 'petites',
      };
    }
  } catch (error) {
    /* stockage indisponible : on garde les réglages par défaut */
  }
  return { light: DEFAULT.light, dark: DEFAULT.dark, theme: 'classique', board: 'couleurs', coords: 'petites' };
}

function save(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    /* sans importance : le réglage vaut pour la session */
  }
}

function apply(settings) {
  const root = document.documentElement;
  root.style.setProperty('--board-light', settings.light);
  root.style.setProperty('--board-dark', settings.dark);
  if (settings.theme === 'dark' || settings.theme === 'clair') root.setAttribute('data-theme', settings.theme);
  else root.removeAttribute('data-theme');
  const size = COORD_SIZES.find((entry) => entry.id === settings.coords) || COORD_SIZES[0];
  root.style.setProperty('--coord-scale', String(size.scale));
  // aspect « diag. » : cases blanches / hachurées + contour noir (voir style.css)
  if (settings.board === 'diag') root.setAttribute('data-board', 'diag');
  else root.removeAttribute('data-board');
}

export function setupSettings({ button, menu }) {
  let settings = load();
  apply(settings);

  const close = () => {
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
  };

  function render() {
    // Conserver le menu de notation déjà créé par app.js lorsqu'on reconstruit les réglages.
    const existingNotationMenu = menu.querySelector('.notation-menu') || document.querySelector('.notation-menu');
    menu.innerHTML = '';

    const title = document.createElement('p');
    title.className = 'settings-title';
    title.textContent = 'Réglages';
    menu.appendChild(title);

    const themeTitle = document.createElement('p');
    themeTitle.className = 'settings-section';
    themeTitle.textContent = 'Thème';
    menu.appendChild(themeTitle);

    const themes = document.createElement('div');
    themes.className = 'settings-presets';
    for (const [id, label] of THEMES) {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = 'settings-preset settings-theme' + (settings.theme === id ? ' selected' : '');
      element.dataset.theme = id;
      element.setAttribute('aria-pressed', settings.theme === id ? 'true' : 'false');
      element.textContent = label;
      element.addEventListener('click', () => change({ ...settings, theme: id }));
      themes.appendChild(element);
    }
    menu.appendChild(themes);

    const boardTitle = document.createElement('p');
    boardTitle.className = 'settings-section';
    boardTitle.textContent = 'Échiquier';
    menu.appendChild(boardTitle);

    const boards = document.createElement('div');
    boards.className = 'settings-presets';
    for (const [id, label] of [['couleurs', 'Couleurs'], ['diag', 'Diag.']]) {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = 'settings-preset settings-theme' + (settings.board === id ? ' selected' : '');
      element.dataset.board = id;
      element.setAttribute('aria-pressed', settings.board === id ? 'true' : 'false');
      element.title = id === 'diag' ? 'Rendu diagramme de livre : cases blanches et hachurées, contour noir' : 'Cases colorées';
      element.textContent = label;
      element.addEventListener('click', () => change({ ...settings, board: id }));
      boards.appendChild(element);
    }
    menu.appendChild(boards);

    // les couleurs restent modifiables en mode « Diag. », mais sont sans effet tant qu'il est actif
    const colorBlock = document.createElement('div');
    colorBlock.className = 'settings-colorblock' + (settings.board === 'diag' ? ' inactive' : '');
    menu.appendChild(colorBlock);

    const section = document.createElement('p');
    section.className = 'settings-section';
    section.textContent = settings.board === 'diag' ? 'Couleurs des cases (inactives en mode Diag.)' : 'Couleurs des cases';
    colorBlock.appendChild(section);

    const presets = document.createElement('div');
    presets.className = 'settings-presets';
    for (const preset of PRESETS) {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = 'settings-preset' + (preset.light === settings.light && preset.dark === settings.dark ? ' selected' : '');
      element.setAttribute('aria-pressed', preset.light === settings.light && preset.dark === settings.dark ? 'true' : 'false');
      element.innerHTML =
        `<span class="settings-swatch"><i style="background:${preset.light}"></i><i style="background:${preset.dark}"></i></span>` +
        `<span>${preset.label}</span>`;
      element.addEventListener('click', () => change({ ...settings, light: preset.light, dark: preset.dark }));
      presets.appendChild(element);
    }
    colorBlock.appendChild(presets);

    const colors = document.createElement('div');
    colors.className = 'settings-colors';
    const makePicker = (label, key) => {
      const wrapper = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'color';
      input.setAttribute('aria-label', `Couleur des cases ${label.toLowerCase()}`);
      input.value = settings[key];
      input.addEventListener('input', () => change({ ...settings, [key]: input.value }, false));
      wrapper.append(document.createTextNode(label), input);
      return wrapper;
    };
    colors.append(makePicker('Claires', 'light'), makePicker('Foncées', 'dark'));
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'settings-reset';
    reset.textContent = 'Rétablir';
    reset.addEventListener('click', () => change({ ...settings, light: DEFAULT.light, dark: DEFAULT.dark }));
    colors.appendChild(reset);
    colorBlock.appendChild(colors);


    const coordTitle = document.createElement('p');
    coordTitle.className = 'settings-section';
    coordTitle.textContent = 'Coordonnées';
    menu.appendChild(coordTitle);

    const coords = document.createElement('div');
    coords.className = 'settings-presets';
    for (const size of COORD_SIZES) {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = 'settings-preset settings-theme' + (settings.coords === size.id ? ' selected' : '');
      element.dataset.coords = size.id;
      element.setAttribute('aria-pressed', settings.coords === size.id ? 'true' : 'false');
      element.textContent = size.label;
      element.addEventListener('click', () => change({ ...settings, coords: size.id }));
      coords.appendChild(element);
    }
    menu.appendChild(coords);

    const notationTitle = document.createElement('p');
    notationTitle.className = 'settings-section';
    notationTitle.textContent = 'Type de notation';
    menu.appendChild(notationTitle);
    if (existingNotationMenu) menu.appendChild(existingNotationMenu);

  }

  function change(next, redraw = true) {
    const active = menu.contains(document.activeElement) ? document.activeElement : null;
    const focusKey = active?.dataset?.theme ? 'theme:' + active.dataset.theme
      : active?.dataset?.board ? 'board:' + active.dataset.board
      : active?.dataset?.coords ? 'coords:' + active.dataset.coords
      : active?.classList?.contains('settings-reset') ? 'reset'
      : active?.type === 'color' ? 'color:' + (active.getAttribute('aria-label') || '') : null;
    settings = next;
    apply(settings);
    save(settings);
    if (redraw) {
      render();
      if (focusKey) {
        const target = focusKey.startsWith('theme:') ? menu.querySelector('[data-theme="' + focusKey.slice(6) + '"]')
          : focusKey.startsWith('board:') ? menu.querySelector('[data-board="' + focusKey.slice(6) + '"]')
          : focusKey.startsWith('coords:') ? menu.querySelector('[data-coords="' + focusKey.slice(7) + '"]')
          : focusKey === 'reset' ? menu.querySelector('.settings-reset')
          : [...menu.querySelectorAll('input[type="color"]')].find((input) => input.getAttribute('aria-label') === focusKey.slice(6));
        target?.focus();
      }
    }
  }

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    if (menu.hidden) {
      render();
      menu.hidden = false;
      button.setAttribute('aria-expanded', 'true');
    } else {
      close();
    }
  });
  document.addEventListener('click', (event) => {
    const path = event.composedPath();
    if (!menu.hidden && !path.includes(menu) && !path.includes(button)) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}
