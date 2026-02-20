# 🏦 MyBank App

MyBank is a backend banking application built with **Node.js**, **Express**, and **MySQL**. It provides a RESTful API for managing user accounts, processing transactions, and handling secure database operations.

## 📋 Table of Contents

- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Setup (Aiven)](#-database-setup-aiven)
- [Project Structure](#-project-structure)
- [Usage](#-usage)
- [License](#-license)

## ✨ Features

- 💼 **Account Management**: Create and manage bank accounts.
- 💸 **Transactions**: Deposit, withdraw, and transfer funds between accounts.
- 🗄️ **Database Integration**: Persistent data storage using MySQL (hosted on Aiven).
- 🚀 **REST API**: Standardized JSON API endpoints.
- 🔒 **Security**: Secure handling of API keys and database credentials.

## 🛠 Technologies Used

- **Runtime**: Node.js 🟢
- **Framework**: Express.js 🚂
- **Database**: MySQL 🐬 (using `mysql2` driver)
- **Cloud Provider**: Aiven ☁️ (for managed MySQL)
- **Utilities**:
  - `dotenv` for environment management
  - `node-addon-api` for native addon support

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:

- 🟢 Node.js (v14.x or higher)
- 📦 npm (Node Package Manager)
- ☁️ An Aiven account (for the MySQL database)

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
2.  Add your database connection details (Aiven) and API keys:

    ```env
    PORT=3000
    
    # Database Configuration (Aiven)
    DB_HOST=your-aiven-mysql-host.aivencloud.com
    DB_PORT=your-port
    DB_USER=avnadmin
    DB_PASSWORD=your_password
    DB_NAME=defaultdb
    DB_SSL=true
    
    # Security
    API_KEY=your_secure_api_key_here
    ```

## ☁️ Database Setup (Aiven)

This project uses a managed MySQL database hosted on **Aiven**.

1.  **Create a Service**: Log in to your Aiven Console and create a new **MySQL** service.
2.  **Get Credentials**: Once the service is running, navigate to the **Overview** tab to find your `Host`, `Port`, `User`, and `Password`.
3.  **Connection URI**: You can also use the Service URI if your application supports it, but for this project, we use individual variables in the `.env` file.
4.  **CA Certificate**: If required, download the CA certificate from the Aiven console to connect securely.

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