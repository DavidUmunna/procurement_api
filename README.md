# Procurement API

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Requirements](#requirements)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Project Structure](#project-structure)
7. [API Endpoints](#api-endpoints)
8. [Workflows](#workflows)
   - [Authentication Workflow](#authentication-workflow)
   - [Order Management Workflow](#order-management-workflow)
9. [Database Schema](#database-schema)
10. [Environment Variables](#environment-variables)
11. [Error Handling](#error-handling)
12. [Contributing](#contributing)
13. [License](#license)

---

## 1. Introduction

The **Procurement API** is a back-end service designed to streamline and automate procurement processes. It provides a set of RESTful endpoints for managing purchase orders, suppliers, and inventory. The API also includes authentication and authorization features to ensure secure access.

---

## 2. Features

- **Purchase Order Management**:
  - Create, update, and delete purchase orders.
  - Approve orders with admin privileges.

- **Supplier Management**:
  - Add, update, and delete supplier information.

- **Authentication**:
  - Secure login with JWT-based authentication.
  - Role-based access control for admin and regular users.

- **File Uploads**:
  - Upload and manage files associated with purchase orders.

- **Error Handling**:
  - Comprehensive error handling for all endpoints.

---

## 3. Requirements

- **Node.js** (version 14 or higher)
- **npm** (version 6 or higher)
- **MongoDB** (local or cloud instance)

---

## 4. Installation

1. Clone this repository:
    ```bash
    git clone https://github.com/DavidUmunna/procurement_api.git
    cd procurement_api
    ```

2. Install the required packages:
    ```bash
    npm install
    ```

3. Set up your environment variables:
    - Create a `.env` file in the root directory and add the following:
      ```env
      PORT=5000
      MONGO_URI=mongodb://127.0.0.1:27017/procurement
      JWT_SECRET=your_secret_key
      ```

4. Start the server:
    ```bash
    npm start
    ```

---

## 5. Usage

1. Start the API server:
    ```bash
    npm start
    ```

2. The API will be available at `http://localhost:5000`.

3. Use tools like Postman or cURL to interact with the API endpoints.

---

## 6. Project Structure
procurement_api/
├── .gitignore
├── package.json
├── README.md
├── server.js              # Main server file
├── db.js                  # MongoDB connection setup
├── maintenance.js         # Maintenance script for database cleanup
├── models/                # Mongoose models
│   ├── Product.js         # Product schema
│   ├── PurchaseOrder.js   # Purchase order schema
│   ├── Supplier.js        # Supplier schema
│   └── users_.js          # User schema
├── routes/                # API routes
│   ├── access.js          # Access control routes
│   ├── admin_user.js      # Admin user routes
│   ├── check-auth.js      # Authentication middleware
│   ├── fileupload.js      # File upload routes
│   ├── orders.js          # Purchase order routes
│   ├── products.js        # Product routes
│   ├── signin.js          # User sign-in routes
│   ├── suppliers.js       # Supplier routes
│   └── users.js           # User management routes
├── uploads/               # Directory for uploaded files
└── data/                  # Database-related files



---

## 7. API Endpoints

### **Authentication**
- `POST /api/signin`: Logs in a user and returns a JWT token.
- `GET /api/check-auth`: Verifies the user's authentication status.

### **Purchase Orders**
- `GET /api/orders`: Fetches all purchase orders.
- `GET /api/orders/:email`: Fetches orders for a specific user by email.
- `POST /api/orders`: Creates a new purchase order.
- `PUT /api/orders/:id/approve`: Approves a purchase order.

### **Suppliers**
- `GET /api/suppliers`: Fetches all suppliers.
- `POST /api/suppliers`: Adds a new supplier.

### **Products**
- `GET /api/products`: Fetches all products.
- `POST /api/products`: Adds a new product.

### **User Information**
- `GET /api/users`:fetches all users 
- `GET /api/users/:email`:fetches all users information with the email
- `POST /api/users`:creates new user
- `PUT /api/users`:updates user informarion like if user want to change password
- `DELETE /api/users`:deletes user and user information

---

## 8. Workflows

### 8.1 Authentication Workflow
1. **Login**:
   - Users log in via the `/api/signin` endpoint.
   - A JWT token is generated and stored in a cookie.
   - The `check-auth.js` middleware validates the token for protected routes.

2. **Token Validation**:
   - The `check-auth.js` middleware verifies the token and attaches the decoded user information to `req.user`.

---

### 8.2 Order Management Workflow
1. **Create Order**:
   - Users create orders via the `POST /api/orders` endpoint.
   - The order is saved in the database with a default status of "Pending."

2. **Approve Order**:
   - Admin users approve orders via the `PUT /api/orders/:id/approve` endpoint.
   - The admin's name is added to the `Approvals` array in the order document.

3. **Fetch Orders**:
   - Users fetch their orders via the `GET /api/orders/:email` endpoint.
   - Admin users can fetch all orders via the `GET /api/orders` endpoint.
  
---

## 8.3 User Management Workflow
1.  ***Create User*:
   - Admins can create users via `POST /api/users` endpoint
   - Admins can delete users via `DELETE /api/users/:id` endpoint
   - Users can upodate thier passwords via `PUT /api/users/:id` endpoint
   - Admins can get all user information via `GET /api/users`
   - Users can get thier  request history information via `GET /api/users/:email` endpoint 
   

---

### 9. Environment Variables
The following environment variables are required:

PORT: The port on which the server runs (default: 5000).
MONGO_URI: MongoDB connection string.
JWT_SECRET: Secret key for signing JWT tokens.

## 10. Error Handling
The API includes comprehensive error handling for all endpoints. Common error responses include:

400 Bad Request:
Missing or invalid request parameters.
401 Unauthorized:
Invalid or missing authentication token.
404 Not Found:
Resource not found (e.g., order or supplier).
500 Internal Server Error:
Unexpected server errors.

## 11. Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.
Create a new branch:
git checkout -b feature-branch
## 12. Database Schema

### **PurchaseOrder Schema**
```javascript
/*const PurchaseOrderSchema = new Schema({
  orderNumber: { type: String, unique: true, default: () => `PO-${Date.now()}` },
  Approvals: { type: [String], default: [] },
  email: { type: String, required: true },
  products: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  supplier: { type: String, required: true },
  orderedBy: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Completed", "Rejected"], default: "Pending" },
  urgency: { type: String, enum: ["VeryUrgent", "Urgent", "NotUrgent"], default: "NotUrgent" },
  remarks: { type: String },
}, { timestamps: true });*/


