exports.up = function(knex) {
    return knex.schema.table('users', function(table) {
      table.string('fitness_goal');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('users', function(table) {
      table.dropColumn('fitness_goal');
    });
  };
  