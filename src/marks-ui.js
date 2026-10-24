// ==================================================
// ANNOTATIONS : barre d'outils et interaction
// ==================================================
//
// Le bouton « crayon » ouvre la barre d'outils. Tant qu'elle est ouverte, un clic
// sur une case pose (ou retire) l'annotation choisie ; les pièces peuvent toujours
// être déplacées par glisser-déposer. Fermée, la barre laisse les annotations affichées.
//
// Agencement : couleurs / « 0-20 a-z A-Z Texte » / pictogrammes « Figurines Formes Contours Zones » /
// « Gomme Effacer tout » / puis les outils du groupe choisi.
// ==================================================

import {
  COLORS,
  LOWERCASE,
  NUMBERS,
  PIECE_LETTERS,
  SHAPES,
  TWO_CLICK,
  UPPERCASE,
  createMarkSet,
  glyphSvg,
  renderSvg,
} from './marks.js';

const asset = (path) => new URL(path, document.baseURI).href;

// Pictogrammes des groupes d'outils
const PICT = {
  figurines: () =>
    `<img src="${asset('pieces/alpha/wN.svg')}" alt=""><img src="${asset('pieces/alpha/bR.svg')}" alt="">`,
  formes:
    '<svg viewBox="0 0 64 32" aria-hidden="true"><circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" stroke-width="3.5"/><polygon points="48,5 60,27 36,27" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/></svg>',
  contours:
    '<svg viewBox="0 0 64 32" aria-hidden="true"><rect x="6" y="6" width="26" height="20" fill="#fff" stroke="#9a9a9a" stroke-width="1"/><rect x="32" y="6" width="26" height="20" fill="#b9b9b9"/><rect x="2" y="2" width="60" height="28" fill="none" stroke="#e02424" stroke-width="4"/></svg>',
  zones:
    '<svg viewBox="0 0 64 32" aria-hidden="true"><rect x="6" y="6" width="26" height="20" fill="#fff" stroke="#9a9a9a" stroke-width="1"/><rect x="32" y="6" width="26" height="20" fill="#b9b9b9"/><rect x="2" y="2" width="60" height="28" fill="#e02424" fill-opacity=".5" stroke="#e02424" stroke-width="4"/></svg>',
};

const PIECE_NAMES = { K: 'Roi', Q: 'Dame', R: 'Tour', B: 'Fou', N: 'Cavalier', P: 'Pion' };

