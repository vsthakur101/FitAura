exports.up = async function (knex) {
    const columnsToAdd = [
      { name: 'fitness_goal', type: 'VARCHAR(255)' },
      { name: 'height', type: 'NUMERIC' },
      { name: 'weight', type: 'NUMERIC' },
      { name: 'profile_photo', type: 'VARCHAR(255)' }
    ];
  
    for (const col of columnsToAdd) {
      const exists = await knex.raw(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'users' AND column_name = ?`,
        [col.name]
      );
  
      if (exists.rows.length === 0) {
        console.log(`➕ Adding column '${col.name}'`);
        await knex.raw(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
      } else {
        console.log(`✅ Column '${col.name}' already exists, skipping...`);
      }
    }
  };
  
  exports.down = async function (knex) {
    const columnsToDrop = ['fitness_goal', 'height', 'weight', 'profile_photo'];
  
    for (const col of columnsToDrop) {
      const exists = await knex.raw(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'users' AND column_name = ?`,
        [col]
      );
  
      if (exists.rows.length > 0) {
        console.log(`❌ Dropping column '${col}'`);
        await knex.raw(`ALTER TABLE users DROP COLUMN ${col}`);
      } else {
        console.log(`⏭️ Column '${col}' doesn't exist, skipping drop`);
      }
    }
  };
  