exports.up = function (knex) {
    return knex.schema.createTable('exercises', function (table) {
        table.increments('id').primary();
        table.integer('day_id').unsigned().references('id').inTable('workout_days').onDelete('CASCADE');
        table.string('name').notNullable(); // e.g., Bench Press
        table.integer('sets');
        table.string('reps'); // 12-15
        table.string('rest_period'); // 60s, 90s
        table.text('notes');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('exercises');
};
