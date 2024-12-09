document.addEventListener("DOMContentLoaded", () => {

    // JavaScript for handling sidebar navigation
    const menuItems = document.querySelectorAll("#menu li");
    const sections = document.querySelectorAll(".section");
  
    menuItems.forEach(item => {
      item.addEventListener("click", () => {
        // Remove active class from all menu items and sections
        menuItems.forEach(menu => menu.classList.remove("active"));
        sections.forEach(section => section.classList.remove("active"));
  
        // Add active class to the clicked item and corresponding section
        item.classList.add("active");
        const sectionId = item.getAttribute("data-section");
        document.getElementById(sectionId).classList.add("active");
      });
    });
   
       // JavaScript for avatar preview
       function previewAvatar(event) {
         const avatar = document.getElementById('profile-avatar');
         const file = event.target.files[0];
         if (file) {
           const reader = new FileReader();
           reader.onload = function (e) {
             avatar.src = e.target.result;
           };
           reader.readAsDataURL(file);
         }
       }
   
       // Redirect to withdrawal page on button click
       document.querySelector('.withdraw-button').addEventListener('click', () => {
           window.location.href = '/withdraw';
       });
   
       // Redirect to payment page on button click
       document.querySelector('.update-account').addEventListener('click', () => {
           window.location.href = '/subscription';
       });
   
       // Redirect to logout on button click
       document.querySelector('.logout').addEventListener('click', () => {
           window.location.href = '/logout';
       });
   

    const expiryDate = new Date("2024-12-31T23:59:59"); // Set plan expiry date
    const countdownElement = document.getElementById("countdown-timer");
  
    function updateCountdown() {
      const now = new Date();
      const timeDifference = expiryDate - now;
  
      if (timeDifference <= 0) {
        countdownElement.textContent = "Expired";
        return;
      }
  
      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
  
      countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
  
    updateCountdown(); // Initial call
    setInterval(updateCountdown, 1000); // Update every second

// wallet
    // Dummy transactions
  const transactions = [
    { type: "Completed Task", source: "Design Project", amount: 5000 },
    { type: "Referral Bonus", source: "John Doe", amount: 2500 },
    { type: "Bonus", source: "Weekly Achievement", amount: 1000 },
    { type: "Withdrawal", source: "", amount: -3000 },
  ];

  // Calculate balance
  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);
  document.getElementById("available-balance").textContent = `N${totalBalance}`;


//   referrals
function copyReferralCode() {
    const referralCode = document.getElementById("referral-code").textContent;
    navigator.clipboard.writeText(referralCode).then(() => {
      alert("Referral code copied to clipboard!");
    });
  }
  
    const referrals = [
      { name: "John Doe", status: "Subscribed", earnings: 3000 },
      { name: "Jane Smith", status: "Pending", earnings: 0 },
      { name: "Michael Lee", status: "Subscribed", earnings: 3000 },
    ];
  
    const totalReferrals = referrals.length;
    const subscribedReferrals = referrals.filter(r => r.status === "Subscribed").length;
    const totalEarnings = referrals.reduce((sum, r) => sum + r.earnings, 0);
  
    // Update stats
    document.getElementById("total-referrals").textContent = totalReferrals;
    document.getElementById("subscribed-referrals").textContent = subscribedReferrals;
    document.getElementById("total-referrals-summary").textContent = totalReferrals;
    document.getElementById("total-earnings").textContent = `N${totalEarnings}`;
  });
  