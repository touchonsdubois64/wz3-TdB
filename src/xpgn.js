// XPGN CORE — document v1
// A document embeds its PGN and attaches rich annotations to exact tree nodes
// using a sequence of UCI moves from the root. This distinguishes variations.
//
// V1 annotations apply to exactly one node. durationPlies is reserved in the
// schema for later timeline rendering; V1 readers do not extend it to descendants.

import { decodeMarks, encodeMarks } from './marks.js';

export const XPGN_FORMAT = 'XPGN';
export const XPGN_VERSION = 1;

const UCI_MOVE = /^(?:[a-h][1-8][a-h][1-8][qrbn]?|0000)$/;

function fail(message) {
  throw new Error('XPGN : ' + message);
}

/** Stable node identity: UCI move sequence from the root position. */
export function getXpgnNodePath(node) {
  const path = [];
  for (let current = node; current && current.parent; current = current.parent) {
    const move = current.move;
    path.unshift(move.nullMove ? '0000' : move.from + move.to + (move.promotion || ''));
  }
  return path;
}

function normalizeAnnotation(annotation, index) {
  if (!annotation || typeof annotation !== 'object' || Array.isArray(annotation)) {
    fail('annotation ' + index + ' invalide.');
  }
  const at = annotation.at;
  if (!at || !Array.isArray(at.path) || !at.path.every((move) => typeof move === 'string' && UCI_MOVE.test(move))) {
    fail('chemin de coups invalide pour l’annotation ' + index + '.');
  }
  if (!Array.isArray(annotation.items) || annotation.items.length === 0) {
    fail('l’annotation ' + index + ' doit contenir au moins un élément.');
  }

  // Existing marks encoding is reused as the canonical graphic-item validator.
  const encoded = encodeMarks(annotation.items);
  const decoded = decodeMarks(encoded);
  if (decoded.errors.length || decoded.items.length !== annotation.items.length) {
    fail('élément graphique non reconnu dans l’annotation ' + index + '.');
  }

  const scope = annotation.scope || { branch: 'node', durationPlies: 0 };
  if ((scope.branch || 'node') !== 'node') fail('portée de branche non prise en charge en version 1.');
  if (!Number.isInteger(scope.durationPlies ?? 0) || (scope.durationPlies ?? 0) < 0) {
    fail('durationPlies doit être un entier positif ou nul.');
  }

  return {
    ...(typeof annotation.id === 'string' && annotation.id ? { id: annotation.id } : {}),
    at: { path: [...at.path] },
    scope: { branch: 'node', durationPlies: scope.durationPlies ?? 0 },
    items: decoded.items,
  };
}

function requireText(value, label, max = 20000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    fail(label + ' doit être un texte non vide de ' + max + ' caractères maximum.');
  }
  return value;
}

function validatePositionRef(position, label, gameIds, hasDefaultGame) {
  if (!position || typeof position !== 'object' || Array.isArray(position)) {
    fail(label + ' doit préciser une position.');
  }
  const hasFen = typeof position.fen === 'string' && position.fen.trim() !== '';
  const hasPath = Array.isArray(position.path);
  if (hasFen === hasPath) fail(label + ' doit contenir exactement un FEN ou un chemin UCI.');
  if (hasFen) {
    requireText(position.fen, label + '.fen', 200);
    const fields = position.fen.trim().split(/\s+/);
    if (fields.length !== 6 || !/^[1-8\/PNBRQKpnbrqk]+$/.test(fields[0])) {
      fail(label + '.fen ne ressemble pas à un FEN valide.');
    }
    return { ...(position.gameId ? { gameId: requireText(position.gameId, label + '.gameId', 100) } : {}), fen: position.fen.trim() };
  }
  if (!position.path.every((move) => typeof move === 'string' && UCI_MOVE.test(move))) {
    fail(label + '.path contient un coup UCI invalide.');
  }
  if (position.gameId !== undefined) {
    const gameId = requireText(position.gameId, label + '.gameId', 100);
    if (!gameIds.has(gameId)) fail(label + ' référence un jeu inconnu : ' + gameId + '.');
    return { gameId, path: [...position.path] };
  }
  if (!hasDefaultGame) fail(label + ' doit préciser gameId pour référencer un jeu.');
  return { path: [...position.path] };
}

