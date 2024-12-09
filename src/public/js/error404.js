// Optional: Add dynamic effects such as additional animations or interactivity
document.addEventListener("DOMContentLoaded", () => {
    const errorCircle = document.querySelector('.error-circle');
    
    // Adding more animations or interactions can be done here, for example:
    errorCircle.addEventListener('animationiteration', () => {
        errorCircle.style.backgroundColor = '#1e90ff'; // Change color after each bounce
    });
});
