document.getElementById('subscriptionForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const token = localStorage.getItem('token'); // Fetch the token for authorization

    try {
        // Sending data to the backend
        const response = await fetch('http://localhost:3000/api/subscription', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const result = await response.json();
        alert(result.message);

        if (result.success) {
            window.location.href = 'dashboard.html'; // Redirect to dashboard after successful payment
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing your subscription. Please try again.');
    }
});