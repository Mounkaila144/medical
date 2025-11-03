#!/bin/bash

# Aller à la racine du projet
cd "$(dirname "$0")/../../../.."

# Exécuter les tests avec Jest en utilisant notre configuration spécifique
npx jest -c ./src/scheduling/__tests__/e2e/jest-scheduling-e2e.config.js --testPathPattern=src/scheduling/__tests__/e2e/scheduling.e2e-spec.ts --runInBand --forceExit 