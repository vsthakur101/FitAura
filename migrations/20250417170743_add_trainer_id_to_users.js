exports.up = function (knex) {
    return knex.schema.table('users', function (table) {
      table.integer('trainer_id').references('users.id');
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.table('users', function (table) {
      table.dropColumn('trainer_id');
    });
  };
  