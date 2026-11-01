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


const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const courseOnly = () => ({
  format: 'XPGN',
  version: 1,
  course: {
    title: 'Comprendre le centre',
    description: 'Un premier cours autonome.',
    language: 'fr',
    chapters: [{
      id: 'chapitre-1',
      title: 'Occupation du centre',
      blocks: [
        { id: 'intro', type: 'heading', text: 'Les cases centrales', level: 2 },
        { id: 'texte', type: 'text', text: 'Le contrôle du centre facilite le développement.' },
        { id: 'diagramme', type: 'diagram', position: { fen: startFen }, caption: 'Position de départ' },
        { id: 'exercice', type: 'exercise', prompt: 'Jouez le coup e4.', position: { fen: startFen }, expectedMoves: ['e2e4'], explanation: 'Le pion occupe le centre.' },
      ],
    }],
  },
});

test('la mise en forme des blocs texte est conservée et normalisée', () => {
  const doc = courseOnly();
  doc.course.chapters[0].blocks[1].style = {
    align: 'justify', columns: 2, bold: true, italic: true,
    underline: false, color: '#AABBCC',
  };
  const parsed = parseXpgn(stringifyXpgn(doc));
  assert.deepEqual(parsed.course.chapters[0].blocks[1].style, {
    align: 'justify', columns: 2, bold: true, italic: true, color: '#aabbcc',
  });
});

test('les polices et tailles de texte autorisées sont conservées', () => {
  const doc = courseOnly();
  doc.course.chapters[0].blocks[1].style = { fontFamily: 'serif', fontSize: 24 };
  const parsed = parseXpgn(stringifyXpgn(doc));
  assert.deepEqual(parsed.course.chapters[0].blocks[1].style, { fontFamily: 'serif', fontSize: 24 });
});

test('le validateur refuse les tailles et polices de texte non autorisées', () => {
  for (const style of [
    { fontSize: 9 }, { fontSize: 49 }, { fontSize: 14.5 },
    { fontFamily: 'Comic Sans' },
  ]) {
    const doc = courseOnly();
    doc.course.chapters[0].blocks[1].style = style;
    assert.throws(() => validateXpgnDocument(doc));
  }
});

test('le validateur refuse les styles de texte non autorisés', () => {
  for (const style of [
    { align: 'middle' }, { columns: 3 }, { bold: 'yes' },
    { color: 'red' }, { color: '#fff' }, [],
  ]) {
    const doc = courseOnly();
    doc.course.chapters[0].blocks[1].style = style;
    assert.throws(() => validateXpgnDocument(doc));
  }
});

test('un cours XPGN autonome peut contenir texte, diagrammes et exercices', () => {
  const parsed = parseXpgn(stringifyXpgn(courseOnly()));
  assert.equal(parsed.game, undefined);
  assert.equal(parsed.course.title, 'Comprendre le centre');
  assert.equal(parsed.course.chapters[0].blocks.length, 4);
  assert.equal(parsed.course.chapters[0].blocks[2].position.fen, startFen);
  assert.deepEqual(parsed.course.chapters[0].blocks[3].expectedMoves, ['e2e4']);
});

test('un cours peut référencer plusieurs parties PGN intégrées', () => {
  const doc = courseOnly();
  doc.games = [{ id: 'partie-italienne', pgn: '1. e4 e5 2. Nf3 Nc6 *' }];
  doc.course.chapters[0].blocks[2].position = { gameId: 'partie-italienne', path: ['e2e4', 'e7e5'] };
  const parsed = parseXpgn(stringifyXpgn(doc));
  assert.equal(parsed.games[0].id, 'partie-italienne');
  assert.deepEqual(parsed.course.chapters[0].blocks[2].position.path, ['e2e4', 'e7e5']);
});

test('le validateur refuse les références de jeu et les identifiants de bloc inconnus ou dupliqués', () => {
  const doc = courseOnly();
  doc.course.chapters[0].blocks[0].id = 'duplicate';
  doc.course.chapters[0].blocks[1].id = 'duplicate';
  assert.throws(() => validateXpgnDocument(doc), /dupliqué/);
  const badRef = courseOnly();
  badRef.course.chapters[0].blocks[2].position = { gameId: 'absent', path: [] };
  assert.throws(() => validateXpgnDocument(badRef), /jeu inconnu/);
  const badMoves = courseOnly();
  badMoves.course.chapters[0].blocks[3].expectedMoves = ['e2-e4'];
  assert.throws(() => validateXpgnDocument(badMoves), /liste de 1 à 1000 coups UCI valides/);
});


