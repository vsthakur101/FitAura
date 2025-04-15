exports.seed = async function (knex) {
    // Delete existing beginner/advanced users first
    await knex('users').whereIn('role', ['beginner', 'advanced']).del();

    // Insert sample clients
    await knex('users').insert([
        {
            name: 'Ravi Sharma',
            email: 'ravi@example.com',
            phone: '9876543210',
            password: 'hashed_password',
            role: 'beginner'
        },
        {
            name: 'Anjali Mehta',
            email: 'anjali@example.com',
            phone: '8765432109',
            password: 'hashed_password',
            role: 'advanced'
        },
        {
            name: 'Manish Yadav',
            email: 'manish@example.com',
            phone: '7654321098',
            password: 'hashed_password',
            role: 'beginner'
        }
    ]);
};
