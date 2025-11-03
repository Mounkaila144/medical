# Module ANALYTICS - Documentation Postman

Cette collection Postman permet de tester les APIs du module ANALYTICS (Analyses et Rapports) du système médical.

## Prérequis

1. Installez [Postman](https://www.postman.com/downloads/)
2. Importez le fichier `ANALYTICS-collection.json` dans Postman
3. Configurez les variables d'environnement:
   - `baseUrl`: URL de base de l'API (ex: https://api.medical.example.com/v1)
   - `token`: Votre token d'authentification JWT
   - `reportId`: ID d'un rapport à télécharger

## Flux d'utilisation typique

### 1. Générer un rapport

Utilisez la requête `Générer un rapport` pour créer un nouveau rapport analytique.

Exemple de payload:
```json
{
    "type": "daily_revenue",
    "params": {
        "date": "2025-05-10"
    },
    "format": "PDF",
    "title": "Rapport des revenus journaliers",
    "description": "Analyse des revenus pour la journée du 10 mai 2025"
}
```

Le champ `type` définit le type de rapport à générer. Les types disponibles incluent:
- `daily_revenue`: Revenus journaliers
- `monthly_revenue`: Revenus mensuels
- `patient_demographics`: Données démographiques des patients
- `appointment_statistics`: Statistiques des rendez-vous
- `prescription_analytics`: Analyse des prescriptions

Le champ `params` contient les paramètres spécifiques au type de rapport choisi.

Le champ `format` peut être `PDF` ou `CSV` selon le format souhaité pour le rapport.

Après avoir soumis cette requête, vous recevrez un identifiant de rapport (`reportId`). Mettez à jour la variable `reportId` dans vos variables d'environnement avec cette valeur.

### 2. Télécharger le rapport

Utilisez la requête `Télécharger un rapport` pour récupérer le rapport généré.

Cette requête utilise le `reportId` obtenu lors de l'étape précédente et téléchargera le rapport au format spécifié (PDF ou CSV).

Si le rapport n'est pas encore prêt, l'API renverra un statut indiquant que le rapport est toujours en cours de génération.

## Fonctionnalités administratives

### Rafraîchir les vues matérialisées

Cette opération est réservée aux utilisateurs ayant le rôle SUPERADMIN.

Utilisez la requête `Rafraîchir les vues matérialisées` pour mettre à jour les données agrégées utilisées par les rapports.

Exemple de payload:
```json
{
    "views": ["revenue_daily", "patient_visits_monthly"],
    "force": false
}
```

Le champ `views` est une liste des vues matérialisées à rafraîchir. Si ce champ est vide, toutes les vues seront rafraîchies.

Le champ `force` (optionnel) permet de forcer le rafraîchissement même si les données n'ont pas changé depuis la dernière mise à jour.

## Types de rapports disponibles

Le système propose plusieurs types de rapports:

| Type | Description | Paramètres requis |
|------|-------------|-------------------|
| `daily_revenue` | Revenus journaliers | `date` (format YYYY-MM-DD) |
| `monthly_revenue` | Revenus mensuels | `month` (format YYYY-MM) |
| `quarterly_revenue` | Revenus trimestriels | `year`, `quarter` (1-4) |
| `patient_demographics` | Statistiques démographiques des patients | Aucun |
| `doctor_performance` | Performances des médecins | `period` (optionnel) |

## Formats de sortie

Les rapports peuvent être générés dans différents formats:
- `PDF`: Format document portable, idéal pour l'impression
- `CSV`: Format tabulaire, idéal pour l'analyse dans des outils comme Excel
- `JSON`: Format structuré, idéal pour l'intégration avec d'autres systèmes 