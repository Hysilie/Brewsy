#!/bin/bash

# Charger les variables d'environnement depuis .env
set -a
source .env
set +a

# Exécuter le script d'initialisation
node setup/init-malandrinerie.js
