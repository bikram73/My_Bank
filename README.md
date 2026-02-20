# MyBank

MyBank is a backend banking application built with Node.js, Express, and MySQL. It provides a RESTful API for managing user accounts, processing transactions, and handling secure database operations.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [License](#license)

## Features

- **Account Management**: Create and manage bank accounts.
- **Transactions**: Deposit, withdraw, and transfer funds between accounts.
- **Database Integration**: Persistent data storage using MySQL.
- **REST API**: Standardized JSON API endpoints.

## Technologies Used

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MySQL](https://www.mysql.com/) (using `mysql2` driver)
- **Utilities**:
  - `node-addon-api` for native addon support
  - `mime-db` for content-type handling

## Prerequisites

Ensure you have the following installed on your machine:

- Node.js (v14.x or higher)
- npm (Node Package Manager)
- MySQL Server

## Installation

1.  **Clone the repository** (if applicable) or navigate to the project root:
    ```bash
    cd d:\MyBank
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Configuration

1.  Create a `.env` file in the root directory to store your environment variables.
2.  Add your database connection details:

    ```env
    PORT=3000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=mybank_db
    ```

3.  **Database Setup**: Ensure your MySQL server is running and the `mybank_db` database exists.

## Project Structure

The project follows a standard MVC (Model-View-Controller) architecture for Express applications:

```text
MyBank/
├── node_modules/       # Installed dependencies (express, mysql2, etc.)
├── src/                # Application source code
│   ├── config/         # Database configuration and environment setup
│   ├── controllers/    # Logic for handling API requests
│   ├── models/         # Database schemas and SQL queries
│   ├── routes/         # API route definitions
│   └── app.js          # Main application entry point
├── .env                # Environment variables (do not commit to git)
├── package.json        # Project metadata and scripts
└── README.md           # Project documentation
```

## Usage

To start the server:

```bash
npm start
```

The server will typically run on `http://localhost:3000` (or the port specified in your configuration).

## License

This project is open source and available under the MIT License.