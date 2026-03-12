#!/bin/bash
set -e

# Create 'testing' DB if it doesn't exist
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-EOSQL
  SELECT 'CREATE DATABASE testing OWNER $POSTGRES_USER TEMPLATE template0 ENCODING UTF8'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname='testing')\gexec
EOSQL
