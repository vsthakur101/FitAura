exports.seed = async function (knex) {
    await knex('users').del();

    await knex('users').insert([
        {
            id: 1,
            name: 'Demo User',
            email: 'demo@example.com',
            phone: '9876543210',
            password: 'hashedpassword123', // plain for demo
            role: 'beginner',
            profile_photo: null,
            bio: 'Just getting started!',
            dob: '2000-01-01',
            gender: 'male'
        }
    ]);
};
