
import { useEffect, useState } from "react";

function Transactions() {
  const API_URL = "http://127.0.0.1:5000/api/transactions";
  const BOOKS_URL = "http://127.0.0.1:5000/api/books";
  const USERS_URL = "http://127.0.0.1:5000/api/users/staff";

  const [transactions, setTransactions] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);

  const [bookId, setBookId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [borrowerName, setBorrowerName] = useState("");
  const [type, setType] = useState("Borrow");
  const [quantity, setQuantity] = useState(1);
  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  const loadData = async () => {
    try {
      const [transactionResponse, bookResponse, userResponse] =
        await Promise.all([
          fetch(API_URL, { headers }),
          fetch(BOOKS_URL, { headers }),
          fetch(USERS_URL, { headers })
        ]);

      const transactionData = await transactionResponse.json();
      const bookData = await bookResponse.json();
      const userData = await userResponse.json();

      if (
        !transactionResponse.ok ||
        !bookResponse.ok ||
        !userResponse.ok
      ) {
        throw new Error("Could not load transaction information.");
      }

      setTransactions(transactionData);
      setBooks(bookData);
      setUsers(userData);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveTransaction = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!bookId || !staffId) {
      setError("Please select a book and approving staff member.");
      return;
    }

    if (
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 1
    ) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (type !== "Add Stock" && !borrowerName.trim()) {
      setError("Please enter the borrower's name.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          book_id: Number(bookId),
          user_id: Number(staffId),
          borrower_name:
            type === "Add Stock" ? null : borrowerName.trim(),
          transaction_type: type,
          quantity: Number(quantity)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Transaction failed.");
      }

      setMessage("Transaction completed successfully.");

      setBookId("");
      setStaffId("");
      setBorrowerName("");
      setQuantity(1);

      await loadData();
    } catch (err) {
      setError(err.message || "Unable to complete transaction.");
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const searchText = search.toLowerCase();

    return (
      (transaction.book_title || "").toLowerCase().includes(searchText) ||
      (transaction.borrower_name || "").toLowerCase().includes(searchText) ||
      (transaction.staff_name || "").toLowerCase().includes(searchText) ||
      (transaction.transaction_type || "").toLowerCase().includes(searchText)
    );
  });

  const borrowedCount = transactions
    .filter((item) => item.transaction_type === "Borrow")
    .reduce((total, item) => total + Number(item.quantity || 0), 0);

  const returnedCount = transactions
    .filter((item) => item.transaction_type === "Return")
    .reduce((total, item) => total + Number(item.quantity || 0), 0);

  const stockAdded = transactions
    .filter((item) => item.transaction_type === "Add Stock")
    .reduce((total, item) => total + Number(item.quantity || 0), 0);

  const formatDate = (date) => {
    if (!date) return "N/A";

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) return "N/A";

    return formattedDate.toLocaleDateString();
  };

  const staffMembers = users.filter(
    (user) => user.role === "Admin" || user.role === "Librarian"
  );

  return (
    <div className="transactions-page">

      <div className="transactions-heading">
        <h1>Transactions</h1>
        <p>Manage book borrowing, returns and new stock.</p>
      </div>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="transaction-summary">

        <div className="transaction-summary-card">
          <span>Total Transactions</span>
          <h2>{transactions.length}</h2>
        </div>

        <div className="transaction-summary-card">
          <span>Books Borrowed</span>
          <h2>{borrowedCount}</h2>
        </div>

        <div className="transaction-summary-card">
          <span>Books Returned</span>
          <h2>{returnedCount}</h2>
        </div>

        <div className="transaction-summary-card">
          <span>Stock Added</span>
          <h2>{stockAdded}</h2>
        </div>

      </div>

      <section className="transaction-form-section">

        <div className="transaction-section-heading">
          <h3>New Transaction</h3>
          <p>Enter the transaction details below.</p>
        </div>

        <form className="transaction-form" onSubmit={saveTransaction}>

          <div className="transaction-form-grid">

            <div className="field">
              <label>Book</label>

              <select
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                required
              >
                <option value="">Select a book</option>

                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} (Available: {book.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Transaction Type</label>

              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setBorrowerName("");
                }}
              >
                <option value="Borrow">Borrow</option>
                <option value="Return">Return</option>
                <option value="Add Stock">Add Stock</option>
              </select>
            </div>

            {type !== "Add Stock" && (
              <div className="field">
                <label>Borrower's Name</label>

                <input
                  type="text"
                  placeholder="Enter borrower's full name"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="field">
              <label>Approving Staff Member</label>

              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                required
              >
                <option value="">Select Admin or Librarian</option>

                {staffMembers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Quantity</label>

              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

          </div>

          <div className="transaction-form-actions">
            <button type="submit" className="primary-btn">
              Complete Transaction
            </button>
          </div>

        </form>
      </section>

      <section className="transaction-history">

        <div className="transaction-history-heading">
          <div>
            <h3>Transaction History</h3>
            <p>View borrowers and the staff who approved transactions.</p>
          </div>

          <input
            type="text"
            className="transaction-search"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Borrower</th>
                <th>Approved By</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.book_title || "N/A"}</td>

                  <td>{transaction.borrower_name || "N/A"}</td>

                  <td>{transaction.staff_name || "N/A"}</td>

                  <td>
                    <span
                      className={`transaction-type ${
                        transaction.transaction_type === "Borrow"
                          ? "borrow-type"
                          : transaction.transaction_type === "Return"
                          ? "return-type"
                          : "stock-type"
                      }`}
                    >
                      {transaction.transaction_type || "N/A"}
                    </span>
                  </td>

                  <td>{transaction.quantity}</td>

                  <td>{formatDate(transaction.transaction_date)}</td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-message">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="transaction-total">
          Showing {filteredTransactions.length} transaction(s)
        </p>

      </section>
    </div>
  );
}

export default Transactions;
