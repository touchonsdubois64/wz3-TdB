# XPGN Studio

Application d’analyse et d’entraînement aux échecs, première base de travail du projet XPGN Studio.

    npm install
    npm run dev      # développement
    npm run build    # site statique dans docs/ (comme cc2), à publier avec GitHub Pages
    npm test         # tests unitaires FEN, PGN, annotations et XPGN

Fichiers : `src/app.js` (interface), `src/fen.js` (FEN, translation, validation),
`src/tablebase.js` (tables Lichess), `src/engine.js` (Stockfish), `src/style.css`.

## Bibliothèque de positions

Le menu « dossier » (au-dessus du champ FEN) est alimenté par `src/positions.js` :
les explications et un exemple se trouvent en tête de ce fichier.

## Publication (GitHub Pages)

`positions.js` est compilé *dans* le site : une modification n'apparaît en ligne
qu'après `npm run build`, puis commit + push de **tout** le dossier `docs`
(y compris les nouveaux fichiers de `docs/assets`). `npm run dev` lit au contraire
le fichier source directement, d'où la différence entre la version locale et la version en ligne.


## Format XPGN (première version expérimentale)

Le noyau de document se trouve dans `src/xpgn.js`. Il valide et sérialise les
documents JSON XPGN, et rattache les annotations à un nœud précis de l'arbre PGN
au moyen d'un chemin de coups UCI. La note de conception et le schéma de cette
première version sont dans `docs/xpgn-format-v1.md`.

Cette version constitue un socle de travail : l'éditeur et le lecteur n'ouvrent
pas encore directement les fichiers `.xpgn`, et la temporalité des annotations
au-delà d'une position n'est pas encore implémentée.


### Échange de fichiers XPGN

L'interface propose maintenant les commandes **Ouvrir XPGN** et **XPGN** (export).
À l'ouverture, le PGN embarqué reconstruit l'arbre de coups et les annotations sont
rattachées aux positions correspondantes. En naviguant dans les coups et les
variantes, l'éditeur recharge les annotations du nœud courant. L'export rassemble
la partie et les annotations de tous les nœuds dans un document `.xpgn`.

Cette intégration est encore expérimentale : les annotations XPGN sont attachées
à une position précise (pas encore de durée ou de propagation automatique), et
une validation dans un navigateur ainsi que l'exécution complète des tests restent
nécessaires avant de considérer cette version comme stable.
