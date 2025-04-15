exports.up = function (knex) {
    return knex.schema.createTable('nutrition_logs', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.date('date').notNullable();
        table.string('meal_type', 50); // breakfast, lunch, etc.
        table.text('food_item');
        table.integer('calories');
        table.decimal('protein', 5, 2);
        table.decimal('carbs', 5, 2);
        table.decimal('fat', 5, 2);
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('nutrition_logs');
};
