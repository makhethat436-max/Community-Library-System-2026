
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

// Get all transactions
router.get("/", verifyToken, async (req, res) => {
    try {
        const [transactions] = await db.query(`
            SELECT
                t.id,
                t.book_id,
                t.user_id,
                t.borrower_name,
                t.transaction_type,
                t.quantity,
                t.transaction_date,
                b.title AS book_title,
                u.name AS staff_name
            FROM transactions t
            LEFT JOIN books b ON t.book_id = b.id
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY t.transaction_date DESC
        `);

        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error retrieving transactions."
        });
    }
});

// Add a transaction
router.post("/", verifyToken, authorizeRoles("Admin", "Librarian"), async (req, res) => {
    let connection;

    try {
        const {
            book_id,
            user_id,
            borrower_name,
            transaction_type,
            quantity
        } = req.body;

        const allowedTypes = ["Borrow", "Return", "Add Stock"];
        const amount = Number(quantity);
        const bookId = Number(book_id);
        const staffId = Number(user_id);

        if (
            !Number.isInteger(bookId) ||
            bookId <= 0 ||
            !Number.isInteger(staffId) ||
            staffId <= 0 ||
            !Number.isInteger(amount) ||
            amount <= 0 ||
            !allowedTypes.includes(transaction_type)
        ) {
            return res.status(400).json({
                message: "Please provide valid transaction details."
            });
        }

        if (
            transaction_type !== "Add Stock" &&
            (typeof borrower_name !== "string" || !borrower_name.trim())
        ) {
            return res.status(400).json({
                message: "Please enter the borrower's name."
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Check staff member
        const [staff] = await connection.query(
            "SELECT id, role FROM users WHERE id = ?",
            [staffId]
        );

        if (
            staff.length === 0 ||
            !["Admin", "Librarian"].includes(staff[0].role)
        ) {
            await connection.rollback();
            return res.status(400).json({
                message: "Selected user is not an Admin or Librarian."
            });
        }

        // Find and lock book
        const [books] = await connection.query(
            "SELECT * FROM books WHERE id = ? FOR UPDATE",
            [bookId]
        );

        if (books.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: "Book not found."
            });
        }

        const book = books[0];

        if (transaction_type === "Borrow") {
            if (book.quantity < amount) {
                await connection.rollback();
                return res.status(400).json({
                    message: "Not enough books available."
                });
            }

            await connection.query(
                "UPDATE books SET quantity = quantity - ? WHERE id = ?",
                [amount, bookId]
            );
        }

        if (transaction_type === "Return") {
            const [borrowed] = await connection.query(
                `SELECT COALESCE(SUM(
                    CASE
                        WHEN transaction_type = 'Borrow' THEN quantity
                        WHEN transaction_type = 'Return' THEN -quantity
                        ELSE 0
                    END
                ), 0) AS outstanding
                FROM transactions
                WHERE book_id = ? AND borrower_name = ?`,
                [bookId, borrower_name.trim()]
            );

            if (Number(borrowed[0].outstanding) < amount) {
                await connection.rollback();
                return res.status(400).json({
                    message: "This borrower has not borrowed that many copies."
                });
            }

            await connection.query(
                "UPDATE books SET quantity = quantity + ? WHERE id = ?",
                [amount, bookId]
            );
        }

        if (transaction_type === "Add Stock") {
            await connection.query(
                "UPDATE books SET quantity = quantity + ? WHERE id = ?",
                [amount, bookId]
            );
        }

        // Save transaction
        await connection.query(
            `INSERT INTO transactions
            (book_id, user_id, borrower_name, transaction_type, quantity)
            VALUES (?, ?, ?, ?, ?)`,
            [
                bookId,
                staffId,
                transaction_type === "Add Stock" ? null : borrower_name.trim(),
                transaction_type,
                amount
            ]
        );

        await connection.commit();

        res.status(201).json({
            message: "Transaction completed successfully!"
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error(error);
        res.status(500).json({
            message: "Error processing transaction."
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
