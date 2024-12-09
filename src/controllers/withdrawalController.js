const moment = require('moment-timezone'); // Use moment-timezone for timezone calculations

// Controller to handle withdrawal page access
exports.getWithdrawalPage = (req, res) => {
    const now = moment().tz('Africa/Lagos'); // Get the current time in Lagos timezone (WAT)

    // Calculate next Friday's withdrawal start time (Friday 12:00 AM)
    let withdrawalStart = moment().tz('Africa/Lagos').day(5).hour(0).minute(0).second(0); // Start of Friday at 12:00 AM

    // Calculate the end of the withdrawal window (Friday 11:59 PM)
    let withdrawalEnd = moment(withdrawalStart).endOf('day'); // End of Friday (11:59 PM)

    // Check if the current time is within the withdrawal window
    if (now.isBetween(withdrawalStart, withdrawalEnd, null, '[)')) {
        // If within withdrawal window, render the withdrawal page
        res.render('Withdrawal');
    } else {
        // If outside withdrawal window, redirect to the dashboard
        req.flash('error', 'Withdrawals are only available on Friday between 12:00 AM and 11:59 PM.');
        res.redirect('/dashboard');
    }
};
