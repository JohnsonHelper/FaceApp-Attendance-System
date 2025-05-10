const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.static("public"));
app.use("/uploads", express.static(UPLOADS_DIR));

// Ensure uploads directory exists
async function ensureUploadDirExists() {
    try {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
        console.log(`✅ Uploads directory created or already exists at: ${UPLOADS_DIR}`);
    } catch (error) {
        console.error("❌ Error creating uploads directory:", error);
        process.exit(1);
    }
}
ensureUploadDirExists();

// POST route to receive image
app.post("/upload", async (req, res) => {
    const { name, timestamp, image } = req.body;

    if (!name || !timestamp || !image) {
        return res.status(400).json({ success: false, message: "Missing data" });
    }

    try {
        const base64Data = image.replace(/^data:image\/png;base64,/, "");
        const filename = `${name}_${timestamp}.png`;
        const filePath = path.join(UPLOADS_DIR, filename);

        await fs.writeFile(filePath, base64Data, "base64");
        console.log(`✅ Image saved successfully: ${filename}`);
        res.status(200).json({ success: true, filename });
    } catch (error) {
        console.error("❌ Error saving image:", error);
        res.status(500).json({ success: false, message: "Error saving image" });
    }
});

// GET route to list images
app.get("/images", async (req, res) => {
    try {
        const files = await fs.readdir(UPLOADS_DIR);
        res.status(200).json({ success: true, files });
    } catch (error) {
        console.error("❌ Error reading images:", error);
        res.status(500).json({ success: false, message: "Error reading images" });
    }
});

// ✅ DELETE route to delete an image
app.delete("/delete/:filename", async (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOADS_DIR, filename);

    try {
        await fs.unlink(filePath);
        console.log(`🗑️ Image deleted: ${filename}`);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("❌ Error deleting image:", error);
        res.status(500).json({ success: false, message: "Failed to delete image" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
