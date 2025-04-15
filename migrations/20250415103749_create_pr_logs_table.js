exports.up = function (knex) {
    return knex.schema.createTable('pr_logs', function (table) {
        table.increments('id').primary();
        table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.string('exercise').notNullable();
        table.decimal('weight', 6, 2).notNullable();
        table.integer('reps').notNullable();
        table.date('date').notNullable();
        table.text('notes');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('pr_logs');
};
