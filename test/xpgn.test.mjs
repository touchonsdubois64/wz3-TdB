import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { parsePgn } from '../src/pgn.js';
import {
  attachXpgnAnnotations, getXpgnNodePath, parseXpgn, stringifyXpgn,
  validateXpgnDocument,
} from '../src/xpgn.js';

const sample = (annotations = []) => ({
  format: 'XPGN',
  version: 1,
  game: { pgn: '1. e4 e5 (1... c5) 2. Nf3 *' },
  annotations,
});

test('document XPGN : aller-retour JSON et normalisation', () => {
  const document = sample([{
    id: 'idee',
    at: { path: ['e2e4', 'e7e5'] },
    items: [{ type: 'shape', value: 'circle', color: 'rouge', key: 'f7' }],
  }]);
  const text = stringifyXpgn(document);
  const parsed = parseXpgn(text);
  assert.equal(parsed.format, 'XPGN');
  assert.equal(parsed.version, 1);
  assert.equal(parsed.annotations[0].id, 'idee');
  assert.deepEqual(parsed.annotations[0].at.path, ['e2e4', 'e7e5']);
  assert.equal(parsed.annotations[0].items[0].key, 'f7');
});

test('identité du nœud : les variantes ont des chemins distincts', () => {
  const parsed = parsePgn(sample().game.pgn, Chess);
  const e4 = parsed.root.children[0];
  const e5 = e4.children[0];
  const c5 = e4.children[1];
  assert.deepEqual(getXpgnNodePath(parsed.root), []);
  assert.deepEqual(getXpgnNodePath(e5), ['e2e4', 'e7e5']);
  assert.deepEqual(getXpgnNodePath(c5), ['e2e4', 'c7c5']);
});

test('attachement aux nœuds et signalement des chemins inconnus', () => {
  const parsed = parsePgn(sample().game.pgn, Chess);
  const annotations = [
    { at: { path: ['e2e4', 'e7e5'] }, items: [{ type: 'shape', value: 'circle', color: 'rouge', key: 'f7' }] },
    { at: { path: ['d2d4'] }, items: [{ type: 'shape', value: 'circle', color: 'bleu', key: 'd5' }] },
  ];
  const result = attachXpgnAnnotations(parsed.root, annotations);
  assert.equal(result.attached, 1);
  assert.equal(result.unresolved.length, 1);
  assert.equal(parsed.root.children[0].children[0].xpgnAnnotations[0].key, 'f7');
});

test('refuse les signatures, versions, JSON et chemins invalides', () => {
  assert.throws(() => parseXpgn('{'), /JSON illisible/);
  assert.throws(() => validateXpgnDocument({ ...sample(), format: 'PGN' }), /signature/);
  assert.throws(() => validateXpgnDocument({ ...sample(), version: 99 }), /version/);
  assert.throws(() => validateXpgnDocument(sample([{ at: { path: ['e2-e4'] }, items: [{ type: 'shape', value: 'circle', color: 'rouge', key: 'e4' }] }])), /chemin/);
  assert.throws(() => validateXpgnDocument(sample([{ at: { path: [] }, items: [] }])), /au moins un élément/);
});

test('refuse les identifiants dupliqués', () => {
  const item = { id: 'same', at: { path: [] }, items: [{ type: 'shape', value: 'circle', color: 'rouge', key: 'e4' }] };
  assert.throws(() => validateXpgnDocument(sample([item, item])), /dupliqué/);
});


test('le format XPGN conserve les familles d’annotations de l’éditeur', () => {
  const items = [
    { type: 'shape', value: 'star', color: 'rouge', key: 'e4' },
    { type: 'text', value: 'sym:+', color: 'bleu', key: 'd5' },
    { type: 'text', value: '12', color: 'vert', key: 'c4' },
    { type: 'label', value: 'plan A', color: 'violet', key: 'f6' },
    { type: 'piece', value: 'K:b', color: 'noir', key: 'g2' },
    { type: 'border', value: '', color: 'orange', key: 'a1' },
    { type: 'zone', value: '', color: 'jaune', key: 'a2' },
    { type: 'fill', value: '', color: 'cyan', key: 'a3' },
    { type: 'hatch', value: '', color: 'rose', key: 'a4' },
    { type: 'line', color: 'rouge', from: 'a1', to: 'a8' },
    { type: 'dline', color: 'bleu', from: 'b1', to: 'b8' },
    { type: 'arrow', color: 'vert', from: 'c1', to: 'c8' },
    { type: 'darrow', color: 'violet', from: 'd1', to: 'd8' },
    { type: 'arrow2', color: 'orange', from: 'e1', to: 'e8' },
    { type: 'darrow2', color: 'rose', from: 'f1', to: 'f8' },
  ];
  const parsed = parseXpgn(stringifyXpgn(sample([{
    at: { path: [] }, items,
  }])));
  assert.equal(parsed.annotations[0].items.length, items.length);
  assert.deepEqual(
    new Set(parsed.annotations[0].items.map((item) => item.type)),
    new Set(items.map((item) => item.type)),
  );
});
