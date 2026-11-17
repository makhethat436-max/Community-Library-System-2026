# Community Library Management System

## Project Description

The Community Library Management System is a web-based application developed to help manage library activities. It allows librarians and administrators to manage books, users, and borrowing transactions efficiently.

The system provides role-based access to ensure that each user can only access the features permitted for their role.

## Main Features

- User login and authentication.
- Dashboard displaying library information.
- Add, update, search, and delete books.
- Manage library users.
- Process book borrowing and returns.
- Add new book stock.
- Automatic book quantity updates.
- Role-based access control.
- Database storage for persistent records.

## User Roles

| Role | Permissions |
|---|---|
| Admin | Dashboard, Books, Transactions, and Users |
| Librarian | Dashboard, Books, and Transactions |
| Member | Dashboard only |

## Technologies Used

**Frontend**
- React
- Vite
- JavaScript
- CSS
- React Router

**Backend**
- Node.js
- Express.js
- MySQL
- JSON Web Token (JWT)
- bcryptjs

## Project Structure

```text
Community-Library-System/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/makhethat436-max/Community-Library-System-2026.git
```

### 2. Install backend dependencies

```bash
cd Community-Library-System-2026/backend
npm install
```

Configure the backend environment variables in a `.env` file using your own database credentials.

### 3. Start the backend

```bash
npm start
```

### 4. Install frontend dependencies

Open another terminal:

```bash
cd Community-Library-System-2026/frontend
npm install
```

### 5. Start the frontend

```bash
npm run dev
```

Open the local URL displayed in your terminal to access the application.

## Database

The application uses MySQL to store user accounts, books, and library transactions.

## Security

- Passwords are protected using bcrypt hashing.
- JWT is used for authentication.
- Protected routes restrict access according to user roles.
- Backend authorization protects restricted operations.

## Developer

Community Library Management System – Academic Project.
