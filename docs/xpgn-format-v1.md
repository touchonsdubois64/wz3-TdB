# XPGN — spécification de travail, version 1

Statut : première base technique expérimentale. Cette spécification est volontairement limitée ; elle ne prétend pas encore définir toutes les annotations graphiques futures.

## 1. Fichier et encodage

- Extension : `.xpgn`.
- Encodage : UTF-8.
- Contenu : document JSON.
- Signature obligatoire : `"format": "XPGN"`.
- Version obligatoire : `"version": 1`.

## 2. Structure du document

Un document XPGN peut contenir :
- `game` : une partie principale PGN (facultative si le document est un cours autonome).
- `games` : une bibliothèque de parties PGN intégrées, chacune avec un identifiant stable.
- `annotations` : annotations graphiques rattachées à des positions de la partie principale.
- `course` : contenu pédagogique structuré en chapitres et blocs.

Les anciennes structures avec `game` et `annotations` restent valides. Un cours autonome peut omettre `game` et utiliser des diagrammes fondés sur un FEN.

Un chapitre peut contenir plusieurs blocs `diagram` et `exercise` successifs. Studio permet d'ajouter plusieurs positions au même chapitre, dans leur ordre pédagogique.

Exemple de document de cours autonome :

```json
{
  "format": "XPGN",
  "version": 1,
  "annotations": [],
  "course": {
    "title": "Comprendre le centre",
    "description": "Les principes de base du jeu central.",
    "language": "fr",
    "chapters": [
      {
        "id": "chapitre-1",
        "title": "Occupation du centre",
        "blocks": [
          { "id": "intro", "type": "heading", "text": "Les cases centrales", "level": 2 },
          { "id": "explication", "type": "text", "text": "Le contrôle du centre facilite le développement." },
          {
            "id": "diagramme-1",
            "type": "diagram",
            "position": { "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" },
            "caption": "Position de départ"
          },
          {
            "id": "exercice-1",
            "type": "exercise",
            "prompt": "Jouez le coup qui occupe le centre avec le pion roi.",
            "position": { "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" },
            "expectedMoves": ["e2e4"],
            "explanation": "Le pion contrôle les cases d5 et f5."
          }
        ]
      }
    ]
  }
}

```

Un bloc `diagram` ou `exercise` référence une position par `fen` ou par `path` UCI. Un `gameId` peut préciser la partie de la bibliothèque à utiliser. Les blocs pris en charge dans cette première extension sont `heading`, `text`, `diagram` et `exercise`.

## 3. Partie d'échecs

`game.pgn` contient une partie PGN complète, en-têtes, commentaires et variantes compris. Le parseur PGN existant reste responsable des règles et de la construction de l'arbre de coups. Les commentaires textuels, les variantes et les NAG (`$n`) sont conservés par l'import/export de l'éditeur. Les directives reconnues de type `[%eval]` et `[%clk]` sont également conservées comme directives textuelles. Les commandes graphiques `[%cal]` et `[%csl]` sont converties en annotations d'échiquier et réémises lors de l'export PGN. Cette conservation ne garantit pas encore une préservation octet pour octet de tout PGN arbitraire.

## 4. Identité des positions

Une position annotée est identifiée par `at.path`, suite ordonnée de coups UCI depuis la racine de la partie. Exemples :

- `[]` : position initiale (ou position de départ FEN).
- `["e2e4"]` : après 1.e4.
- `["e2e4", "c7c5"]` : après 1.e4 c5, dans la variante sicilienne.

Un coup nul (passe) est un nœud de la partie, sans déplacement de pièce, qui transfère le trait à l'autre camp. Dans le chemin UCI XPGN, il est codé `0000`. Le PGN intégré l'écrit `--` ; le lecteur doit le lire, afficher la même position avec le trait inversé et permettre la navigation vers les nœuds suivants. Plusieurs coups nuls successifs sont permis dans une séquence pédagogique. Ils ne sont pas des coups légaux d'une partie ordinaire : le lecteur les restitue comme éléments d'analyse, sans proposer une commande pour les créer.

