const { connectDB } = require("../config/database");

// Get referrals
exports.getReferrals = async (req, res) => {
    const sql = 'SELECT * FROM referrals WHERE referredBy = ?';

    try {
        const connection = await connectDB();  // Establish the database connection
        // Await the result of the query
        const [results] = await connection.execute(sql, [req.user.id]);
        res.status(200).json({ referrals: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching referrals' });
    }
};
