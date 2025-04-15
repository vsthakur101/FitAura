exports.up = function (knex) {
    return knex.schema.alterTable('progress_logs', function (table) {
        table.decimal('body_fat', 5, 2).nullable(); // example: 18.75%
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('progress_logs', function (table) {
        table.dropColumn('body_fat');
    });
};
