exports.up = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        table.string('password').nullable().alter(); // ✅ allow null
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        table.string('password').notNullable().alter(); // rollback
    });
};
