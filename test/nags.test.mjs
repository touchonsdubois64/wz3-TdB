import test from 'node:test';
import assert from 'node:assert/strict';
import { MOVE_NAGS, nagGlyph } from '../src/nags.js';

test('catalogue NAG : coup forcé, seul coup, zugzwang et compensation', () => {
  const labels = new Map(MOVE_NAGS.map(({nag,label}) => [nag,label]));
  assert.match(labels.get(7), /forcé/i);
  assert.match(labels.get(8), /Seul coup/i);
  assert.match(labels.get(22), /Blancs en zugzwang/i);
  assert.match(labels.get(23), /Noirs en zugzwang/i);
  assert.match(labels.get(44), /Compensation blanche suffisante/i);
  assert.match(labels.get(45), /Compensation noire suffisante/i);
  assert.equal(nagGlyph(22), '⨀');
  assert.equal(nagGlyph(23), '⨀');
  assert.equal(nagGlyph(44), '⯹');
  assert.equal(nagGlyph(255), null);
});

test('les codes de jugement positionnel suivent la numérotation PGN', () => {
  assert.equal(nagGlyph(14), '⩲');
  assert.equal(nagGlyph(15), '⩱');
  assert.equal(nagGlyph(16), '±');
  assert.equal(nagGlyph(17), '∓');
  assert.equal(nagGlyph(18), '+−');
  assert.equal(nagGlyph(19), '−+');
});
