exports.up = function (knex) {
    return knex.schema.createTable('schedule', function (table) {
      table.increments('id');
      table.integer('trainer_id').references('users.id');
      table.integer('client_id').references('users.id');
      table.date('date');
      table.string('time');
      table.string('title');
      table.timestamps(true, true);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('schedule');
  };
  