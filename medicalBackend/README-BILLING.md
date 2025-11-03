# Module BILLING - Documentation Postman

Cette collection Postman permet de tester les APIs du module BILLING (Facturation) du système médical.

## Prérequis

1. Installez [Postman](https://www.postman.com/downloads/)
2. Importez le fichier `BILLING-collection.json` dans Postman
3. Configurez les variables d'environnement:
   - `baseUrl`: URL de base de l'API (ex: https://api.medical.example.com/v1)
   - `token`: Votre token d'authentification JWT
   - `id`: ID d'une facture à utiliser pour les tests

## Flux d'utilisation typique

### 1. Créer un tarif

Utilisez la requête `Créer un tarif` pour définir un nouveau service facturable.

Exemple de payload:
```json
{
    "name": "Consultation standard",
    "code": "CONS-STD",
    "amount": 75.00,
    "currency": "EUR",
    "taxRate": 0,
    "category": "MEDICAL_SERVICE",
    "description": "Consultation médicale standard de 30 minutes"
}
```

### 2. Créer une facture

Utilisez la requête `Créer une facture` pour créer une nouvelle facture pour un patient.

Après avoir créé la facture, récupérez l'ID retourné dans la réponse et mettez à jour la variable `id` dans vos variables d'environnement.

### 3. Ajouter une ligne à la facture

Utilisez la requête `Ajouter une ligne à la facture` pour ajouter des services ou produits à facturer.

Exemple de ligne de facture:
```json
{
    "description": "Consultation standard",
    "tariffCode": "CONS-STD",
    "quantity": 1,
    "unitPrice": 75.00,
    "taxRate": 0,
    "discountPercentage": 0
}
```

### 4. Envoyer la facture

Utilisez la requête `Envoyer la facture` pour envoyer la facture au patient, généralement par email.

### 5. Enregistrer le paiement

Utilisez la requête `Marquer la facture comme payée` pour enregistrer un paiement effectué par le patient.

Exemple de paiement par carte bancaire:
```json
{
    "paymentMethod": "CARD",
    "amount": 75.00,
    "paymentDate": "2023-11-15",
    "transactionId": "TRX789012",
    "notes": "Paiement par carte bancaire en cabinet"
}
```

### 6. Exporter le journal comptable

Utilisez la requête `Exporter le journal comptable` pour obtenir un rapport des transactions financières sur une période donnée.

L'endpoint accepte des paramètres de date pour filtrer les résultats:
- `from`: Date de début (format YYYY-MM-DD)
- `to`: Date de fin (format YYYY-MM-DD)

## Types de paiement supportés

Le système prend en charge plusieurs méthodes de paiement:
- `CARD`: Paiement par carte bancaire
- `CASH`: Paiement en espèces
- `TRANSFER`: Virement bancaire
- `CHECK`: Paiement par chèque
- `ONLINE`: Paiement en ligne

## Structure d'une facture

Une facture comprend les éléments suivants:
- Informations patient (ID, adresse de facturation)
- Référence à la consultation (encounterId)
- Dates d'émission et d'échéance
- Lignes de facturation (services ou produits)
- État de paiement (en attente, payée, annulée)
- Historique des paiements 