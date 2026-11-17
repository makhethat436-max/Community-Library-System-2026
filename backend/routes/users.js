
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

const allowedRoles = ["Admin", "Librarian", "Member"];

// LOGIN - Admin, Librarian and Member
router.post("/login", async (req, res) => {
    try {
        const { membership_id, password } = req.body;

        if (!membership_id || !password) {
            return res.status(400).json({
                message: "Please enter your membership ID and password."
            });
        }

        const [users] = await db.query(
            `SELECT id, name, membership_id, role, password_hash
             FROM users
             WHERE membership_id = ?`,
            [membership_id.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid membership ID or password."
            });
        }

        const user = users[0];

        if (!user.password_hash) {
            return res.status(401).json({
                message: "Invalid membership ID or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid membership ID or password."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                membership_id: user.membership_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            message: "Login successful!",
            token,
            user: {
                id: user.id,
                name: user.name,
                membership_id: user.membership_id,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Login failed. Please try again."
        });
    }
});

// GET OWN PROFILE - All logged-in users
router.get("/me", verifyToken, async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT id, name, membership_id, role, created_at
             FROM users
             WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.json(users[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error retrieving user."
        });
    }
});

// GET STAFF MEMBERS - Admin and Librarian only
router.get(
    "/staff",
    verifyToken,
    authorizeRoles("Admin", "Librarian"),
    async (req, res) => {
        try {
            const [staff] = await db.query(
                `SELECT id, name, role
                 FROM users
                 WHERE role IN ('Admin', 'Librarian')
                 ORDER BY name ASC`
            );

            res.json(staff);

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Error retrieving staff members."
            });
        }
    }
);

// USER MANAGEMENT - Admin only
router.use(verifyToken, authorizeRoles("Admin"));

// GET ALL USERS
router.get("/", async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT id, name, membership_id, role, created_at
             FROM users
             ORDER BY id DESC`
        );

        res.json(users);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error retrieving users."
        });
    }
});

// ADD USER
router.post("/", async (req, res) => {
    try {
        const { name, membership_id, role, password } = req.body;

        if (
            !name?.trim() ||
            !membership_id?.trim() ||
            !password ||
            password.length < 6 ||
            !allowedRoles.includes(role)
        ) {
            return res.status(400).json({
                message: "Please provide valid user details."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO users
            (name, membership_id, role, password_hash)
            VALUES (?, ?, ?, ?)`,
            [
                name.trim(),
                membership_id.trim(),
                role,
                hashedPassword
            ]
        );

        res.status(201).json({
            message: "User added successfully!",
            userId: result.insertId
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "Membership ID already exists."
            });
        }

        res.status(500).json({
            message: "Error adding user."
        });
    }
});

// UPDATE USER
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, membership_id, role, password } = req.body;

        if (
            !Number.isInteger(Number(id)) ||
            Number(id) <= 0 ||
            !name?.trim() ||
            !membership_id?.trim() ||
            !allowedRoles.includes(role)
        ) {
            return res.status(400).json({
                message: "Please provide valid user details."
            });
        }

        if (password && password.length < 6) {
            return res.status(400).json({
                message: "Password must have at least 6 characters."
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM users WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);

            await db.query(
                `UPDATE users
                 SET name = ?, membership_id = ?, role = ?, password_hash = ?
                 WHERE id = ?`,
                [name.trim(), membership_id.trim(), role, hashedPassword, id]
            );

        } else {
            await db.query(
                `UPDATE users
                 SET name = ?, membership_id = ?, role = ?
                 WHERE id = ?`,
                [name.trim(), membership_id.trim(), role, id]
            );
        }

        res.json({
            message: "User updated successfully!"
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "Membership ID already exists."
            });
        }

        res.status(500).json({
            message: "Error updating user."
        });
    }
});

// DELETE USER
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "User not found."
            });
        }

        const [result] = await db.query(
            "DELETE FROM users WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.json({
            message: "User deleted successfully!"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error deleting user."
        });
    }
});

module.exports = router;
