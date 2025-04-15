exports.up = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        table.string('email').nullable().alter(); // ✅ allow null
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        table.string('email').notNullable().alter();
    });
};
