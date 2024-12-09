const { connectDB } = require("../config/database");

// Fetch a single task by ID
exports.getTaskById = async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await connectDB();

        // Fetch task details
        const [taskResults] = await connection.execute(
            `SELECT id, task_name, task_details, expiration_date, task_step_one, task_step_two, task_step_three, task_price 
             FROM tasks WHERE id = ? AND task_live_status = 'live'`, 
            [id]
        );

        if (taskResults.length === 0) {
            req.flash('error', 'Task not found');
            return res.status(404).render('error', { message: 'Task not found' });
        }

        const task = taskResults[0];

        // Extract task steps
        const steps = [];
        if (task.task_step_one) steps.push({ name: task.task_step_one });
        if (task.task_step_two) steps.push({ name: task.task_step_two });
        if (task.task_step_three) steps.push({ name: task.task_step_three });

        const taskData = {
            id: task.id,
            name: task.task_name,
            instructions: task.task_details,
            expirationTime: task.expiration_date,
            amount: task.task_price,
            steps: steps
        };

        // Pass flash messages (success and error) to the template
        res.render('task', { 
            task: taskData,
            success_message: req.flash('success'),
            error_message: req.flash('error')
        });
    } catch (error) {
        console.error("Error fetching task:", error.message || error);
        req.flash('error', 'Failed to fetch the task');
        return res.status(500).render('error', { message: 'Failed to fetch the task' });
    }
};


// submit task
exports.submitTask = async (req, res) => {
    const { submitted_task_id } = req.body;
    const username = req.user.username; // Get the username from req.user

    // Media file names
    const media_upload_1 = req.files?.media_upload_1?.[0]?.filename;
    const media_upload_2 = req.files?.media_upload_2?.[0]?.filename || null;
    const media_upload_3 = req.files?.media_upload_3?.[0]?.filename || null;

    try {
        // Find user ID based on username
        const connection = await connectDB();
        const [userResults] = await connection.execute(
            `SELECT id FROM users WHERE username = ?`,
            [username]
        );

        if (userResults.length === 0) {
            req.flash('error', 'User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        const user_id = userResults[0].id; // Extract the user ID from the result

        // Insert the submission into the database
        await connection.execute(
            `INSERT INTO submissions (user_id, submitted_task_id, media_upload_1, media_upload_2, media_upload_3)
             VALUES (?, ?, ?, ?, ?)`,
            [user_id, submitted_task_id, media_upload_1, media_upload_2, media_upload_3]
        );

        req.flash('success', 'Task submitted successfully');
        return res.status(201).json({ message: "Task submitted successfully" });
    } catch (error) {
        console.error("Error submitting task:", error.message || error);
        req.flash('error', 'Failed to submit the task');
        return res.status(500).json({ error: "Failed to submit the task" });
    }
};


