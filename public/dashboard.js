document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("imageContainer");
  
    // Function to fetch and display images
    const loadImages = () => {
      fetch("/images")
        .then(res => res.json())
        .then(data => {
          container.innerHTML = ''; // Clear previous images
          if (data.success && data.files.length > 0) {
            data.files.forEach(file => {
              const wrapper = document.createElement("div");
              wrapper.style.marginBottom = "20px";
  
              const img = document.createElement("img");
              img.src = `/uploads/${file}`;
              img.alt = file;
              img.width = 200;
              img.style.display = "block";
              img.style.marginBottom = "5px";
  
              const parts = file.split('_');
              let timestampText = "Timestamp not found";
              if (parts.length >= 2) {
                const timestamp = parseInt(parts[parts.length - 1]);
                if (!isNaN(timestamp)) {
                  timestampText = new Date(timestamp).toLocaleString();
                }
              }
  
              const caption = document.createElement("p");
              caption.textContent = `File: ${file}`;
              caption.style.fontSize = "14px";
              caption.style.color = "#333";
              caption.style.marginBottom = "2px";
  
              const timeCaption = document.createElement("p");
              timeCaption.textContent = `Captured at: ${timestampText}`;
              timeCaption.style.fontSize = "12px";
              timeCaption.style.color = "#777";
  
              const deleteBtn = document.createElement("button");
              deleteBtn.textContent = "🗑️ Delete";
              deleteBtn.style.marginTop = "5px";
              deleteBtn.style.padding = "6px 12px";
              deleteBtn.style.backgroundColor = "#dc3545";
              deleteBtn.style.color = "white";
              deleteBtn.style.border = "none";
              deleteBtn.style.borderRadius = "4px";
              deleteBtn.style.cursor = "pointer";
  
              deleteBtn.addEventListener("click", () => {
                fetch(`/delete/${file}`, {
                  method: "DELETE"
                })
                .then(res => res.json())
                .then(result => {
                  if (result.success) {
                    wrapper.remove();
                  } else {
                    alert("❌ Failed to delete image.");
                  }
                })
                .catch(err => {
                  console.error("Delete error:", err);
                });
              });
  
              wrapper.appendChild(img);
              wrapper.appendChild(caption);
              wrapper.appendChild(timeCaption);
              wrapper.appendChild(deleteBtn);
              container.appendChild(wrapper);
            });
          } else {
            container.textContent = "No images uploaded yet.";
          }
        })
        .catch(err => {
          container.textContent = "❌ Error loading images.";
          console.error("Dashboard error:", err);
        });
    };
  
    // Check if password is correct
    const checkPassword = () => {
      const password = sessionStorage.getItem('dashboardAccess');
      if (password === 'granted') {
        loadImages();
      } else {
        window.location.href = 'dashboard.html'; // Redirect if not logged in
      }
    };
  
    checkPassword(); // Initial check when dashboard.js loads
  });
  