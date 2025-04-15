exports.up = function (knex) {
    return knex.schema.createTable('progress_logs', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.date('date').notNullable();
        table.decimal('weight', 5, 2);
        table.decimal('body_fat_percentage', 5, 2);
        table.text('notes');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('progress_logs');
};
