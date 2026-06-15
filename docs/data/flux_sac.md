# Table `flux_sac` — Traçabilité du flux de production

## 1. Présentation générale

La table `flux_sac` enregistre l'historique des passages d'un **sac de production** (pièces en cours de fabrication : chaussettes) à travers les différents postes de l'atelier.

Chaque ligne de la table correspond à **un événement** : un opérateur scanne le sac à un poste donné, à un instant donné, en y associant une quantité.

La table ne contient donc pas "l'état courant" d'un sac, mais **l'historique complet de tous les scans**. Pour connaître l'état d'un sac à un instant donné, il faut reconstituer son parcours en lisant l'ensemble des lignes qui le concernent (filtrées par `num_sac_parent`).

## 2. Structure des colonnes

| Colonne          | Type (indicatif)      | Description                                                                                                                                                                                                             |
|------------------|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `num_sac_parent` | varchar(17)           | Identifiant du sac concerné par l'événement. Format `XXXXX-XXXXXXX-XXX` : les 5 premiers chiffres identifient l'ordre de fabrication d'origine, les segments suivants identifient la ligne d'ordre et le numéro de sac. |
| `num_sac_enfant` | varchar(17), nullable | Renseigné uniquement pour les événements de regroupement (`type = 'SUPP_REGROUPEMENT'`). Désigne le sac "enfant" qui a été fusionné dans le sac "parent" (`num_sac_parent`).                                            |
| `emplacement`    | varchar               | Code du poste de production où s'est produit l'événement (voir section 3).                                                                                                                                              |
| `type`           | varchar               | Nature de l'événement (voir section 4).                                                                                                                                                                                 |
| `qte_rebus`      | int                   | Quantité associée à l'événement. Le sens exact dépend du couple (`emplacement`, `type`) — voir sections 5 et 6.                                                                                                         |
| `date`           | date                  | Date de l'événement (format `YYYY-MM-DD`).                                                                                                                                                                              |
| `heure`          | time                  | Heure de l'événement (format `HH:MM:SS`).                                                                                                                                                                               |
| `utilisateur`    | varchar               | Identifiant/nom de l'opérateur qui a réalisé le scan.                                                                                                                                                                   |

### Unité de mesure : pièces individuelles vs paires

Point important pour interpréter correctement `qte_rebus` : **l'unité de mesure change au passage du poste Qualité (`QUALI`)**.

- **Avant `QUALI`** (postes `TRICO`, `RETOUR`, `REMAIL`, `FORM`, et la ligne `DEB` de `QUALI`) : `qte_rebus` est exprimé en **pièces individuelles** (ex : une chaussette = 1 unité).
- **À partir de la ligne `FIN` de `QUALI`** (et pour tous les postes suivants : `BROD`, `ETIQUE`, `FLUX_PROD`) : `qte_rebus` est exprimé en **paires** (ex : une paire de chaussettes = 1 unité).

C'est l'opération d'appairage qui matérialise ce changement d'unité : elle regroupe les pièces individuelles deux par deux pour former des paires.

> **Exemple** : un sac arrive au poste Qualité avec `QUALI DEB = 100` (100 chaussettes individuelles à appairer). Après appairage, `QUALI FIN = 50` (50 paires de chaussettes assorties).

Pour toute analyse comparant des quantités de part et d'autre du poste Qualité (par exemple un taux de rendement global), il faut donc appliquer un facteur de conversion (×2 ou ÷2 selon le sens) entre pièces et paires.

Pour un sac donné, sur un poste donné, on attend au maximum une ligne `DEB` et une ligne `FIN` — sauf au poste Qualité/Appairage, qui peut comporter des lignes supplémentaires (voir section 6.2).

## 3. Les postes (`emplacement`)

