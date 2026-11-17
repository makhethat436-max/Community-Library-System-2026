# Community Library System

## Project Description

The Community Library System is a web-based application developed to help manage the daily activities of a community library. It allows library staff to manage books, users, stock and borrowing transactions.

The system provides an organised way to maintain library records, monitor book availability and manage library operations efficiently.

## Features

### 1. User Authentication
- Secure login and logout.
- Password hashing using bcryptjs.
- JWT authentication.
- Protected routes.
- Role-based access control.

### 2. Dashboard
- Displays library statistics.
- Shows total books and registered users.
- Displays transaction information.
- Identifies books with low stock.
- Provides an overview of library activities.

### 3. Book Management
- Add new books.
- Update existing book information.
- Delete books.
- Search and view books.
- Monitor available book quantities.

### 4. User Management
- Register new users.
- Update user information.
- Delete users.
- Assign user roles.
- Manage Admin, Librarian and Member accounts.

### 5. Transaction Management
- Record book borrowing.
- Record book returns.
- Add new book stock.
- View transaction history.
- Record borrowers and approving staff.
- Automatically update book quantities.

### 6. Role-Based Access Control

The system supports three user roles:

| Role | Permissions |
|---|---|
| Admin | Full access to Dashboard, Books, Transactions and Users. |
| Librarian | Access to Dashboard, Books and Transactions. |
| Member | Access to Dashboard only. |

Only Admins can manage user accounts. Admins and Librarians can process and approve transactions.

## Technologies Used

### Frontend
- React
- Vite
- JavaScript
- CSS
- React Router

### Backend
- Node.js
- Express.js
- MySQL
- JWT (JSON Web Token)
- bcryptjs

## Project Structure

```text
Community-Library-System/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── App.jsx
│       ├── App.css
│       └── index.css
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── README.md
└── .gitignore
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Replace the placeholder with your actual GitHub repository URL.

### 2. Set Up the Backend

Open a terminal and run:

```bash
cd Community-Library-System/backend
npm install
```

Create a `.env` file inside the backend folder and configure the following settings:

```env
PORT=5000
DB_HOST=your_database_host
DB_PORT=your_database_port
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=community_library
JWT_SECRET=your_private_secret
```

Use your actual MySQL database credentials and a private JWT secret.

Create the `community_library` database and configure the required tables.

### 3. Start the Backend

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

### 4. Set Up the Frontend

Open another terminal and run:

```bash
cd Community-Library-System/frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal, usually:

```text
http://localhost:5173
```

## Database

The application uses MySQL to store:

- User information.
- Book information.
- Borrowing and returning transactions.
- Stock-related records.

The database maintains the library's records even after the application is closed or refreshed.

## Security

The system uses:
- bcryptjs to hash user passwords.
- JWT to authenticate users.
- Protected routes to prevent unauthorised access.
- Role-based permissions to control access to system features.
- Backend authorisation to protect restricted operations.

## Author

Community Library System Project