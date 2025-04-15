#!/bin/bash

echo "🔁 Seeding FitAura database in correct order..."

echo "👉 Seeding users..."
npx knex seed:run --specific=seed_users.js

echo "👉 Seeding progress logs..."
npx knex seed:run --specific=seed_progress_logs.js

echo "👉 Seeding nutrition logs..."
npx knex seed:run --specific=seed_nutrition_logs.js

echo "✅ Seeding completed successfully!"
