exports.up = function (knex) {
    return knex.schema.createTable('client_trainer_map', function (table) {
        table.increments('id').primary();
        table.integer('trainer_id').references('id').inTable('users').onDelete('CASCADE');
        table.integer('client_id').references('id').inTable('users').onDelete('CASCADE');
        table.timestamp('assigned_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('client_trainer_map');
};
