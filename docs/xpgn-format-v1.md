# XPGN — spécification de travail, version 1

Statut : première base technique expérimentale. Cette spécification est volontairement limitée ; elle ne prétend pas encore définir toutes les annotations graphiques futures.

## 1. Fichier et encodage

- Extension : `.xpgn`.
- Encodage : UTF-8.
- Contenu : document JSON.
- Signature obligatoire : `"format": "XPGN"`.
- Version obligatoire : `"version": 1`.

## 2. Structure minimale

```json
{
  "format": "XPGN",
  "version": 1,
  "game": {
    "pgn": "[Event \"Exemple\"]\n\n1. e4 e5 *"
  },
  "annotations": [
    {
      "id": "idee-principale",
      "at": { "path": ["e2e4", "e7e5"] },
      "scope": { "branch": "node", "durationPlies": 0 },
      "items": [
        { "type": "shape", "value": "circle", "color": "rouge", "key": "f7" }
      ]
    }
  ]
}
```

## 3. Partie d'échecs

`game.pgn` contient une partie PGN complète, en-têtes, commentaires et variantes compris. Le parseur PGN existant reste responsable des règles et de la construction de l'arbre de coups. Les commentaires textuels, les variantes et les NAG (`$n`) sont conservés par l'import/export de l'éditeur. Les directives reconnues de type `[%eval]` et `[%clk]` sont également conservées comme directives textuelles. Les commandes graphiques `[%cal]` et `[%csl]` sont converties en annotations d'échiquier et réémises lors de l'export PGN. Cette conservation ne garantit pas encore une préservation octet pour octet de tout PGN arbitraire.

## 4. Identité des positions

Une position annotée est identifiée par `at.path`, suite ordonnée de coups UCI depuis la racine de la partie. Exemples :

- `[]` : position initiale (ou position de départ FEN).
- `["e2e4"]` : après 1.e4.
- `["e2e4", "c7c5"]` : après 1.e4 c5, dans la variante sicilienne.

Les promotions utilisent le suffixe UCI `q`, `r`, `b` ou `n`. Le coup nul est représenté par `0000`. Un chemin identifie une branche précise et ne dépend ni du numéro de coup seul ni du FEN, qui peut se répéter.

## 5. Annotations

Chaque entrée comporte :

- `at.path` : chemin exact de la position.
- `items` : tableau non vide d'objets graphiques.
- `id` : identifiant facultatif, unique dans le document.
- `scope` : options de temporalité.

La version 1 réutilise les types et couleurs du système d'annotations actuel de XPGN Studio (formes, textes, figurines, zones, traits et flèches). Le validateur de cette première implémentation vérifie les objets en les faisant passer par l'encodeur/décodeur existant.

### Temporalité

En v1, `branch` vaut obligatoirement `"node"` et l'annotation ne s'affiche que sur la position désignée. `durationPlies` est un entier positif ou nul réservé à l'évolution du lecteur ; la valeur non nulle est conservée dans le document mais n'étend pas encore l'affichage. Il ne faut donc pas interpréter cette propriété comme une fonctionnalité déjà implémentée.

## 6. Robustesse et compatibilité

- Une version inconnue doit être refusée explicitement.
- Une annotation mal formée doit produire une erreur explicite.
- Un chemin valide syntaxiquement mais absent de l'arbre PGN est signalé comme non résolu ; il ne doit pas être supprimé silencieusement.
- L'export PGN classique reste un export de compatibilité : les annotations non représentables en PGN standard peuvent être perdues et doivent faire l'objet d'un avertissement dans une future interface.

## 7. Évolutions réservées

Les futures versions pourront définir les couches, les portées de branches (ligne principale, branche courante, descendants), la durée effective, les phases avant/après le coup, les métadonnées de cours, les chapitres, les exercices et les médias. Ces éléments ne sont pas implicitement activés par la version 1.
