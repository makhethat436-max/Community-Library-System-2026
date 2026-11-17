
import { useEffect, useState } from "react";

function Books() {
  const API_URL = "http://127.0.0.1:5000/api/books";

  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [isbn, setIsbn] = useState("");
  const [quantity, setQuantity] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  const loadBooks = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load books.");
      }

      setBooks(data);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const clearForm = () => {
    setTitle("");
    setAuthor("");
    setGenre("");
    setIsbn("");
    setQuantity("");
    setEditId(null);
  };

  const saveBook = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const book = {
      title,
      author,
      genre,
      isbn,
      quantity: Number(quantity)
    };

    try {
      const response = await fetch(
        editId ? `${API_URL}/${editId}` : API_URL,
        {
          method: editId ? "PUT" : "POST",
          headers,
          body: JSON.stringify(book)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save book.");
      }

      setMessage(
        editId
          ? "Book updated successfully."
          : "Book added successfully."
      );

      clearForm();
      await loadBooks();
    } catch (err) {
      setError(err.message || "Unable to save book.");
    }
  };

  const editBook = (book) => {
    setTitle(book.title);
    setAuthor(book.author);
    setGenre(book.genre || "");
    setIsbn(book.isbn);
    setQuantity(book.quantity);
    setEditId(book.id);
    setMessage("");
    setError("");
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete book.");
      }

      setMessage("Book deleted successfully.");

      if (editId === id) {
        clearForm();
      }

      await loadBooks();
    } catch (err) {
      setError(err.message || "Unable to delete book.");
    }
  };

  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author} ${book.isbn} ${book.genre || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalCopies = books.reduce(
    (total, book) => total + Number(book.quantity || 0),
    0
  );

  const lowStock = books.filter(
    (book) => Number(book.quantity) < 2
  ).length;

  return (
    <div className="books-page">

      {/* PAGE HEADING */}

      <div className="books-heading">
        <div>
          <h1>Manage Books</h1>
          <p>Add, update, search and manage library books.</p>
        </div>
      </div>

      {/* MESSAGES */}

      {message && (
        <div className="success-message">{message}</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* BOOK SUMMARY */}

      <div className="book-summary">

        <div className="book-summary-card">
          <span>Total Book Titles</span>
          <h2>{books.length}</h2>
        </div>

        <div className="book-summary-card">
          <span>Total Copies</span>
          <h2>{totalCopies}</h2>
        </div>

        <div className="book-summary-card">
          <span>Low Stock Books</span>
          <h2 className="low-number">{lowStock}</h2>
        </div>

      </div>

      {/* ADD OR UPDATE BOOK FORM */}

      <section className="book-form-section">
        <div className="books-section-heading">
          <div>
            <h3>{editId ? "Update Book" : "Add New Book"}</h3>
            <p>
              {editId
                ? "Edit the selected book information."
                : "Enter the details of the new book."}
            </p>
          </div>
        </div>

        <form className="book-form" onSubmit={saveBook}>

          <div className="book-form-grid">

            <div className="field">
              <label>Book Title</label>
              <input
                type="text"
                placeholder="Enter book title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Author</label>
              <input
                type="text"
                placeholder="Enter author name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Genre</label>
              <input
                type="text"
                placeholder="Enter book genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>

            <div className="field">
              <label>ISBN</label>
              <input
                type="text"
                placeholder="Enter ISBN"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Quantity</label>
              <input
                type="number"
                placeholder="Enter quantity"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

          </div>

          <div className="book-form-actions">
            <button type="submit" className="btn primary">
              {editId ? "Update Book" : "Add Book"}
            </button>

            {editId && (
              <button
                type="button"
                className="btn"
                onClick={clearForm}
              >
                Cancel
              </button>
            )}
          </div>

        </form>
      </section>

      {/* BOOK INVENTORY */}

      <section className="books-list">

        <div className="books-section-heading">
          <div>
            <h3>Book Inventory</h3>
            <p>View and manage all registered books.</p>
          </div>
        </div>

        <input
          className="search"
          type="text"
          placeholder="Search by title, author, genre or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>ISBN</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBooks.map((book) => (
                <tr
                  key={book.id}
                  className={
                    Number(book.quantity) < 2 ? "low-stock-row" : ""
                  }
                >
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.genre || "Not specified"}</td>
                  <td>{book.isbn}</td>
                  <td>{book.quantity}</td>

                  <td>
                    <span
                      className={`dashboard-status ${
                        Number(book.quantity) > 0
                          ? Number(book.quantity) < 2
                            ? "low"
                            : "available"
                          : "low"
                      }`}
                    >
                      {Number(book.quantity) === 0
                        ? "Out of Stock"
                        : Number(book.quantity) < 2
                          ? "Low Stock"
                          : "Available"}
                    </span>
                  </td>

                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        className="btn primary small-btn"
                        onClick={() => editBook(book)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn danger small-btn"
                        onClick={() => deleteBook(book.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-message">
                    No books found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="books-total">
          Showing {filteredBooks.length} of {books.length} books
        </p>

      </section>

    </div>
  );
}

export default Books;
