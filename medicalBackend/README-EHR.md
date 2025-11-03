# Module EHR - Documentation Postman

Cette collection Postman permet de tester les APIs du module EHR (Electronic Health Record) du système médical.

## Prérequis

1. Installez [Postman](https://www.postman.com/downloads/)
2. Importez le fichier `EHR-collection.json` dans Postman
3. Configurez les variables d'environnement:
   - `baseUrl`: URL de base de l'API (ex: https://api.medical.example.com/v1)
   - `token`: Votre token d'authentification JWT
   - `id`: ID d'un encounter à utiliser pour les tests

## Flux d'utilisation typique

### 1. Créer un Encounter

Utilisez la requête `Créer un Encounter` pour créer un nouveau dossier de consultation.

Exemple de payload:
```json
{
    "motive": "Douleurs abdominales et fièvre",
    "exam": "Examen physique montre une sensibilité dans la région inférieure droite de l'abdomen. Température: 38.5°C",
    "diagnosis": "Appendicite aiguë suspectée",
    "icd10Codes": ["K35.80", "R10.0"]
}
```

Après avoir créé l'encounter, récupérez l'ID retourné dans la réponse et mettez à jour la variable `id` dans vos variables d'environnement.

### 2. Générer une prescription

Utilisez la requête `Créer une prescription` pour générer une ordonnance liée à l'encounter.

La requête retournera un PDF contenant l'ordonnance que vous pourrez prévisualiser directement dans Postman (réponse de type `application/pdf`).

### 3. Verrouiller l'Encounter

Utilisez la requête `Verrouiller un Encounter` pour finaliser et verrouiller le dossier de consultation.

Une fois verrouillé, le dossier ne pourra plus être modifié.

### 4. Tentative de modification après verrouillage

Si vous essayez d'envoyer à nouveau une requête `Créer une prescription` ou toute requête modifiant l'encounter après son verrouillage, vous devriez recevoir une erreur 401 Unauthorized, indiquant que le dossier est verrouillé et ne peut plus être modifié.

## Autres opérations

### Obtenir les détails d'un Encounter

Utilisez la requête `Obtenir un Encounter` pour récupérer toutes les informations d'un dossier de consultation existant.

### Créer un rapport de laboratoire

Utilisez la requête `Créer un rapport de laboratoire` pour ajouter des résultats de tests de laboratoire associés à un encounter.

## Structure d'un Encounter

Un Encounter comprend les champs suivants:
- `motive`: Motif de la consultation
- `exam`: Notes de l'examen physique
- `diagnosis`: Diagnostic final posé
- `icd10Codes`: Liste des codes ICD-10 associés au diagnostic 