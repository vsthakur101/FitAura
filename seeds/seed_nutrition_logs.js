exports.seed = async function (knex) {
    await knex('nutrition_logs').del();

    await knex('nutrition_logs').insert([
        {
            user_id: 1,
            date: '2025-04-14',
            meal_type: 'breakfast',
            food_item: 'Oats with banana',
            calories: 320,
            protein: 10,
            carbs: 50,
            fat: 5
        },
        {
            user_id: 1,
            date: '2025-04-14',
            meal_type: 'lunch',
            food_item: 'Grilled chicken and rice',
            calories: 600,
            protein: 35,
            carbs: 45,
            fat: 18
        }
    ]);
};
