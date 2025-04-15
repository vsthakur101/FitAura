exports.up = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        table.string('name').nullable().alter(); // ✅ make name optional
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        table.string('name').notNullable().alter(); // rollback
    });
};