| Code        | Poste                  | Description                                                   |
|-------------|------------------------|---------------------------------------------------------------|
| `TRICO`     | Tricotage              | Tricotage de la pièce sur le métier circulaire                |
| `RETOUR`    | Retournage             | Retournement de la pièce (endroit/envers)                     |
| `REMAIL`    | Remaillage             | Fermeture de la pointe (remaillage)                           |
| `FORM`      | Formage                | Mise en forme / repassage                                     |
| `QUALI`     | Qualité / Appairage    | Contrôle qualité et appairage des paires                      |
| `BROD`      | Broderie               | Broderie / personnalisation (poste optionnel selon le modèle) |
| `ETIQUE`    | Étiquetage / packaging | Étiquetage et mise en conditionnement                         |
| `FLUX_PROD` | Fin de flux production | Clôture finale du sac, sortie de production                   |

Ces postes représentent, dans cet ordre (à l'exception de la broderie qui est optionnelle), le **flux de fabrication standard** d'un sac.

## 4. Les types d'événement (`type`)

| Code                | Signification                                                                                                                        |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `DEB`               | Début de poste — le sac arrive sur ce poste et y est pris en charge                                                                  |
| `FIN`               | Fin de poste — le sac quitte ce poste, traitement terminé                                                                            |
| `SUPP_REBUS`        | Suppression manuelle du rebus restant — clôture définitive d'un sac dont le reliquat est déclaré perdu (uniquement au poste Qualité) |
| `SUPP_REGROUPEMENT` | Fusion de deux sacs au poste Qualité — le sac "enfant" est versé dans le sac "parent"                                                |

## 5. Cycle de vie d'un sac sur un poste "classique"

Pour les postes Retournage, Remaillage, Formage, Broderie et Étiquetage, le cycle de vie est le même :

> Les quantités (`qte_rebus`) sont exprimées en **pièces individuelles** pour Retournage, Remaillage et Formage, et en **paires** pour Broderie et Étiquetage — le changement d'unité intervient au poste Qualité (voir section 2).

1. Le sac arrive sur le poste → une ligne `DEB` est créée, avec `qte_rebus` = quantité de pièces qui **entrent** sur ce poste (= quantité sortie du poste précédent).
2. L'opérateur traite le sac puis le clôture → une ligne `FIN` est créée, avec `qte_rebus` = quantité de pièces **rejetées (déchet)** détectées sur ce poste.

**Point important** : sur ces postes, le `qte_rebus` de la ligne `DEB` n'est **pas un déchet**, c'est la quantité **entrante**. Seul le `qte_rebus` de la ligne `FIN` représente un **déchet réel**.

Tant qu'une ligne `FIN` n'existe pas pour un sac sur un poste donné, ce sac est considéré comme **"en cours" sur ce poste**.

### Exemple : historique complet d'un sac

```sql
SELECT emplacement, type, qte_rebus, date, heure, utilisateur
FROM flux_sac
WHERE num_sac_parent = '00123-0000456-001'
ORDER BY date, heure;
```

### Exemple : sacs actuellement "en cours" sur le poste Formage

Un sac est en cours sur `FORM` s'il a une ligne `DEB` mais pas de ligne `FIN` correspondante :

```sql
SELECT deb.num_sac_parent, deb.qte_rebus AS qte_entree, deb.date, deb.heure, deb.utilisateur
FROM flux_sac deb
LEFT JOIN flux_sac fin
    ON fin.num_sac_parent = deb.num_sac_parent
    AND fin.emplacement = 'FORM'
    AND fin.type = 'FIN'
WHERE deb.emplacement = 'FORM'
  AND deb.type = 'DEB'
  AND fin.num_sac_parent IS NULL;
```

### Exemple : quantité de déchet généré sur le poste Remaillage, par jour

```sql
SELECT date, SUM(qte_rebus) AS total_dechet
FROM flux_sac
WHERE emplacement = 'REMAIL'
  AND type = 'FIN'
GROUP BY date
ORDER BY date;
```

## 6. Cas particuliers

### 6.1 Tricotage (`TRICO`)

Le tricotage est le **premier poste** du flux : il n'y a donc pas de quantité "entrante" issue d'un poste précédent.

- Ligne `DEB` au poste `TRICO` : `qte_rebus` = quantité de pièces **sorties** du métier à tricoter, exprimée en **pièces individuelles** (= quantité qui va entrer au poste Retournage).
- Ligne `FIN` au poste `TRICO` : `qte_rebus` = déchet machine constaté à la clôture du tricotage, également exprimé en **pièces individuelles**.

```sql
-- Sacs dont le tricotage est terminé, avec quantité produite et déchet machine
SELECT
    deb.num_sac_parent,
    deb.qte_rebus AS qte_tricotee,
    IFNULL(fin.qte_rebus, 0) AS dechet_metier
FROM flux_sac deb
LEFT JOIN flux_sac fin
    ON fin.num_sac_parent = deb.num_sac_parent
    AND fin.emplacement = 'TRICO'
    AND fin.type = 'FIN'
WHERE deb.emplacement = 'TRICO'
  AND deb.type = 'DEB';
```

### 6.2 Qualité / Appairage (`QUALI`)

C'est le poste le plus complexe : en plus de `DEB`/`FIN`, il peut comporter des lignes `SUPP_REGROUPEMENT` et `SUPP_REBUS`.

- Ligne `DEB` au poste `QUALI` : quantité entrante au contrôle qualité, exprimée en **pièces individuelles** (= sortie du poste Formage).
- Ligne `FIN` au poste `QUALI` : `qte_rebus` = quantité de **paires assorties** (bon produit final, appairé), exprimée en **paires**. **C'est à cette étape que l'unité de mesure change** : par exemple `QUALI DEB = 100` (100 pièces individuelles) peut donner `QUALI FIN = 50` (50 paires).
- Ligne `SUPP_REBUS` (optionnelle) : n'existe que s'il faut déclarer perdu un reliquat — soit le restant non appairé après la ligne `FIN`, soit la totalité du sac si aucune paire n'a pu être formée. Beaucoup de sacs n'ont jamais cette ligne (tout a été appairé, `FIN` suffit à clôturer le poste). Quand elle existe, c'est elle qui constitue la **clôture définitive** du sac sur ce poste.
- Ligne `SUPP_REGROUPEMENT` : un sac "enfant" (`num_sac_enfant`) est fusionné dans un sac "parent" (`num_sac_parent`). `qte_rebus` = quantité apportée par l'enfant au parent. Après cet événement, le sac enfant est considéré comme **absorbé** : son flux s'arrête à ce poste, et toute sa quantité restante est comptabilisée dans le sac parent.

**Sacs en attente d'appairage** : un sac est en attente sur `QUALI` s'il est sorti du Formage (ligne `FIN` sur `FORM` existe), n'a pas encore de ligne `FIN` sur `QUALI`, n'a pas été absorbé par un regroupement (pas de ligne `SUPP_REGROUPEMENT` où il est l'enfant) et n'a pas été clôturé (`SUPP_REBUS`).

```sql
-- Sacs sortis du formage et en attente d'appairage
SELECT for_fin.num_sac_parent, for_fin.qte_rebus AS qte_en_attente
FROM flux_sac for_fin
LEFT JOIN flux_sac quali_fin
    ON quali_fin.num_sac_parent = for_fin.num_sac_parent
    AND quali_fin.emplacement = 'QUALI' AND quali_fin.type = 'FIN'
LEFT JOIN flux_sac quali_sup
    ON quali_sup.num_sac_parent = for_fin.num_sac_parent
    AND quali_sup.emplacement = 'QUALI' AND quali_sup.type = 'SUPP_REBUS'
LEFT JOIN flux_sac quali_reg_enfant
    ON quali_reg_enfant.num_sac_enfant = for_fin.num_sac_parent
    AND quali_reg_enfant.emplacement = 'QUALI' AND quali_reg_enfant.type = 'SUPP_REGROUPEMENT'
WHERE for_fin.emplacement = 'FORM' AND for_fin.type = 'FIN'
  AND quali_fin.num_sac_parent IS NULL
  AND quali_sup.num_sac_parent IS NULL
  AND quali_reg_enfant.num_sac_enfant IS NULL;
```

```sql
-- Liste des regroupements de sacs réalisés au poste Qualité
SELECT
    num_sac_parent AS sac_destination,
    num_sac_enfant AS sac_absorbe,
    qte_rebus AS qte_transferee,
    date, heure, utilisateur
FROM flux_sac
WHERE emplacement = 'QUALI' AND type = 'SUPP_REGROUPEMENT';
```

```sql
-- Quantité finale appairée par sac
SELECT num_sac_parent, qte_rebus AS qte_appairee, utilisateur, date, heure
FROM flux_sac
WHERE emplacement = 'QUALI' AND type = 'FIN';
```

### 6.3 Fin de flux (`FLUX_PROD`)

Un seul type de ligne possible : `FIN`. Elle marque la **clôture définitive** du sac et sa sortie de la zone de production. `qte_rebus` est exprimé en **paires**, comme pour tous les postes situés après Qualité.

```sql
-- Sacs définitivement clôturés (sortis de production)
SELECT num_sac_parent, qte_rebus AS qte_finale, utilisateur, date, heure
FROM flux_sac
WHERE emplacement = 'FLUX_PROD' AND type = 'FIN';
```

## 7. Requêtes types supplémentaires

### Statut courant d'un sac sur chaque poste

```sql
SELECT
    emplacement,
    MAX(CASE WHEN type = 'DEB' THEN 'Démarré' END) AS demarrage,
    MAX(CASE WHEN type = 'FIN' THEN 'Terminé' END) AS fin
FROM flux_sac
WHERE num_sac_parent = '00123-0000456-001'
GROUP BY emplacement;
```

### Temps de passage d'un sac sur un poste

```sql
SELECT
    deb.num_sac_parent,
    TIMESTAMPDIFF(MINUTE,
        CONCAT(deb.date, ' ', deb.heure),
        CONCAT(fin.date, ' ', fin.heure)
    ) AS duree_minutes
FROM flux_sac deb
JOIN flux_sac fin
    ON fin.num_sac_parent = deb.num_sac_parent
    AND fin.emplacement = deb.emplacement
    AND fin.type = 'FIN'
WHERE deb.emplacement = 'BROD'
  AND deb.type = 'DEB';
```

### Activité d'un opérateur sur une journée

```sql
SELECT utilisateur, emplacement, type, COUNT(*) AS nb_scans, SUM(qte_rebus) AS qte_totale
FROM flux_sac
WHERE date = '2026-06-12'
GROUP BY utilisateur, emplacement, type
ORDER BY utilisateur, emplacement;
```

## 8. Glossaire

- **Sac** : lot physique de pièces en cours de fabrication, identifié par `num_sac_parent`. Suit le flux de production de poste en poste.
- **Poste** : étape de l'atelier (`emplacement`) où une opération est réalisée sur le sac.
- **Déchet / rebus** : quantité de pièces mises au rebut, constatée à la fin (`FIN`) d'un poste.
- **Appairage** : opération consistant à assortir les pièces par paires (par exemple chaussette gauche/droite) au poste Qualité. C'est cette opération qui fait passer l'unité de mesure de `qte_rebus` de la pièce individuelle à la paire.
- **Pièce / unité individuelle** : unité de mesure de `qte_rebus` utilisée sur tous les postes en amont de Qualité, ainsi que sur la ligne `DEB` de Qualité.
- **Paire** : unité de mesure de `qte_rebus` utilisée à partir de la ligne `FIN` de Qualité et sur tous les postes en aval (Broderie, Étiquetage, Fin de flux). Une paire = 2 pièces individuelles.
- **Regroupement** : fusion de deux sacs au poste Qualité, lorsque le reliquat d'un sac est trop faible pour être traité seul — il est versé dans un autre sac.
- **Clôture** : événement marquant la fin définitive du traitement d'un sac sur un poste (`FIN` pour les postes classiques, `SUPP_REBUS` pour Qualité, `FIN` sur `FLUX_PROD` pour la fin de production).