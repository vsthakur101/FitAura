exports.up = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        table.string('profile_photo').nullable();
        table.text('bio').nullable();
        table.date('dob').nullable();
        table.string('gender').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        table.dropColumn('profile_photo');
        table.dropColumn('bio');
        table.dropColumn('dob');
        table.dropColumn('gender');
    });
};
