# 🏦 MyBank App

MyBank is a backend banking application built with **Node.js**, **Express**, and **PostgreSQL**. It provides a RESTful API for managing user accounts, processing transactions, and handling secure database operations.

## 📋 Table of Contents

- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Project Structure](#-project-structure)
- [Usage](#-usage)
- [License](#-license)

## ✨ Features

- 💼 **Account Management**: Create and manage bank accounts.
- 💸 **Transactions**: Deposit, withdraw, and transfer funds between accounts.
- 🗄️ **Database Integration**: Persistent data storage using PostgreSQL.
- 🚀 **REST API**: Standardized JSON API endpoints.
- 🔒 **Security**: Secure handling of API keys and database credentials.

## 🛠 Technologies Used

- **Runtime**: Node.js 🟢
- **Framework**: Express.js 🚂
- **Database**: PostgreSQL 🐘 (using `pg` driver)
- **Utilities**:
  - `dotenv` for environment management
  - `node-addon-api` for native addon support

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:

- 🟢 Node.js (v14.x or higher)
- 📦 npm (Node Package Manager)
- 🐘 PostgreSQL (Local or Cloud like Vercel Postgres/Neon/Supabase)

## 📥 Installation

1.  **Clone the repository** (if applicable) or navigate to the project root:
    ```bash
    git clone <repository-url>
    cd MyBank
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## 🔧 Configuration

1.  Create a `.env` file in the root directory to store your environment variables.
2.  Add your database connection details and API keys:

    ```env
    PORT=3000
    
    # Local Database Configuration
    DB_HOST=localhost
    DB_USER=postgres
    DB_PASSWORD=your_local_password
    DB_NAME=mybank
    DB_PORT=5432
    DB_SSL=false
    ```

## ☁️ Database Setup

### Vercel Postgres
1. Add a storage resource in your Vercel project dashboard.
2. Connect it to your project. Vercel will automatically add `POSTGRES_URL` to your environment variables.
3. **To find the connection string manually:**
   - Go to your Vercel Project > **Storage** tab.
   - Select your database.
   - Under **Connection Details** or **.env.local**, click **Show Secret**.
   - Copy the `POSTGRES_URL` or `DATABASE_URL`.

### Local PostgreSQL
1. Install PostgreSQL locally.
2. Create a database named `mybank`.
3. Update your `.env` file with your local credentials.

## 📂 Project Structure

The project follows a standard MVC (Model-View-Controller) architecture for Express applications:

```text
MyBank/
├── node_modules/       # 📦 Installed dependencies
├── src/                # 📂 Application source code
│   ├── config/         # ⚙️ Database configuration
│   ├── controllers/    # 🎮 Logic for handling API requests
│   ├── models/         # 🗄️ Database schemas and SQL queries
│   ├── routes/         # 🛣️ API route definitions
│   └── app.js          # 🚀 Main application entry point
├── .env                # 🔐 Environment variables (do not commit!)
├── package.json        # 📄 Project metadata and scripts
└── README.md           # 📖 Project documentation
```

## Usage

To start the server:

```bash
npm start
```

The server will typically run on `http://localhost:3000` (or the port specified in your configuration).

## License

This project is open source and available under the MIT License.