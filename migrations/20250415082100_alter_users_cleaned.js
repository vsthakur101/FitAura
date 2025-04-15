exports.up = function (knex) {
    return knex.schema.createTable('users', function (table) {
        table.increments('id').primary();
        table.string('name').nullable();
        table.string('email').unique().nullable();
        table.string('phone').unique().nullable();
        table.string('password').nullable();
        table.string('role').notNullable().defaultTo('beginner');
        table.string('profile_photo').nullable();
        table.text('bio').nullable();
        table.date('dob').nullable();
        table.string('gender').nullable();
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('users');
};
