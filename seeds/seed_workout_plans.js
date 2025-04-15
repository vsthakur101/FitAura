exports.seed = async function (knex) {
    await knex('exercises').del();
    await knex('workout_days').del();
    await knex('workout_plans').del();

    const [plan] = await knex('workout_plans').insert({
        user_id: 1,
        title: 'Beginner Push-Pull-Legs',
        goal: 'Muscle Gain',
        duration_weeks: 6,
        level: 'beginner'
    }).returning('*');

    const planId = plan.id;

    const [day1] = await knex('workout_days').insert({
        plan_id: planId,
        day_number: 1,
        title: 'Push Day',
        notes: 'Focus on chest, shoulders, triceps'
    }).returning('*');

    const [day2] = await knex('workout_days').insert({
        plan_id: planId,
        day_number: 2,
        title: 'Pull Day',
        notes: 'Focus on back, biceps'
    }).returning('*');

    const [day3] = await knex('workout_days').insert({
        plan_id: planId,
        day_number: 3,
        title: 'Leg Day',
        notes: 'Focus on quads, hamstrings, glutes'
    }).returning('*');

    const day1Id = day1.id;
    const day2Id = day2.id;
    const day3Id = day3.id;

    await knex('exercises').insert([
        // Push Day
        { day_id: day1Id, name: 'Bench Press', sets: 4, reps: '8-10', rest_period: '90s' },
        { day_id: day1Id, name: 'Overhead Press', sets: 3, reps: '10-12', rest_period: '60s' },
        { day_id: day1Id, name: 'Tricep Pushdown', sets: 3, reps: '12-15', rest_period: '60s' },

        // Pull Day
        { day_id: day2Id, name: 'Deadlift', sets: 4, reps: '5-8', rest_period: '120s' },
        { day_id: day2Id, name: 'Lat Pulldown', sets: 3, reps: '10-12', rest_period: '60s' },
        { day_id: day2Id, name: 'Barbell Curl', sets: 3, reps: '12-15', rest_period: '60s' },

        // Leg Day
        { day_id: day3Id, name: 'Squats', sets: 4, reps: '8-10', rest_period: '90s' },
        { day_id: day3Id, name: 'Lunges', sets: 3, reps: '12', rest_period: '60s' },
        { day_id: day3Id, name: 'Leg Curl Machine', sets: 3, reps: '15', rest_period: '60s' }
    ]);
};
