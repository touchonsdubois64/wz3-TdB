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

/** Validate and normalize a document without browser dependencies. */
export function validateXpgnDocument(document) {
  if (!document || typeof document !== 'object' || Array.isArray(document)) fail('document invalide.');
  if (document.format !== XPGN_FORMAT) fail('signature de format absente ou inconnue.');
  if (document.version !== XPGN_VERSION) fail('version non prise en charge : ' + document.version + '.');
  if (!document.game || typeof document.game.pgn !== 'string' || !document.game.pgn.trim()) {
    fail('le PGN embarqué est absent.');
  }
  if (!Array.isArray(document.annotations)) fail('la liste annotations doit être un tableau.');

  const ids = new Set();
  const annotations = document.annotations.map((annotation, index) => {
    const normalized = normalizeAnnotation(annotation, index);
    if (normalized.id && ids.has(normalized.id)) fail('identifiant d’annotation dupliqué : ' + normalized.id + '.');
    if (normalized.id) ids.add(normalized.id);
    return normalized;
  });

  return {
    format: XPGN_FORMAT,
    version: XPGN_VERSION,
    game: { pgn: document.game.pgn },
    annotations,
  };
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
