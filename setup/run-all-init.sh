#!/bin/bash

# Charger les variables d'environnement depuis .env
set -a
source .env
set +a

# Demander les credentials (ou les passer en paramètres)
EMAIL="${1}"
PASSWORD="${2}"

if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
  echo "❌ Usage: bash setup/run-all-init.sh <email> <password>"
  exit 1
fi

# Exécuter le script d'initialisation
node setup/init-all-malandrinerie.js "$EMAIL" "$PASSWORD"
