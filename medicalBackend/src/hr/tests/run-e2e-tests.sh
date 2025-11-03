#!/bin/bash

# Revenir à la racine du projet
cd "$(dirname "$0")/../../.."

# Exécuter les tests unitaires
echo "Exécution des tests unitaires..."
npm test src/hr/tests/unit/leave.service.spec.ts src/hr/tests/unit/payroll.service.spec.ts -- --detectOpenHandles

echo "Tests unitaires terminés."
echo "------------------------------------" 