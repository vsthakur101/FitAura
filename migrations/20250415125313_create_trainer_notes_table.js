exports.up = function (knex) {
    return knex.schema.createTable('trainer_notes', function (table) {
        table.increments('id').primary();
        table.integer('trainer_id').references('id').inTable('users').onDelete('CASCADE');
        table.integer('client_id').references('id').inTable('users').onDelete('CASCADE');
        table.text('note').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('trainer_notes');
};
