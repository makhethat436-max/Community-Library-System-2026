
const express = require("express");
const router = express.Router();
const db = require("../config/db");

const {
    verifyToken,
    authorizeRoles
} = require("../middleware/auth");

// Get all books - all logged-in users
router.get("/", verifyToken, async (req, res) => {
    try {
        const [books] = await db.query(
            "SELECT * FROM books ORDER BY id DESC"
        );

        res.json(books);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error retrieving books."
        });
    }
});

// Add a new book - Admin and Librarian
router.post(
    "/",
    verifyToken,
    authorizeRoles("Admin", "Librarian"),
    async (req, res) => {
        try {
            const { title, author, genre, isbn, quantity } = req.body;

            const amount = Number(quantity);

            if (
                typeof title !== "string" ||
                !title.trim() ||
                typeof author !== "string" ||
                !author.trim() ||
                typeof isbn !== "string" ||
                !isbn.trim() ||
                String(quantity).trim() === "" ||
                !Number.isInteger(amount) ||
                amount < 0
            ) {
                return res.status(400).json({
                    message: "Please provide valid book details."
                });
            }

            const [result] = await db.query(
                `INSERT INTO books
                (title, author, genre, isbn, quantity)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    title.trim(),
                    author.trim(),
                    typeof genre === "string" ? genre.trim() : "",
                    isbn.trim(),
                    amount
                ]
            );

            res.status(201).json({
                message: "Book added successfully!",
                bookId: result.insertId
            });

        } catch (error) {
            console.error(error);

            if (error.code === "ER_DUP_ENTRY") {
                return res.status(400).json({
                    message: "This ISBN already exists."
                });
            }

            res.status(500).json({
                message: "Error adding book."
            });
        }
    }
);

// Update a book - Admin and Librarian
router.put(
    "/:id",
    verifyToken,
    authorizeRoles("Admin", "Librarian"),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { title, author, genre, isbn, quantity } = req.body;

            if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
                return res.status(400).json({
                    message: "Invalid book ID."
                });
            }

            const amount = Number(quantity);

            if (
                typeof title !== "string" ||
                !title.trim() ||
                typeof author !== "string" ||
                !author.trim() ||
                typeof isbn !== "string" ||
                !isbn.trim() ||
                String(quantity).trim() === "" ||
                !Number.isInteger(amount) ||
                amount < 0
            ) {
                return res.status(400).json({
                    message: "Please provide valid book details."
                });
            }

            const [result] = await db.query(
                `UPDATE books
                 SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ?
                 WHERE id = ?`,
                [
                    title.trim(),
                    author.trim(),
                    typeof genre === "string" ? genre.trim() : "",
                    isbn.trim(),
                    amount,
                    Number(id)
                ]
            );

            if (result.affectedRows === 0) {
                const [existing] = await db.query(
                    "SELECT id FROM books WHERE id = ?",
                    [Number(id)]
                );

                if (existing.length === 0) {
                    return res.status(404).json({
                        message: "Book not found."
                    });
                }
            }

            res.json({
                message: "Book updated successfully!"
            });

        } catch (error) {
            console.error(error);

            if (error.code === "ER_DUP_ENTRY") {
                return res.status(400).json({
                    message: "This ISBN already exists."
                });
            }

            res.status(500).json({
                message: "Error updating book."
            });
        }
    }
);

// Delete a book - Admin and Librarian
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("Admin", "Librarian"),
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
                return res.status(400).json({
                    message: "Invalid book ID."
                });
            }

            const [result] = await db.query(
                "DELETE FROM books WHERE id = ?",
                [Number(id)]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Book not found."
                });
            }

            res.json({
                message: "Book deleted successfully!"
            });

        } catch (error) {
            console.error(error);

            if (error.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(400).json({
                    message: "This book has transaction records and cannot be deleted."
                });
            }

            res.status(500).json({
                message: "Error deleting book."
            });
        }
    }
);

module.exports = router;
