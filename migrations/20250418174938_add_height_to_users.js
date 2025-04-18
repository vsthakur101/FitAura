exports.up = function(knex) {
    return knex.schema.table('users', function(table) {
      table.decimal('height', 5, 2); // or table.integer('height');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('users', function(table) {
      table.dropColumn('height');
    });
  };
  