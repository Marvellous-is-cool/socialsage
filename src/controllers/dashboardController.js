const { connectDB } = require('../config/database');
const moment = require('moment-timezone'); // Use moment-timezone to handle timezones

// Fetch tasks for the dashboard
exports.getDashboardTasks = async (req, res) => {
    const userId = req.user.id; // Get the current logged-in user's ID

    try {
        const connection = await connectDB();

        // SQL query to fetch the user's current plan and subscription expiry date
        const [userPlanRows] = await connection.execute(`
            SELECT u.current_plan, s.expiry_date
            FROM users u
            JOIN subscriptions s ON u.id = s.user_id
            WHERE u.id = ? AND s.expiry_date > NOW()
            ORDER BY s.updated_on DESC
            LIMIT 1
        `, [userId]);

        if (userPlanRows.length === 0) {
            // Handle case where user doesn't have a valid subscription
            req.flash('error', 'No valid subscription found.');
            return res.redirect('/');
        }

        const currentPlan = userPlanRows[0].current_plan; // User's current plan
        const expiryDate = moment(userPlanRows[0].expiry_date); // Subscription expiry date

        // SQL query to fetch tasks based on the user's plan, task status, expiration date, and excluding submitted tasks
        const [tasks] = await connection.execute(`
            SELECT * 
            FROM tasks t
            WHERE (t.task_for_${currentPlan} = 'yes')
              AND t.task_live_status = 'live'
              AND t.expiration_date > NOW()
              AND NOT EXISTS (
                  SELECT 1 
                  FROM submissions s
                  WHERE s.submitted_task_id = t.id
                    AND s.user_id = ?
              )
            ORDER BY t.created_on DESC
        `, [userId]);

        // Calculate if it's withdrawal time (Friday before 12:00 AM WAT)
        const now = moment().tz("Africa/Lagos"); // WAT timezone
        const nextFridayMidnight = moment().tz("Africa/Lagos").day(5).hour(0).minute(0).second(0);

        // Check if it's Friday before 12 AM (to show button and countdown)
        const isWithdrawalTime = now.isBefore(nextFridayMidnight);

        // Close the connection
        connection.end();

        // Render the dashboard page and pass the tasks and subscription info
        res.render('Dashboard', { 
            user: req.user,  // Pass the user info
            tasks,           // Send the tasks data
            success_message: req.flash('success'),
            error_message: req.flash('error'),
            isWithdrawalTime, // Pass the withdrawal time status to the view
            nextFridayMidnight: nextFridayMidnight.format(), // Pass the next Friday time
            currentTime: now.format(), // Pass current time for comparison in JavaScript
            currentPlan,     // Pass the current plan
            expiryDate: expiryDate.format('MMMM Do YYYY') // Pass the subscription expiry date
        });

    } catch (err) {
        console.error('Error fetching tasks:', err);
        req.flash('error', 'Could not fetch tasks at this time.');
        res.redirect('/');
    }
};

