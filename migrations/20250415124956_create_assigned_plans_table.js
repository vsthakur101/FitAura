exports.up = function (knex) {
    return knex.schema.createTable('assigned_plans', function (table) {
        table.increments('id').primary();
        table.integer('trainer_id').references('id').inTable('users').onDelete('CASCADE');
        table.integer('client_id').references('id').inTable('users').onDelete('CASCADE');
        table.integer('plan_id').references('id').inTable('workout_plans').onDelete('CASCADE');
        table.text('notes');
        table.timestamp('assigned_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('assigned_plans');
};
