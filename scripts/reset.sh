#!/bin/bash
psql -U postgres -d fitaura -c "DROP TABLE IF EXISTS nutrition_logs CASCADE;"
psql -U postgres -d fitaura -c "DROP TABLE IF EXISTS progress_logs CASCADE;"
psql -U postgres -d fitaura -c "DROP TABLE IF EXISTS users CASCADE;"
npx knex migrate:latest
