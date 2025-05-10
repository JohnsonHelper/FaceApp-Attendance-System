const captureButton = document.getElementById("captureButton");
const errorDisplay = document.getElementById("errorDisplay");
const captureResult = document.getElementById("captureResult");
const video = document.getElementById("videoInput");
const nameInput = document.getElementById("nameInput");

// Access webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        errorDisplay.textContent = "❌ Cannot access webcam.";
        console.error("Webcam access error:", err);
    });

captureButton.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const timestamp = Date.now();

    if (!name) {
        errorDisplay.textContent = "❌ Please enter your name.";
        return;
    }

    // Capture current frame from video
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL("image/png");

    try {
        const response = await fetch("/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, timestamp, image: imageBase64 })
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error("Server error:", response.status, errorMessage);
            errorDisplay.textContent = `❌ Server error: ${response.status} - ${errorMessage}`;
            captureResult.textContent = "";
            return;
        }

        const result = await response.json();
        console.log("Server response:", result);
        if (result.success) {
            captureResult.textContent = "✅ Image successfully sent to dashboard!";
            errorDisplay.textContent = "";
            nameInput.value = "";
        } else {
            errorDisplay.textContent = result.message || "❌ Failed to send image.";
            captureResult.textContent = "";
        }
    } catch (err) {
        console.error("Upload failed:", err);
        errorDisplay.textContent = "❌ Network error. Please check your connection.";
        captureResult.textContent = "";
    }
});
