 # Documentation Module Patients - Postman Collection

Cette collection Postman contient l'ensemble des endpoints du module patients du monolithe NestJS Medical.

## Configuration

1. Importez le fichier `module-patients.postman_collection.json` dans Postman
2. Assurez-vous d'avoir configuré les variables d'environnement suivantes :
   - `baseUrl` : URL de base de l'API (par défaut : http://localhost:3000)
   - `accessToken` : Token d'accès JWT (obtenu via le module Auth)
   - `patientId` : Sera automatiquement mis à jour lors de la création d'un patient

## Prérequis

Avant d'utiliser cette collection, vous devez vous authentifier avec un utilisateur valide (superadmin, admin de clinique ou employé) en utilisant la collection du module Auth :
- Exécutez la requête **Login** du module Auth pour obtenir un `accessToken`

## Scénario d'utilisation

### 1. Création d'un patient

1. Exécutez la requête **Create Patient** avec les informations du patient :
```json
{
    "firstName": "Jean",
    "lastName": "Dupont",
    "dateOfBirth": "1980-05-15",
    "gender": "MALE",
    "email": "jean.dupont@exemple.com",
    "phoneNumber": "0612345678",
    "address": {
        "street": "123 Rue Principale",
        "city": "Paris",
        "postalCode": "75001",
        "country": "France"
    },
    "insuranceInfo": {
        "provider": "CPAM",
        "policyNumber": "1234567890",
        "expiryDate": "2025-12-31"
    },
    "medicalHistory": {
        "allergies": ["Pénicilline", "Arachides"],
        "chronicConditions": ["Asthme"],
        "currentMedications": ["Ventoline 100mcg"]
    },
    "emergencyContact": {
        "name": "Marie Dupont",
        "relationship": "Épouse",
        "phoneNumber": "0698765432"
    }
}
```

L'ID du patient sera automatiquement enregistré dans la variable `patientId`.

### 2. Téléchargement d'un document pour le patient

1. Exécutez la requête **Upload Patient Document** :
   - Sélectionnez un fichier PDF à télécharger (champ `file`)
   - Renseignez le type de document (champ `documentType`)
   - Ajoutez une description (champ `description`)

```
Format : multipart/form-data
- file : [fichier PDF]
- documentType : "MEDICAL_REPORT" (ou autre type valide)
- description : "Rapport médical annuel"
```

### 3. Recherche de patients

1. Exécutez la requête **Get Patients** avec un terme de recherche :
```
{{baseUrl}}/patients?search=Dupont
```

Vous pouvez aussi ajouter des paramètres de pagination :
```
{{baseUrl}}/patients?search=Dupont&page=1&limit=10
```

### 4. Consultation des détails d'un patient

1. Exécutez la requête **Get Patient by ID** pour obtenir toutes les informations d'un patient spécifique :
```
{{baseUrl}}/patients/{{patientId}}
```

### 5. Consultation des documents d'un patient

1. Exécutez la requête **Get Patient Documents** pour obtenir la liste des documents associés au patient :
```
{{baseUrl}}/patients/{{patientId}}/documents
```

### 6. Mise à jour des informations d'un patient

1. Exécutez la requête **Update Patient** pour modifier certaines informations du patient :
```json
{
    "phoneNumber": "0687654321",
    "address": {
        "street": "456 Avenue des Champs-Élysées",
        "city": "Paris",
        "postalCode": "75008",
        "country": "France"
    },
    "medicalHistory": {
        "allergies": ["Pénicilline", "Arachides", "Fruits de mer"],
        "chronicConditions": ["Asthme", "Hypertension"]
    }
}
```

### 7. Suppression d'un patient

1. Exécutez la requête **Delete Patient** pour supprimer définitivement un patient :
```
{{baseUrl}}/patients/{{patientId}}
```

## Liste des endpoints

### Patients
- **POST {{baseUrl}}/patients** - Création d'un nouveau patient
- **GET {{baseUrl}}/patients?search=** - Recherche de patients avec pagination
- **GET {{baseUrl}}/patients/{{patientId}}** - Récupération des détails d'un patient
- **PATCH {{baseUrl}}/patients/{{patientId}}** - Mise à jour des informations d'un patient
- **DELETE {{baseUrl}}/patients/{{patientId}}** - Suppression d'un patient
- **POST {{baseUrl}}/patients/{{patientId}}/documents** - Téléchargement d'un document pour un patient (multipart)
- **GET {{baseUrl}}/patients/{{patientId}}/documents** - Récupération des documents d'un patient

## Notes importantes

- Tous les endpoints nécessitent une authentification via le header `Authorization: Bearer {{accessToken}}`.
- La suppression d'un patient est définitive et supprime également tous les documents associés.
- Seuls les fichiers PDF sont acceptés pour le téléchargement des documents.
- Les utilisateurs ne peuvent accéder qu'aux patients de leur propre tenant.