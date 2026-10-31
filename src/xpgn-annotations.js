// Propagation des annotations graphiques le long de l'arbre de coups.
// Chaque nœud conserve un instantané : retirer un élément à un nœud ne modifie
// ni ses ancêtres, tandis que les descendants existants reçoivent le changement.
const cloneItems = (items) => (items || []).map((item) => ({ ...item }));
const itemKey = (item) => JSON.stringify(item);

function applyChange(items, removed, added) {
  const removedKeys = new Set(removed.map(itemKey));
  const next = cloneItems(items).filter((item) => !removedKeys.has(itemKey(item)));
  const present = new Set(next.map(itemKey));
  for (const item of added) {
    const key = itemKey(item);
    if (!present.has(key)) {
      next.push({ ...item });
      present.add(key);
    }
  }
  return next;
}

/** Remplace les annotations d'un nœud et propage uniquement la différence à ses descendants. */
export function updateXpgnAnnotationBranch(node, items) {
  if (!node) return;
  const before = cloneItems(node.xpgnAnnotations);
  const after = cloneItems(items);
  const beforeKeys = new Set(before.map(itemKey));
  const afterKeys = new Set(after.map(itemKey));
  const removed = before.filter((item) => !afterKeys.has(itemKey(item)));
  const added = after.filter((item) => !beforeKeys.has(itemKey(item)));
  node.xpgnAnnotations = after;

  const visit = (parent, oldParentItems, newParentItems) => {
    for (const child of parent.children || []) {
      // Un nœud sans instantané hérite de l'état de son parent avant modification.
      const childBefore = Array.isArray(child.xpgnAnnotations)
        ? cloneItems(child.xpgnAnnotations)
        : cloneItems(oldParentItems);
      const childAfter = applyChange(childBefore, removed, added);
      child.xpgnAnnotations = childAfter;
      visit(child, childBefore, childAfter);
    }
  };
  visit(node, before, after);
}

/** Un nouveau coup commence avec les annotations actives sur sa position parente. */
export function inheritXpgnAnnotations(parent, child) {
  if (!parent || !child || Array.isArray(child.xpgnAnnotations)) return;
  child.xpgnAnnotations = cloneItems(parent.xpgnAnnotations);
}
