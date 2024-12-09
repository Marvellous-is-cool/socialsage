function handleImageUpload(event, boxId) {
    const input = event.target;
    const preview = document.getElementById(`preview-${boxId}`);
    preview.innerHTML = ""; // Clear the preview box

    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.className = "img-fluid rounded";
            img.style.maxHeight = "100px";
            preview.appendChild(img);
        };

        reader.readAsDataURL(file);
    }
}