Les promotions utilisent le suffixe UCI `q`, `r`, `b` ou `n`. Le coup nul est représenté par `0000`. Un chemin identifie une branche précise et ne dépend ni du numéro de coup seul ni du FEN, qui peut se répéter.

## 5. Annotations

Chaque entrée comporte :

- `at.path` : chemin exact de la position.
- `items` : tableau non vide d'objets graphiques.
- `id` : identifiant facultatif, unique dans le document.
- `scope` : options de temporalité.

La version 1 réutilise les types et couleurs du système d'annotations actuel de XPGN Studio (formes, textes, figurines, zones, traits et flèches). Le validateur de cette première implémentation vérifie les objets en les faisant passer par l'encodeur/décodeur existant.

### Annotations graphiques persistantes dans une ligne

L'éditeur conserve pour chaque nœud de la partie un instantané des annotations visibles à cette position. Lorsqu'une annotation est ajoutée, modifiée ou retirée, la différence est propagée aux nœuds descendants déjà présents, dans chaque variante ; les annotations propres à ces variantes sont conservées. Les coups créés ensuite héritent de l'instantané de leur position parente. Retirer un élément à une position le retire donc à cette position et aux suivantes, sans modifier les positions précédentes. Le lecteur n'a pas d'outil d'édition pour cette fonction : il affiche l'instantané enregistré sur chaque nœud et permet de naviguer dans la partie.

Pour rester compatible avec XPGN v1, cette persistance est sérialisée sous forme d'annotations exactes répétées sur les chemins des nœuds concernés. Le champ scope reste branch: node ; aucun comportement descendant implicite ni nouveau champ de portée n'est nécessaire à la lecture des anciens documents.

### Temporalité

En v1, `branch` vaut obligatoirement `"node"` et l'annotation ne s'affiche que sur la position désignée. `durationPlies` est un entier positif ou nul réservé à l'évolution du lecteur ; la valeur non nulle est conservée dans le document mais n'étend pas encore l'affichage. Il ne faut donc pas interpréter cette propriété comme une fonctionnalité déjà implémentée.

### Symboles d'évaluation PGN (NAG)

Les annotations de coups utilisent les codes NAG numériques du PGN. Le catalogue de Studio comprend les appréciations de coups ($1 à $9), les évaluations de position ($10 à $23) et des indications descriptives sélectionnées : espace et développement ($24 à $35), initiative et attaque ($36 à $41), compensation matérielle ($42 à $47). Les codes sont stockés tels quels dans le PGN ; leur rendu graphique est une aide de lecture et ne remplace pas le code. Les NAG $22 et $23 distinguent le zugzwang des Blancs et des Noirs ; $8 désigne le coup singulier, seul coup raisonnable ; $44 et $45 indiquent une compensation matérielle suffisante.

Références de la table NAG : [spécification PGN commentée](https://github.com/mliebelt/pgn-spec-commented/blob/main/pgn-specification.md) et [table de symboles d'évaluation RPB Chessboard](https://rpb-chessboard.yo35.org/documentation/chess-assessment-symbols/).

## 6. Robustesse et compatibilité

- Une version inconnue doit être refusée explicitement.
- Une annotation mal formée doit produire une erreur explicite.
- Un chemin valide syntaxiquement mais absent de l'arbre PGN est signalé comme non résolu ; il ne doit pas être supprimé silencieusement.
- L'export PGN classique reste un export de compatibilité : les annotations non représentables en PGN standard peuvent être perdues et doivent faire l'objet d'un avertissement dans une future interface.

## 7. Évolutions réservées

Les futures versions pourront définir les couches, les portées de branches (ligne principale, branche courante, descendants), la durée effective, les phases avant/après le coup, les médias, les ressources externes et les interactions pédagogiques avancées. Ces éléments ne sont pas implicitement activés par la version 1.
