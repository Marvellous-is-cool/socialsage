const { connectDB } = require("../config/database");

// Get the user's profile
exports.getProfile = async (req, res) => {
  const username = req.user.username;

  try {
    const connection = await connectDB();

    // Fetch user data including current plan
    const [userResults] = await connection.execute(
      'SELECT *, wallet, current_plan FROM users WHERE username = ?',
      [username]
    );

    if (userResults.length === 0) {
      req.flash('error', 'User not found.');
      return res.redirect('/');
    }

    const user = userResults[0];

    // Fetch user's subscription expiry date
    const [subscriptionResults] = await connection.execute(
      'SELECT expiry_date FROM subscriptions WHERE user_id = ?',
      [user.id]
    );

    const planExpiryDate = subscriptionResults.length > 0
      ? subscriptionResults[0].expiry_date
      : null;

    // Fetch user's past tasks through submissions table
    const [taskResults] = await connection.execute(
      `SELECT tasks.id AS task_id, tasks.task_name, tasks.task_price, tasks.updated_on, 
              submissions.approval_status, submissions.created_at AS submission_date
       FROM submissions
       JOIN tasks ON tasks.id = submissions.submitted_task_id
       WHERE submissions.user_id = ? AND submissions.approval_status IN (?, ?) 
       ORDER BY submissions.created_at DESC`,
      [user.id, 'pending', 'approved'] // Updated statuses
    );

    // Fetch referrals with subscription status and joined date
    const [referralsResults] = await connection.execute(
      `SELECT 
        referrals.referred_user_id, 
        referrals.referralCode, 
        referrals.joined_date, 
        users.username AS referred_username, 
        users.current_plan AS referred_user_plan,
        IFNULL(subscriptions.expiry_date, 'No Subscription') AS subscription_status
       FROM referrals
       LEFT JOIN users ON referrals.referred_user_id = users.id
       LEFT JOIN subscriptions ON referrals.referred_user_id = subscriptions.user_id
       WHERE referrals.referredBy = ?`,
      [user.id]
    );

    // Modify referralsResults to include bonus eligibility based on plan and expiry date
    const updatedReferralsResults = referralsResults.map(referral => {
      const referredUserExpiryDate = referral.subscription_status !== 'No Subscription'
        ? new Date(referral.subscription_status)
        : null;

      // Check if the referred user is on a paid plan (basic, premium, or gold)
      const isPaidPlan = ['basic', 'premium', 'gold'].includes(referral.referred_user_plan);
      
      // Check bonus eligibility: referred user is on a paid plan and subscription is still active
      const isBonusEligible = isPaidPlan && referredUserExpiryDate && referredUserExpiryDate > new Date();
      
      return {
        ...referral,
        bonusEligible: isBonusEligible
      };
    });

    // Fetch user's transaction history
    const [transactionResults] = await connection.execute(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );

    // Get flash messages
    const successMessages = req.flash('success');
    const errorMessages = req.flash('error');

    console.log(user.wallet)

    // Render profile view
    res.render('profile', {
      user,
      currentPlan: user.current_plan, // Pass current plan
      planExpiryDate: planExpiryDate || 'Not Available',
      tasks: taskResults,
      balance: user.wallet,
      transactions: transactionResults,
      referrals: updatedReferralsResults, // Updated referrals with bonus eligibility
      success_message: successMessages, // Pass success messages
      error_message: errorMessages // Pass error messages
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
};

// Update user's profile (First Name, Last Name, etc.)
exports.updateProfile = async (req, res) => {
  const { username } = req.user;
  const { firstName, lastName, email, phone } = req.body;

  const updates = [];
  const values = [];

  if (firstName) updates.push('first_name = ?'), values.push(firstName);
  if (lastName) updates.push('last_name = ?'), values.push(lastName);
  if (email) updates.push('email = ?'), values.push(email);
  if (phone) updates.push('phone = ?'), values.push(phone);

  if (updates.length === 0) {
    req.flash('error', 'At least one field must be updated.');
    return res.status(400).json({ error: 'At least one field must be updated.' });
  }

  values.push(username);

  try {
    const connection = await connectDB();
    const query = `UPDATE users SET ${updates.join(', ')} WHERE username = ?`;
    const [rows] = await connection.execute(query, values);

    if (rows.affectedRows === 0) {
      req.flash('error', 'User not found.');
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.flash('success', 'Profile updated successfully');
    res.json({ success: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error during profile update:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user's avatar
exports.updateAvatar = async (req, res) => {
  const { username } = req.user;

  if (!username) {
    return res.status(400).json({ error: 'Username is missing or invalid.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No avatar file uploaded' });
  }

  const avatarPath = `/uploads/avatars/${req.file.filename}`;

  try {
    const connection = await connectDB();
    const [rows] = await connection.execute(
      `UPDATE users SET avatar = ? WHERE username = ?`,
      [avatarPath, username]
    );

    if (rows.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.flash('success', 'Avatar updated successfully.');
    res.json({ success: 'Avatar updated successfully', avatarPath: avatarPath });
  } catch (err) {
    console.error('Error during avatar update:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

