exports.seed = async function (knex) {
    await knex('progress_logs').del();

    await knex('progress_logs').insert([
        {
            user_id: 1,
            date: '2025-04-01',
            weight: 85.5,
            body_fat_percentage: 22.3,
            notes: 'Starting workout journey.'
        },
        {
            user_id: 1,
            date: '2025-04-08',
            weight: 83.2,
            body_fat_percentage: 21.0,
            notes: 'Feeling more energetic.'
        }
    ]);
};
