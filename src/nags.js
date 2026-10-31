// Symboles d'annotation PGN (NAG) : définitions standard 1 à 139.
// Les codes sont conservés dans le PGN ; les glyphes sont une aide d'affichage.
export const MOVE_NAGS = [
  { nag: 1, label: '! Bon coup' },
  { nag: 2, label: '? Mauvais coup' },
  { nag: 3, label: '!! Très bon coup' },
  { nag: 4, label: '?? Très mauvais coup' },
  { nag: 5, label: '!? Coup spéculatif / intéressant' },
  { nag: 6, label: '?! Coup douteux' },
  { nag: 7, label: 'Coup forcé (les autres perdent rapidement)' },
  { nag: 8, label: 'Seul coup raisonnable' },
  { nag: 9, label: 'Pire coup' },
  { nag: 10, label: '= Position nulle' },
  { nag: 11, label: 'Égalité, position calme' },
  { nag: 12, label: 'Égalité, position active' },
  { nag: 13, label: '∞ Position incertaine' },
  { nag: 14, label: '⩲ Léger avantage blanc' },
  { nag: 15, label: '⩱ Léger avantage noir' },
  { nag: 16, label: '± Avantage blanc' },
  { nag: 17, label: '∓ Avantage noir' },
  { nag: 18, label: '+− Avantage décisif blanc' },
  { nag: 19, label: '−+ Avantage décisif noir' },
  { nag: 20, label: '+−− Avantage écrasant blanc' },
  { nag: 21, label: '−−+ Avantage écrasant noir' },
  { nag: 22, label: '⨀ Blancs en zugzwang' },
  { nag: 23, label: '⨀ Noirs en zugzwang' },
  { nag: 24, label: 'Léger avantage spatial blanc' },
  { nag: 25, label: 'Léger avantage spatial noir' },
  { nag: 26, label: 'Avantage spatial blanc' },
  { nag: 27, label: 'Avantage spatial noir' },
  { nag: 28, label: 'Avantage spatial décisif blanc' },
  { nag: 29, label: 'Avantage spatial décisif noir' },
  { nag: 30, label: 'Léger avantage de développement blanc' },
  { nag: 31, label: 'Léger avantage de développement noir' },
  { nag: 32, label: 'Avantage de développement blanc' },
  { nag: 33, label: 'Avantage de développement noir' },
  { nag: 34, label: 'Avantage de développement décisif blanc' },
  { nag: 35, label: 'Avantage de développement décisif noir' },
  { nag: 36, label: '↑ Initiative blanche' },
  { nag: 37, label: '↑ Initiative noire' },
  { nag: 38, label: 'Initiative durable blanche' },
  { nag: 39, label: 'Initiative durable noire' },
  { nag: 40, label: '→ Attaque blanche' },
  { nag: 41, label: '→ Attaque noire' },
  { nag: 42, label: 'Compensation blanche insuffisante' },
  { nag: 43, label: 'Compensation noire insuffisante' },
  { nag: 44, label: '⯹ Compensation blanche suffisante' },
  { nag: 45, label: '⯹ Compensation noire suffisante' },
  { nag: 46, label: 'Compensation blanche plus que suffisante' },
  { nag: 47, label: 'Compensation noire plus que suffisante' },
];

const NAG_GLYPHS = {
  1: '!', 2: '?', 3: '!!', 4: '??', 5: '!?', 6: '?!',
  7: '□', 8: '□', 9: '☒', 10: '=', 11: '=', 12: '=', 13: '∞',
  14: '⩲', 15: '⩱', 16: '±', 17: '∓', 18: '+−', 19: '−+',
22: '⨀', 23: '⨀', 32: '⟳', 33: '⟳',
  36: '↑', 37: '↑', 38: '↑', 39: '↑', 40: '→', 41: '→',
  44: '⯹', 45: '⯹',
};

export function nagGlyph(nag) {
  return NAG_GLYPHS[nag] || null;
}

export function nagDisplay(nag) {
  return nagGlyph(nag) || MOVE_NAGS.find((item) => item.nag === nag)?.label || ('NAG ' + nag);
}
