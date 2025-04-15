exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex('users').del();

    // Inserts seed entries
    await knex('users').insert([
        {
            id: 1,
            name: 'Demo User',
            email: 'demo@example.com',
            phone: '9876543210',
            password: 'demo123', // in real case, hashed
            role: 'beginner',
            profile_photo: null,
            bio: 'This is a demo user',
            dob: '2000-01-01',
            gender: 'male'
        }
    ]);
};
