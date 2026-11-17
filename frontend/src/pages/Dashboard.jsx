
import { useEffect, useState } from "react";

function Dashboard() {
  const API_URL = "http://127.0.0.1:5000/api";

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "null"
  );

  const role = currentUser?.role;

  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const requests = [
          fetch(`${API_URL}/books`, {
            headers,
            cache: "no-store"
          }),
          fetch(`${API_URL}/transactions`, {
            headers,
            cache: "no-store"
          })
        ];

        if (role === "Admin") {
          requests.push(
            fetch(`${API_URL}/users`, {
              headers,
              cache: "no-store"
            })
          );
        }

        const responses = await Promise.all(requests);

        if (responses.some(response => !response.ok)) {
          throw new Error("Could not load dashboard information.");
        }

        const booksData = await responses[0].json();
        const transactionsData = await responses[1].json();

        if (!Array.isArray(booksData)) {
          throw new Error("Invalid book information received.");
        }

        setBooks(booksData);
        setTransactions(
          Array.isArray(transactionsData) ? transactionsData : []
        );

        if (role === "Admin") {
          const usersData = await responses[2].json();
          setUsers(Array.isArray(usersData) ? usersData : []);
        }

      } catch (err) {
        setError(
          err.message || "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [role]);

  // Calculate total copies
  const totalBooks = books.reduce(
    (total, book) => {
      const quantity = Number(book.quantity);

      return total + (
        Number.isFinite(quantity) && quantity >= 0
          ? quantity
          : 0
      );
    },
    0
  );

  // Calculate books with fewer than two copies
  const lowStockBooks = books.filter(book => {
    const quantity = Number(book.quantity);

    return (
      Number.isFinite(quantity) &&
      quantity >= 0 &&
      quantity < 2
    );
  });

  const availableBooks = books.filter(
    book => Number(book.quantity) > 0
  ).length;

  const recentTransactions = [...transactions]
    .slice(-5)
    .reverse();

  if (loading) {
    return (
      <div className="dashboard-message">
        Loading dashboard information...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard">

      <div className="dashboard-heading">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome, {currentUser?.name || "User"}.
            {" "}You are logged in as {role}.
          </p>
        </div>
      </div>

      {/* MEMBER DASHBOARD */}

      {role === "Member" ? (

        <>
          <div className="dashboard-cards">

            <div className="dashboard-card">
              <span className="dashboard-card-label">
                Total Books
              </span>
              <h2>{totalBooks}</h2>
              <p>Copies in the library</p>
            </div>

            <div className="dashboard-card">
              <span className="dashboard-card-label">
                Book Titles
              </span>
              <h2>{books.length}</h2>
              <p>Different book titles</p>
            </div>

            <div className="dashboard-card">
              <span className="dashboard-card-label">
                Available Titles
              </span>
              <h2>{availableBooks}</h2>
              <p>Titles currently in stock</p>
            </div>

          </div>

          <section className="dashboard-section">

            <div className="section-heading">
              <div>
                <h3>Book Availability</h3>
                <p>
                  View books currently available in the library.
                </p>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Genre</th>
                    <th>Availability</th>
                  </tr>
                </thead>

                <tbody>
                  {books.map(book => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.genre}</td>
                      <td>
                        <span
                          className={`dashboard-status ${
                            Number(book.quantity) > 0
                              ? "available"
                              : "low"
                          }`}
                        >
                          {Number(book.quantity) > 0
                            ? "Available"
                            : "Out of Stock"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {books.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty-message">
                        No books found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </section>
        </>

      ) : (

        <>
          {/* ADMIN AND LIBRARIAN DASHBOARD */}

          <div className="dashboard-cards">

            <div className="dashboard-card">
              <span className="dashboard-card-label">
                Total Books
              </span>
              <h2>{totalBooks}</h2>
              <p>Copies in the library</p>
            </div>

            <div className="dashboard-card">
              <span className="dashboard-card-label">
                Book Titles
              </span>
              <h2>{books.length}</h2>
              <p>Different book titles</p>
            </div>

            {role === "Admin" && (
              <div className="dashboard-card">
                <span className="dashboard-card-label">
                  Registered Users
                </span>
                <h2>{users.length}</h2>
                <p>Library members and staff</p>
              </div>
            )}

            <div className="dashboard-card">
              <span className="dashboard-card-label">
                Transactions
              </span>
              <h2>{transactions.length}</h2>
              <p>Recorded library activities</p>
            </div>

          </div>

          {/* LOW STOCK ALERT */}

          <section className="dashboard-section">

            <div className="section-heading">
              <div>
                <h3>Low Stock Alert</h3>
                <p>
                  Books with fewer than two copies available.
                </p>
              </div>

              <span className="stock-count">
                {lowStockBooks.length} alerts
              </span>
            </div>

            {lowStockBooks.length === 0 ? (
              <p className="empty-message">
                All books have sufficient stock.
              </p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Author</th>
                      <th>Quantity Remaining</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {lowStockBooks.map(book => (
                      <tr className="low-stock-row" key={book.id}>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{book.quantity}</td>
                        <td>
                          <span className="dashboard-status low">
                            {Number(book.quantity) === 0
                              ? "Out of Stock"
                              : "Low Stock"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </section>

          {/* BOOK AVAILABILITY */}

          <section className="dashboard-section">

            <div className="section-heading">
              <div>
                <h3>Book Availability</h3>
                <p>
                  Current stock information for all books.
                </p>
              </div>

              <span className="availability-count">
                {availableBooks} titles available
              </span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Genre</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {books.map(book => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.genre}</td>
                      <td>{book.quantity}</td>
                      <td>
                        <span
                          className={`dashboard-status ${
                            Number(book.quantity) > 0
                              ? "available"
                              : "low"
                          }`}
                        >
                          {Number(book.quantity) > 0
                            ? "Available"
                            : "Out of Stock"}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {books.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-message">
                        No books found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </section>

          {/* RECENT TRANSACTIONS */}

          <section className="dashboard-section">

            <div className="section-heading">
              <div>
                <h3>Recent Transactions</h3>
                <p>
                  Your latest five recorded transactions.
                </p>
              </div>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="empty-message">
                No transactions have been recorded yet.
              </p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Book</th>
                      <th>Borrower</th>
                      <th>Approved By</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentTransactions.map((transaction, index) => (
                      <tr key={transaction.id || index}>
                        <td>{transaction.transaction_type}</td>
                        <td>{transaction.book_title}</td>
                        <td>{transaction.borrower_name || "N/A"}</td>
                        <td>{transaction.staff_name || "N/A"}</td>
                        <td>{transaction.transaction_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </section>

        </>

      )}

    </div>
  );
}

export default Dashboard;
