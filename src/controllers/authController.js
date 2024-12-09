const { connectDB } = require("../config/database");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // For password hashing

exports.register = async (req, res) => {
    const { username, email, password, referralCode } = req.body;
    console.log("Registration data received:", req.body);

    // Input validation
    if (!username || !email || !password) {
        req.flash("error", "All fields are required.");
        return res.redirect("/signup");
    }

    const pool = await connectDB(); // Get the database pool

    // Get a connection from the pool
    const connection = await pool.getConnection();
    await connection.beginTransaction(); // Start transaction

    try {
        // Check if username or email already exists
        const [existingUsers] = await connection.execute(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            [username, email]
        );

        if (existingUsers.length > 0) {
            req.flash("error", "Username or email is already in use.");
            return res.redirect("/signup");
        }

        // Check if referralCode exists
        let referredBy = null;
        if (referralCode) {
            const [referralResults] = await connection.execute(
                "SELECT id FROM users WHERE referral_code = ?",
                [referralCode]
            );

            if (referralResults.length === 0) {
                req.flash("error", "Invalid referral code.");
                return res.redirect("/signup");
            }
            referredBy = referralResults[0].id;
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user with default free plan and username as referral_code
        const [userResults] = await connection.execute(
            "INSERT INTO users (username, email, password, referral_code) VALUES (?, ?, ?, ?)",
            [username, email, hashedPassword, username]
        );

        const userId = userResults.insertId;

        // If referredBy exists, create referral entry
        if (referredBy) {
            await connection.execute(
                "INSERT INTO referrals (referralCode, referredBy, referred_user_id, subscription_status) VALUES (?, ?, ?, ?)",
                [referralCode, referredBy, userId, "no"]
            );
        }

        await connection.commit();
        console.log("User registered successfully!");
        req.flash("success", "Registration successful! You can now log in.");
        return res.redirect("/login");
    } catch (err) {
        console.error("Error during registration:", err.message || err);
        await connection.rollback(); // Rollback transaction in case of error
        req.flash("error", "Registration failed. Please try again.");
        return res.redirect("/signup");
    } finally {
        connection.release(); // Release the connection back to the pool
    }
};


// User login
exports.login = async (req, res) => {
    const { username, password } = req.body;

    console.log("Login attempt for user:", username);

    // Validate username and password
    if (!username || !password) {
        req.flash('error', 'Username and password are required.'); // Flash error message
        return res.redirect("/login");
    }

    const sql = 'SELECT * FROM users WHERE username = ?';  // Only fetch user by username
    try {
        const connection = await connectDB(); // Establish the database connection
        const [results] = await connection.execute(sql, [username]);

        if (results.length === 0) {
            req.flash('error', 'Invalid username or password.'); // Flash error message
            return res.redirect("/login");
        }

        const user = results[0];

        // Compare the entered password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            req.flash('error', 'Invalid username or password.'); // Flash error message
            return res.redirect("/login");
        }

        // If the password is valid, generate a JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '1h' }
        );

        console.log("User logged in successfully:", username);

        // Set token in a cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // 1 hour
        });

        req.flash('success', `Welcome back, ${user.username}!`); // Flash success message
        return res.redirect('/dashboard');
    } catch (err) {
        console.error("Error during login:", err.message || err);
        req.flash('error', 'An error occurred while logging in. Please try again.'); // Flash error message
        return res.redirect("/login");
    }
};

// User logout
exports.logout = (req, res) => {
    res.clearCookie('token');
    req.flash('success', 'You have been logged out successfully.'); // Flash success message
    return res.redirect('/login');
};
