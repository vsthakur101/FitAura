exports.up = function (knex) {
    return knex.schema.createTable('workout_days', function (table) {
        table.increments('id').primary();
        table.integer('plan_id').unsigned().references('id').inTable('workout_plans').onDelete('CASCADE');
        table.integer('day_number').notNullable(); // Day 1, Day 2, etc.
        table.string('title'); // e.g., Push Day, Pull Day
        table.text('notes');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('workout_days');
};
