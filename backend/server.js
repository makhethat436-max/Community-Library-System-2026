require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const booksRoutes = require("./routes/books");
const usersRoutes = require("./routes/users");
const transactionsRoutes = require("./routes/transactions");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/books", booksRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/transactions", transactionsRoutes);
// Test the backend
app.get("/", (req, res) => {
    res.send("Community Library System API is running!");
});

// Test the database
app.get("/test-db", async (req, res) => {
    try {
        await db.query("SELECT 1");
        res.json({
            message: "MySQL database connected successfully!"
        });
    } catch (error) {
        console.error("DATABASE ERROR:", error);
        res.status(500).json({
            message: "Database connection failed.",
            error: error.code || error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});