test('un chemin XPGN peut traverser plusieurs coups nuls', () => {
  const pgn = '[SetUp "1"]\n[FEN "8/8/8/4k3/8/8/8/K2Q4 w - - 0 1"]\n\n1. -- -- *';
  const parsed = parsePgn(pgn, Chess);
  assert.equal(parsed.error, null);
  const secondPass = parsed.root.children[0].children[0];
  assert.deepEqual(getXpgnNodePath(secondPass), ['0000', '0000']);
  const document = sample([{ at: { path: ['0000', '0000'] }, items: [{ type: 'shape', value: 'circle', color: 'rouge', key: 'e4' }] }]);
  document.game.pgn = pgn;
  const normalized = parseXpgn(stringifyXpgn(document));
  const attached = attachXpgnAnnotations(parsed.root, normalized.annotations);
  assert.equal(attached.attached, 1);
  assert.equal(attached.unresolved.length, 0);
  assert.equal(secondPass.xpgnAnnotations[0].key, 'e4');
});


test('un même chapitre conserve plusieurs positions pédagogiques dans leur ordre', () => {
  const doc = courseOnly();
  const blocks = doc.course.chapters[0].blocks;
  blocks.push(
    { id: 'diagramme-2', type: 'diagram', position: { fen: '8/8/8/8/8/8/4k3/4K3 w - - 0 1' }, caption: 'Opposition' },
    { id: 'diagramme-3', type: 'diagram', position: { fen: startFen }, caption: 'Retour à la position initiale' },
  );
  const parsed = parseXpgn(stringifyXpgn(doc));
  assert.equal(parsed.course.chapters[0].blocks.length, 6);
  assert.deepEqual(parsed.course.chapters[0].blocks.slice(-2).map(block => block.caption), ['Opposition', 'Retour à la position initiale']);
});


test('le validateur borne la taille structurelle des cours', () => {
  const tooManyChapters = courseOnly();
  tooManyChapters.course.chapters = Array.from({ length: 201 }, (_, index) => ({
    id: 'chapter-' + index, title: 'Chapitre ' + index,
    blocks: [{ type: 'text', text: 'Contenu' }],
  }));
  assert.throws(() => validateXpgnDocument(tooManyChapters), /200 chapitres/);

  const tooManyBlocks = courseOnly();
  tooManyBlocks.course.chapters = [{
    id: 'chapter-large', title: 'Grand chapitre',
    blocks: Array.from({ length: 5001 }, () => ({ type: 'text', text: 'Contenu' })),
  }];
  assert.throws(() => validateXpgnDocument(tooManyBlocks), /5000 blocs/);
});


test('le validateur borne les bibliothèques de parties XPGN', () => {
  const tooManyGames = {
    format: 'XPGN', version: 1,
    games: Array.from({ length: 501 }, (_, index) => ({ id: 'game-' + index, pgn: '1. e4' })),
  };
  assert.throws(() => validateXpgnDocument(tooManyGames), /500 parties/);

  const tooMuchPgn = {
    format: 'XPGN', version: 1,
    games: [
      { id: 'game-a', pgn: 'x'.repeat(1000000) },
      { id: 'game-b', pgn: 'x'.repeat(1000000) },
      { id: 'game-c', pgn: 'x'.repeat(1000000) },
      { id: 'game-d', pgn: 'x'.repeat(1000000) },
      { id: 'game-e', pgn: 'x'.repeat(1000000) },
      { id: 'game-f', pgn: 'x'.repeat(1000000) },
      { id: 'game-g', pgn: 'x'.repeat(1000000) },
      { id: 'game-h', pgn: 'x'.repeat(1000000) },
      { id: 'game-i', pgn: 'x'.repeat(1000000) },
      { id: 'game-j', pgn: 'x'.repeat(1000000) },
      { id: 'game-k', pgn: 'x'.repeat(1000000) },
      { id: 'game-l', pgn: 'x'.repeat(1000000) },
      { id: 'game-m', pgn: 'x'.repeat(1000000) },
      { id: 'game-n', pgn: 'x'.repeat(1000000) },
      { id: 'game-o', pgn: 'x'.repeat(1000000) },
      { id: 'game-p', pgn: 'x'.repeat(1000000) },
      { id: 'game-q', pgn: 'x'.repeat(1000000) },
      { id: 'game-r', pgn: 'x'.repeat(1000000) },
      { id: 'game-s', pgn: 'x'.repeat(1000000) },
      { id: 'game-t', pgn: 'x'.repeat(1000000) },
      { id: 'game-u', pgn: 'x'.repeat(1000000) },
    ],
  };
  assert.throws(() => validateXpgnDocument(tooMuchPgn), /20 Mo/);
});


