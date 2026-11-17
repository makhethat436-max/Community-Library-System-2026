
const db = require("./config/db");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function createAdmin() {
    rl.question("Enter a NEW admin password: ", async (password) => {
        try {
            if (!password || password.length < 6) {
                console.log("Password must have at least 6 characters.");
                return;
            }

            const [existing] = await db.query(
                "SELECT id FROM users WHERE membership_id = ?",
                ["ADMIN001"]
            );

            if (existing.length > 0) {
                console.log("ADMIN001 already exists.");
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await db.query(
                `INSERT INTO users
                (name, membership_id, role, password_hash)
                VALUES (?, ?, ?, ?)`,
                ["Mr Makhetha", "ADMIN001", "Admin", hashedPassword]
            );

            console.log("Administrator account created successfully!");

        } catch (error) {
            console.error("Error:", error.message);
        } finally {
            rl.close();
            await db.end();
        }
    });
}

createAdmin();