function normalizeCourse(course, gameIds, hasDefaultGame) {
  if (!course || typeof course !== 'object' || Array.isArray(course)) fail('course invalide.');
  const title = requireText(course.title, 'course.title', 300);
  if (!Array.isArray(course.chapters) || course.chapters.length === 0) {
    fail('un cours doit contenir au moins un chapitre.');
  }
  const chapterIds = new Set();
  const chapters = course.chapters.map((chapter, chapterIndex) => {
    const label = 'chapitre ' + chapterIndex;
    if (!chapter || typeof chapter !== 'object' || Array.isArray(chapter)) fail(label + ' invalide.');
    const id = requireText(chapter.id, label + '.id', 100);
    if (chapterIds.has(id)) fail('identifiant de chapitre dupliqué : ' + id + '.');
    chapterIds.add(id);
    const chapterTitle = requireText(chapter.title, label + '.title', 300);
    if (!Array.isArray(chapter.blocks) || chapter.blocks.length === 0) fail(label + ' doit contenir au moins un bloc.');
    const blockIds = new Set();
    const blocks = chapter.blocks.map((block, blockIndex) => {
      const blockLabel = label + ', bloc ' + blockIndex;
      if (!block || typeof block !== 'object' || Array.isArray(block)) fail(blockLabel + ' invalide.');
      const normalized = { type: block.type };
      if (block.id !== undefined) {
        normalized.id = requireText(block.id, blockLabel + '.id', 100);
        if (blockIds.has(normalized.id)) fail('identifiant de bloc dupliqué : ' + normalized.id + '.');
        blockIds.add(normalized.id);
      }
      if (block.type === 'heading') {
        normalized.text = requireText(block.text, blockLabel + '.text', 1000);
        normalized.level = block.level === undefined ? 2 : block.level;
        if (![2, 3, 4].includes(normalized.level)) fail(blockLabel + '.level doit valoir 2, 3 ou 4.');
      } else if (block.type === 'text') {
        normalized.text = requireText(block.text, blockLabel + '.text', 20000);
      } else if (block.type === 'diagram') {
        normalized.position = validatePositionRef(block.position, blockLabel + '.position', gameIds, hasDefaultGame);
        if (block.caption !== undefined) normalized.caption = requireText(block.caption, blockLabel + '.caption', 1000);
      } else if (block.type === 'exercise') {
        normalized.prompt = requireText(block.prompt, blockLabel + '.prompt', 5000);
        normalized.position = validatePositionRef(block.position, blockLabel + '.position');
        if (!Array.isArray(block.expectedMoves) || block.expectedMoves.length === 0 ||
            !block.expectedMoves.every((move) => typeof move === 'string' && UCI_MOVE.test(move))) {
          fail(blockLabel + '.expectedMoves doit être une liste non vide de coups UCI.');
        }
        normalized.expectedMoves = [...block.expectedMoves];
        if (block.explanation !== undefined) normalized.explanation = requireText(block.explanation, blockLabel + '.explanation', 5000);
      } else {
        fail(blockLabel + ' : type non pris en charge (' + String(block.type) + ').');
      }
      return normalized;
    });
    return { id, title: chapterTitle, blocks };
  });
  const result = { title, chapters };
  if (course.description !== undefined) result.description = requireText(course.description, 'course.description', 5000);
  if (course.author !== undefined) result.author = requireText(course.author, 'course.author', 300);
  if (course.language !== undefined) result.language = requireText(course.language, 'course.language', 35);
  return result;
}

/** Validate and normalize a document without browser dependencies. */
export function validateXpgnDocument(document) {
  if (!document || typeof document !== 'object' || Array.isArray(document)) fail('document invalide.');
  if (document.format !== XPGN_FORMAT) fail('signature de format absente ou inconnue.');
  if (document.version !== XPGN_VERSION) fail('version non prise en charge : ' + document.version + '.');
  const hasDefaultGame = document.game !== undefined;
  if (hasDefaultGame && (typeof document.game.pgn !== 'string' || !document.game.pgn.trim())) {
    fail('game.pgn doit être un PGN non vide.');
  }
  const gameIds = new Set();
  const games = (document.games || []).map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) fail('jeu ' + index + ' invalide.');
    const id = requireText(entry.id, 'jeu ' + index + '.id', 100);
    if (gameIds.has(id)) fail('identifiant de jeu dupliqué : ' + id + '.');
    gameIds.add(id);
    const pgn = requireText(entry.pgn, 'jeu ' + index + '.pgn', 1000000);
    return { id, pgn };
  });
  if (document.games !== undefined && !Array.isArray(document.games)) fail('games doit être un tableau.');
  if (!hasDefaultGame && games.length === 0 && document.course === undefined) {
    fail('le document doit contenir une partie, une bibliothèque de jeux ou un cours.');
  }
  if (!Array.isArray(document.annotations)) fail('la liste annotations doit être un tableau.');

  const ids = new Set();
  const annotations = document.annotations.map((annotation, index) => {
    const normalized = normalizeAnnotation(annotation, index);
    if (normalized.id && ids.has(normalized.id)) fail('identifiant d’annotation dupliqué : ' + normalized.id + '.');
    if (normalized.id) ids.add(normalized.id);
    return normalized;
  });

  const normalized = { format: XPGN_FORMAT, version: XPGN_VERSION, annotations };
  if (hasDefaultGame) normalized.game = { pgn: document.game.pgn };
  if (games.length) normalized.games = games;
  if (document.course !== undefined) normalized.course = normalizeCourse(document.course, gameIds, hasDefaultGame);
  return normalized;
}

/** Serialize a validated XPGN document as readable UTF-8 JSON. */
export function stringifyXpgn(document) {
  return JSON.stringify(validateXpgnDocument(document), null, 2) + '\n';
}

/** Parse and validate the JSON text of a .xpgn file. */
export function parseXpgn(source) {
  let document;
  try {
    document = JSON.parse(String(source));
  } catch {
    fail('JSON illisible.');
  }
  return validateXpgnDocument(document);
}

/**
 * Attach annotations to an already parsed PGN tree.
 * Missing paths are returned in unresolved rather than silently discarded.
 */
export function attachXpgnAnnotations(root, annotations) {
  const byPath = new Map();
  const visit = (node) => {
    byPath.set(JSON.stringify(getXpgnNodePath(node)), node);
    for (const child of node.children || []) visit(child);
  };
  if (root) visit(root);

  const unresolved = [];
  for (const annotation of annotations || []) {
    const node = byPath.get(JSON.stringify(annotation.at.path));
    if (!node) {
      unresolved.push(annotation);
      continue;
    }
    if (!node.xpgnAnnotations) node.xpgnAnnotations = [];
    node.xpgnAnnotations.push(...annotation.items);
  }
  return { attached: (annotations || []).length - unresolved.length, unresolved };
}
