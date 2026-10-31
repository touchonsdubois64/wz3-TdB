import test from 'node:test';
import assert from 'node:assert/strict';
import { inheritXpgnAnnotations, updateXpgnAnnotationBranch } from '../src/xpgn-annotations.js';

const red = { type: 'shape', value: 'circle', color: 'rouge', key: 'e4' };
const blue = { type: 'arrow', color: 'bleu', from: 'e2', to: 'e4' };
const green = { type: 'shape', value: 'square', color: 'vert', key: 'd5' };
const node = (items) => ({ xpgnAnnotations: items, children: [] });

test('une annotation suit les coups déjà présents sur toutes les branches', () => {
  const root = node([]);
  const first = node([]);
  const second = node([]);
  const variation = node([]);
  root.children.push(first);
  first.children.push(second, variation);
  updateXpgnAnnotationBranch(first, [red]);
  for (const current of [first, second, variation]) assert.deepEqual(current.xpgnAnnotations, [red]);
  assert.deepEqual(root.xpgnAnnotations, []);
});

test('retirer une annotation à une position ne modifie pas les positions précédentes', () => {
  const first = node([red]);
  const second = node([red]);
  const third = node([red]);
  first.children.push(second);
  second.children.push(third);
  updateXpgnAnnotationBranch(second, []);
  assert.deepEqual(first.xpgnAnnotations, [red]);
  assert.deepEqual(second.xpgnAnnotations, []);
  assert.deepEqual(third.xpgnAnnotations, []);
});

test('les annotations propres à une branche sont conservées pendant la propagation', () => {
  const first = node([red]);
  const main = node([red, blue]);
  const variation = node([red, green]);
  first.children.push(main, variation);
  updateXpgnAnnotationBranch(first, [red, blue]);
  assert.deepEqual(main.xpgnAnnotations, [red, blue]);
  assert.deepEqual(variation.xpgnAnnotations, [red, green, blue]);
});

test('un nouveau coup hérite des annotations actives', () => {
  const parent = node([red, blue]);
  const child = { children: [] };
  inheritXpgnAnnotations(parent, child);
  assert.deepEqual(child.xpgnAnnotations, [red, blue]);
  child.xpgnAnnotations[0].color = 'vert';
  assert.equal(parent.xpgnAnnotations[0].color, 'rouge');
});