test('le validateur borne le nombre et la taille des annotations XPGN', () => {
  const tooMany = {
    format: 'XPGN', version: 1,
    game: { pgn: '1. e4 *' },
    annotations: Array.from({ length: 5001 }, (_, index) => ({
      id: 'annotation-' + index,
      at: { path: [] }, items: [{ type: 'shape', value: 'circle', color: 'rouge', key: 'e4' }],
    })),
  };
  assert.throws(() => validateXpgnDocument(tooMany), /5000 annotations/);

  const tooManyItems = {
    format: 'XPGN', version: 1,
    game: { pgn: '1. e4 *' },
    annotations: [{
      at: { path: [] },
      items: Array.from({ length: 101 }, () => ({ type: 'circle', orig: 'e4', brush: 'green' })),
    }],
  };
  assert.throws(() => validateXpgnDocument(tooManyItems), /100 éléments graphiques/);
});


test('le validateur contrôle la structure des six champs FEN', () => {
  for (const fen of [
    '8/8/8/8/8/8/8/7 w - - 0 1',
    '8/8/8/8/8/8/8/8 x - - 0 1',
    '8/8/8/8/8/8/8/8 w KK - 0 1',
    '8/8/8/8/8/8/8/8 w - e4 0 1',
    '8/8/8/8/8/8/8/8 w - - -1 1',
    '8/8/8/8/8/8/8/8 w - - 0 0',
  ]) {
    const doc = courseOnly();
    doc.course.chapters[0].blocks[2].position = { fen };
    assert.throws(() => validateXpgnDocument(doc), /structure FEN/);
  }
});


test('le validateur borne aussi la partie PGN principale', () => {
  const oversized = { format: 'XPGN', version: 1, game: { pgn: 'x'.repeat(1000001) } };
  assert.throws(() => validateXpgnDocument(oversized), /game.pgn/);

  const tooManyIncludingDefault = {
    format: 'XPGN', version: 1, game: { pgn: '1. e4 *' },
    games: Array.from({ length: 500 }, (_, index) => ({ id: 'game-' + index, pgn: '1. d4 *' })),
  };
  assert.throws(() => validateXpgnDocument(tooManyIncludingDefault), /500 parties/);
});

test('le validateur borne les coups attendus des exercices', () => {
  const doc = courseOnly();
  doc.course.chapters[0].blocks[3].expectedMoves = Array.from({ length: 1001 }, () => 'e2e4');
  assert.throws(() => validateXpgnDocument(doc), /1 à 1000 coups UCI/);
});


test('le validateur borne la taille textuelle cumulée des cours', () => {
  const doc = courseOnly();
  doc.course.chapters = [{
    id: 'chapter-text', title: 'Textes',
    blocks: Array.from({ length: 251 }, (_, index) => ({
      id: 'text-' + index, type: 'text', text: 'x'.repeat(20000),
    })),
  }];
  assert.throws(() => validateXpgnDocument(doc), /contenu textuel.*5 Mo/);
});


test('le validateur borne la durée des annotations XPGN', () => {
  const doc = {
    format: 'XPGN', version: 1, game: { pgn: '1. e4 *' },
    annotations: [{
      at: { path: [] },
      scope: { branch: 'node', durationPlies: 1001 },
      items: [{ type: 'shape', value: 'circle', color: 'rouge', key: 'e4' }],
    }],
  };
  assert.throws(() => validateXpgnDocument(doc), /durationPlies.*0 et 1000/);
});


test('le validateur rejette les rangées FEN et prises en passant incohérentes', () => {
  for (const fen of [
    '44/8/8/8/8/8/8/8 w - - 0 1',
    '8/8/8/8/8/8/8/8 w - e3 0 1',
    '8/8/8/8/8/8/8/8 b - e6 0 1',
  ]) {
    const doc = courseOnly();
    doc.course.chapters[0].blocks[2].position = { fen };
    assert.throws(() => validateXpgnDocument(doc), /structure FEN/);
  }
});
