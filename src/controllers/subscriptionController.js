const { connectDB } = require('../config/database');
const moment = require('moment'); 

exports.getSubscriptionPage = async (req, res) => {
    let connection;
    try {
        connection = await connectDB();

        // Fetch the user's current plan and subscription details
        const [user] = await connection.execute(
            `SELECT u.email, u.current_plan, s.expiry_date, p.plan_name, p.plan_amount, p.plan_expiry_days, GROUP_CONCAT(f.feature_description) AS features
            FROM users u
            LEFT JOIN subscriptions s ON u.id = s.user_id
            LEFT JOIN plans p ON s.plan_id = p.id
            LEFT JOIN plans_features f ON p.id = f.plan_id
            WHERE u.id = ? AND s.expiry_date > CURRENT_DATE
            GROUP BY u.id, s.id, p.id
            ORDER BY s.updated_on DESC
            LIMIT 1;`,
            [req.user.id]
        );

        // Fetch all available plans
        const [plans] = await connection.execute("SELECT p.*, GROUP_CONCAT(f.feature_description ORDER BY f.id) AS features FROM plans p LEFT JOIN plans_features f ON p.id = f.plan_id GROUP BY p.id");

        // Calculate remaining days and limit percentage for the current plan
        let remainingDays = 0;
        let limitPercent = 0;
        if (user[0]?.expiry_date) {
            const today = moment();
            const expiryDate = moment(user[0].expiry_date);
            const planDuration = user[0]?.plan_expiry_days || 0;

            remainingDays = Math.max(0, expiryDate.diff(today, 'days'));
            limitPercent = planDuration > 0 ? (remainingDays / planDuration) * 100 : 0;
        }

        // Map available plans with their features
        const availablePlans = plans.map(plan => ({
            ...plan,
            features: plan.features ? plan.features.split(',') : [], // Split features for each plan
        }));

        console.log(availablePlans);


        // Prepare the subscription data
        const subscriptionData = user[0] ? {
            email: user[0].email,
            currentPlan: {
                name: user[0]?.current_plan,
                price: user[0]?.plan_amount,
                limit: user[0]?.plan_expiry_days || 'N/A',
                renewalDate: user[0]?.expiry_date || 'N/A',
                remainingDays,
                limitPercent: Math.round(limitPercent),
            },
        } : {};

        // Render the subscription page
        res.render('subscription', {
            user: subscriptionData,
            plans: availablePlans,
        });
    } catch (err) {
        console.error('Error fetching subscription data:', err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (connection) await connection.end();
    }
};



exports.processPayment = async (req, res) => {
    const { plan, amount, transactionId } = req.body;
    let connection;
    try {
        connection = await connectDB();

        // Insert the initial transaction
        await connection.execute(
            `INSERT INTO transactions (user_id, plan, amount, transaction_id, status) VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, plan, amount, transactionId, 'pending']
        );

        // Simulate Paystack API payment verification
        const isPaymentValid = true; // Replace with actual Paystack verification logic.

        if (isPaymentValid) {
            // Update transaction and user's plan if payment is valid
            await connection.execute(
                `UPDATE transactions SET status = ? WHERE transaction_id = ?`,
                ['success', transactionId]
            );
            await connection.execute(
                `UPDATE users SET current_plan = ? WHERE id = ?`,
                [plan, req.user.id]
            );

            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Payment verification failed.' });
        }
    } catch (err) {
        console.error('Payment processing error:', err);
        res.status(500).json({ success: false, message: 'Server error occurred.' });
    } finally {
        if (connection) await connection.end();
    }
};
