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

Cette version constitue un socle de travail : Studio sait ouvrir et exporter
les documents XPGN contenant une partie, ses annotations et un cours. Les
annotations graphiques sont conservées sous forme d'instantanés sur les nœuds :
dans Studio, une modification est propagée aux positions suivantes des variantes
déjà présentes ; le lecteur restitue les instantanés et ne propose pas d'édition.
La version 1 du format conserve des annotations explicites par position, sans
introduire de portée implicite dans le fichier.


### Création de cours

Le bouton **Nouveau cours** ouvre l'éditeur initial : titre, description,
premier chapitre, texte explicatif et insertion facultative de la position courante.
Dans le menu Création, Studio permet ensuite d'ajouter des textes, des exercices
(choix d'un coup disponible dans la position sélectionnée), des chapitres et des
diagrammes à plusieurs endroits d'un même chapitre. Les positions issues de la
partie principale sont référencées par leur chemin UCI, ce qui permet au lecteur
de les retrouver et de les afficher sur l'échiquier. Le lecteur affiche les
consignes et les solutions d'exercices ; il ne permet pas encore de jouer les
réponses sur un échiquier d'exercice.

Un exemple de cours autonome est disponible dans
`examples/cours-comprendre-le-centre.xpgn`.

### Échange de fichiers XPGN

L'interface propose les commandes **Ouvrir XPGN** et **XPGN** (enregistrement).
Sur les navigateurs compatibles, l'enregistrement ouvre un sélecteur permettant
de choisir le dossier du projet ; les autres navigateurs lancent un téléchargement
classique. Le nom proposé reprend le titre du cours. À l'ouverture, le PGN embarqué
reconstruit l'arbre de coups et les annotations sont rattachées aux positions
correspondantes. Le lecteur de cours accepte aussi les coups nuls successifs
(`--` dans le PGN, `0000` dans les chemins UCI) et permet de les parcourir.



Les commandes **Commentaire** et **Symbole** permettent d'ajouter un commentaire textuel au nœud sélectionné et les symboles échiquéens standards (`!`, `?`, `!!`, `??`, `!?`, `?!`, `=`, `+=`, `=+`, `+−`, `−+`, `±`, `∓`). Ils sont exportés en PGN sous forme de commentaires et de NAG (`$n`). L'import/export PGN conserve également les variantes et les directives non graphiques reconnues comme `[%eval]` et `[%clk]`. La compatibilité reste sémantique, pas octet pour octet, pour les PGN arbitraires.

Cette intégration reste expérimentale. La suite de tests et la compilation
sont exécutées par l'intégration continue GitHub Actions ; cela ne remplace pas
encore une validation manuelle de l'interface dans plusieurs navigateurs.
