exports.up = function (knex) {
    return knex.schema.createTable('user_schedule_reminders', function (table) {
        table.increments('id').primary();
        table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.string('title').notNullable();
        table.text('description');
        table.date('date').notNullable();
        table.time('time').notNullable();
        table.string('repeat').defaultTo('once'); // once | daily | weekly
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('user_schedule_reminders');
};
