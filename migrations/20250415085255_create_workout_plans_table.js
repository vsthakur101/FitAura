exports.up = function (knex) {
    return knex.schema.createTable('workout_plans', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.string('title').notNullable();
        table.string('goal'); // fat loss, strength, muscle gain, etc.
        table.integer('duration_weeks');
        table.string('level'); // beginner, intermediate, advanced
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('workout_plans');
};