export function setupMarks({ layer, panel, buttons, isWhite, onActiveChange }) {
  const marks = createMarkSet();
  let active = false;
  let colorId = 'rouge';
  let tool = { type: 'shape', value: 'circle' };
  let previousTool = tool; // pour revenir de la gomme
  let arrowStart = null;

  const colorButtons = [];
  const toolButtons = [];
  const groupTabs = {};
  const groupPanels = {};
  let eraserButton = null;
  let labelInput = null;

  function render() {
    layer.innerHTML = renderSvg(marks.items, isWhite(), arrowStart);
  }

  const isSelected = (entry) => tool.type === entry.type && tool.value === entry.value;

  function refreshButtons() {
    colorButtons.forEach(({ element, id }) => element.classList.toggle('selected', id === colorId));
    toolButtons.forEach((entry) => {
      entry.element.classList.toggle('selected', isSelected(entry));
      if (entry.preview) entry.element.innerHTML = glyphSvg(entry.type, entry.value, colorId);
    });
    if (eraserButton) eraserButton.classList.toggle('selected', tool.type === 'erase');
  }

  function selectTool(type, value = '') {
    if (type !== 'erase') previousTool = { type, value };
    tool = { type, value };
    arrowStart = null;
    refreshButtons();
    render();
  }

  // ---- construction de la barre d'outils
  panel.innerHTML = '';
  const addRow = (className, parent = panel) => {
    const row = document.createElement('div');
    row.className = 'marks-row ' + className;
    parent.appendChild(row);
    return row;
  };
  const addButton = (row, className, label, onClick) => {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = className;
    element.textContent = label;
    element.addEventListener('click', onClick);
    row.appendChild(element);
    return element;
  };

  // 1. couleurs
  const colorsRow = addRow('marks-colors');
  for (const color of COLORS) {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = 'marks-color' + (color.id === 'blanc' ? ' light' : '');
    element.style.setProperty('--c', color.hex);
    element.title = color.label;
    element.setAttribute('aria-label', color.label);
    element.addEventListener('click', () => {
      colorId = color.id;
      refreshButtons();
    });
    colorsRow.appendChild(element);
    colorButtons.push({ element, id: color.id });
  }

  // 2 et 3. onglets des groupes
  const tabsA = addRow('marks-tabs');
  const tabsB = addRow('marks-tabs');
  // 4. actions
  const actionsRow = addRow('marks-tabs');
  // 5. contenu du groupe choisi
  const content = addRow('marks-content');
  content.classList.remove('marks-row');

  function showGroup(id) {
    for (const key of Object.keys(groupPanels)) {
      groupPanels[key].hidden = key !== id;
      groupTabs[key].classList.toggle('selected', key === id);
    }
    // ces deux groupes n'ont qu'un seul outil : il est choisi d'office
    if (id === 'texte') selectTool('label');
    if (id === 'contours') selectTool('border');
    if (id === 'zones') selectTool('zone');
  }

  function addGroup(id, label, tabsRow, pictogram = null) {
    groupTabs[id] = addButton(tabsRow, 'marks-tab' + (pictogram ? ' pict' : ''), pictogram ? '' : label, () => showGroup(id));
    if (pictogram) {
      groupTabs[id].innerHTML = typeof pictogram === 'function' ? pictogram() : pictogram;
      groupTabs[id].title = label;
      groupTabs[id].setAttribute('aria-label', label);
    }
    const body = document.createElement('div');
    body.className = 'marks-group';
    body.hidden = true;
    content.appendChild(body);
    groupPanels[id] = body;
    return body;
  }

  function addTool(parent, type, value, { label, preview = false, text = null, html = null }) {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = 'marks-tool';
    element.title = label;
    element.setAttribute('aria-label', label);
    if (text !== null) element.textContent = text;
    if (html !== null) element.innerHTML = html;
    element.addEventListener('click', () => selectTool(type, value));
    parent.appendChild(element);
    toolButtons.push({ element, type, value, preview });
  }

  const flowRow = (parent) => {
    const row = document.createElement('div');
    row.className = 'marks-row';
    parent.appendChild(row);
    return row;
  };

  // nombres 0-20, minuscules, majuscules
  const numbers = addGroup('nombres', '0-20', tabsA);
  const numbersRow = flowRow(numbers);
  for (const value of NUMBERS) addTool(numbersRow, 'text', value, { label: 'Nombre ' + value, text: value });

  const lower = addGroup('minuscules', 'a-z', tabsA);
  const lowerRow = flowRow(lower);
  for (const letter of LOWERCASE) addTool(lowerRow, 'text', letter, { label: 'Lettre ' + letter, text: letter });

  const upper = addGroup('majuscules', 'A-Z', tabsA);
  const upperRow = flowRow(upper);
  for (const letter of UPPERCASE) addTool(upperRow, 'text', letter, { label: 'Lettre ' + letter, text: letter });

  // texte libre
  const free = addGroup('texte', 'Texte', tabsA);
  labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.className = 'marks-text text-field';
  labelInput.maxLength = 30;
  labelInput.placeholder = "Texte court, ex. a', b'', 12…";
  labelInput.setAttribute('aria-label', 'Texte libre à poser sur une case');
  labelInput.autocomplete = 'off';
  labelInput.spellcheck = false;
  labelInput.addEventListener('focus', () => selectTool('label'));
  labelInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') labelInput.blur();
  });
  free.appendChild(labelInput);
  const freeHint = document.createElement('p');
  freeHint.className = 'marks-hint';
  freeHint.textContent = 'Saisissez le texte, puis cliquez une case : il y est centré et peut déborder sur les cases voisines.';
  free.appendChild(freeHint);

  // figurines : deux rangées comme dans l'éditeur de position (style creux puis style plein)
  const figurines = addGroup('figurines', 'Figurines', tabsB, PICT.figurines);
  for (const style of ['w', 'b']) {
    const row = flowRow(figurines);
    for (const letter of PIECE_LETTERS) {
      addTool(row, 'piece', letter + ':' + style, { label: PIECE_NAMES[letter] + (style === 'w' ? ' (creux)' : ' (plein)'), preview: true });
    }
  }

  // formes
  const shapes = addGroup('formes', 'Formes', tabsB, PICT.formes);
  const shapesRow = flowRow(shapes);
  for (const shape of SHAPES) addTool(shapesRow, shape.type, shape.value, { label: shape.label, preview: true });

  // bordures
  const borders = addGroup('contours', 'Contours', tabsB, PICT.contours);
  const borderHint = document.createElement('p');
  borderHint.className = 'marks-hint';
  borderHint.textContent =
    'Cliquez les cases de la zone à entourer : seul le contour extérieur est tracé (un clic de plus retire la case).';
  borders.appendChild(borderHint);

  // zones : même principe, intérieur coloré à moitié transparent
  const zones = addGroup('zones', 'Zones', tabsB, PICT.zones);
  const zoneHint = document.createElement('p');
  zoneHint.className = 'marks-hint';
  zoneHint.textContent =
    'Cliquez les cases de la zone : les cases voisines fusionnent et l’intérieur est coloré à moitié transparent. Deux zones superposées mélangent leurs couleurs.';
  zones.appendChild(zoneHint);

  // 4. gomme, effacer tout, fermer
  eraserButton = document.createElement('button');
  eraserButton.type = 'button';
  eraserButton.className = 'marks-tab marks-eraser';
  eraserButton.title = 'Gomme : efface tout ce qui touche la case cliquée';
  eraserButton.textContent = 'Gomme';
  eraserButton.addEventListener('click', () => {
    if (tool.type === 'erase') selectTool(previousTool.type, previousTool.value);
    else selectTool('erase');
  });
  actionsRow.appendChild(eraserButton);
  addButton(actionsRow, 'marks-tab', 'Effacer tout', () => api.clear());

  showGroup('formes');
  refreshButtons();

  // ---- ouverture / fermeture : le crayon (un par disposition) bascule ; un clic en dehors de la barre
  // et de l'échiquier la referme.
  for (const button of buttons) button.addEventListener('click', () => api.setActive(!active));
  // (on réagit au « click » et non à l'appui : la barre se replie après l'action du bouton cliqué,
  // sinon la mise en page bougerait entre l'appui et le relâchement et le clic serait perdu)
  document.addEventListener(
    'click',
    (event) => {
      if (!active || !event.target.closest) return;
      if (event.target.closest('#marks-panel, .marks-opener, .board-and-files')) return;
      api.setActive(false);
    },
    true,
  );
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && arrowStart) {
      arrowStart = null;
      render();
    }
  });

  const api = {
    isActive: () => active,

    setActive(value) {
      if (value === active) return;
      active = value;
      panel.hidden = !active;
      for (const button of buttons) {
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      }
      document.body.classList.toggle('marking', active);
      arrowStart = null;
      render();
      if (onActiveChange) onActiveChange(active);
    },

    /** Clic sur une case de l'échiquier alors que l'outil est actif. */
    click(key) {
      if (!active) return;

      if (tool.type === 'erase') {
        marks.eraseAt(key);
        arrowStart = null;
      } else if (TWO_CLICK.has(tool.type)) {
        if (!arrowStart) arrowStart = key;
        else if (arrowStart === key) arrowStart = null;
        else {
          marks.toggleLink(tool.type, arrowStart, key, colorId);
          arrowStart = null;
        }
      } else if (tool.type === 'border') {
        marks.toggleBorder(key, colorId);
      } else if (tool.type === 'zone') {
        marks.toggleZone(key, colorId);
      } else if (tool.type === 'label') {
        const text = labelInput.value.trim();
        if (!text) {
          labelInput.focus();
          return;
        }
        marks.placeSquare(key, 'label', text, colorId);
      } else {
        marks.placeSquare(key, tool.type, tool.value, colorId);
      }
      render();
    },

    clear() {
      marks.clear();
      arrowStart = null;
      render();
    },

    render,
  };

  render();
  return api;
}
