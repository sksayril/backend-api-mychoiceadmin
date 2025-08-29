# MyChoice Admin API

A comprehensive admin API system built with Node.js, Express.js, and MongoDB for managing products, contacts, employee ID cards, departments, and designations.

## Features

- **Admin Authentication**: JWT-based authentication with role-based access control
- **Product Management**: CRUD operations for products with image upload support
- **Contact Management**: Public contact form submission and admin management
- **Employee ID Card Management**: Complete employee management with picture upload
- **Department Management**: Create and manage company departments
- **Designation Management**: Create and manage job designations linked to departments
- **Dashboard Analytics**: Comprehensive dashboard with charts and statistics
- **File Upload**: Support for product images and employee pictures (up to 100MB)
- **Data Validation**: Robust input validation using Joi
- **Error Handling**: Comprehensive error handling and logging

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Joi
- **Password Hashing**: bcryptjs
- **Environment Variables**: dotenv

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend-api-mychoiceadmin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   DATABASE_URL=mongodb://localhost:27017/mychoice_admin
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## API Endpoints

### Base URL
```
http://localhost:3100/api
```

---

## 1. Admin Authentication

### 1.1 Admin Signup
- **POST** `/admin/signup`
- **Description**: Create a new admin account
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "fullName": "John Doe",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Admin created successfully",
    "data": {
      "admin": {
        "_id": "...",
        "fullName": "John Doe",
        "email": "admin@example.com",
        "role": "admin",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### 1.2 Admin Login
- **POST** `/admin/login`
- **Description**: Authenticate admin and get JWT token
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```

### 1.3 Get Admin Profile
- **GET** `/admin/profile`
- **Description**: Get current admin profile
- **Headers**: `Authorization: Bearer <token>`

### 1.4 Update Admin Profile
- **PUT** `/admin/profile`
- **Description**: Update admin profile information
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body**:
  ```json
  {
    "fullName": "John Updated",
    "email": "john.updated@example.com"
  }
  ```

### 1.5 Change Password
- **PUT** `/admin/change-password`
- **Description**: Change admin password
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body**:
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }
  ```

### 1.6 Logout
- **POST** `/admin/logout`
- **Description**: Logout admin (client-side token removal)
- **Headers**: `Authorization: Bearer <token>`

---

## 2. Product Management

### 2.1 Create Product
- **POST** `/products`
- **Description**: Create a new product with main image
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body** (form-data):
  - `mainImage`: File (required, max 100MB)
  - `productName`: String (required)
  - `productFeatures`: JSON string array (required)
  - `description`: String (optional)
  - `price`: Number (optional)
  - `category`: String (optional)

### 2.2 Get All Products
- **GET** `/products`
- **Description**: Get all active products (public access)
- **Query Parameters**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 10)
  - `category`: String (filter by category)
  - `search`: String (search in name/description)
  - `sortBy`: String (default: 'createdAt')
  - `sortOrder`: String (default: 'desc')

### 2.3 Get Single Product
- **GET** `/products/:productId`
- **Description**: Get single product details (public access)

### 2.4 Update Product
- **PUT** `/products/:productId`
- **Description**: Update product information
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`

### 2.5 Upload Additional Images
- **POST** `/products/:productId/images`
- **Description**: Upload additional product images
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body** (form-data):
  - `additionalImages`: Files (max 5 files, 100MB each)

### 2.6 Update Main Image
- **PUT** `/products/:productId/main-image`
- **Description**: Update main product image
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body** (form-data):
  - `mainImage`: File (required, max 100MB)

### 2.7 Delete Product
- **DELETE** `/products/:productId`
- **Description**: Soft delete product
- **Headers**: `Authorization: Bearer <token>`

### 2.8 Get Product Categories
- **GET** `/products/categories/list`
- **Description**: Get all product categories (public access)

---

## 3. Contact Management

### 3.1 Submit Contact Form
- **POST** `/contact`
- **Description**: Submit contact form (public access)
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "fullName": "John Doe",
    "emailAddress": "john@example.com",
    "mobileNumber": "+1234567890",
    "subject": "Product Inquiry",
    "message": "I would like to know more about your products."
  }
  ```

### 3.2 Get All Contacts
- **GET** `/contact`
- **Description**: Get all contact submissions (admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 10)
  - `status`: String (filter by status: new, read, replied, closed)
  - `search`: String (search in name, email, subject, message)
  - `sortBy`: String (default: 'createdAt')
  - `sortOrder`: String (default: 'desc')

### 3.3 Get Single Contact
- **GET** `/contact/:contactId`
- **Description**: Get single contact details (admin only)
- **Headers**: `Authorization: Bearer <token>`

### 3.4 Update Contact Status
- **PUT** `/contact/:contactId/status`
- **Description**: Update contact status
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body**:
  ```json
  {
    "status": "read"
  }
  ```

### 3.5 Delete Contact
- **DELETE** `/contact/:contactId`
- **Description**: Delete contact (admin only)
- **Headers**: `Authorization: Bearer <token>`

### 3.6 Get Contact Statistics
- **GET** `/contact/stats/overview`
- **Description**: Get contact statistics (admin only)
- **Headers**: `Authorization: Bearer <token>`

---

## 4. Department Management

### 4.1 Create Department
- **POST** `/departments`
- **Description**: Create a new department
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body**:
  ```json
  {
    "name": "Engineering",
    "description": "Software development team",
    "code": "ENG"
  }
  ```

### 4.2 Get All Departments
- **GET** `/departments`
- **Description**: Get all active departments
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 10)
  - `search`: String (search in name, code, description)
  - `sortBy`: String (default: 'createdAt')
  - `sortOrder`: String (default: 'desc')

### 4.3 Get Single Department
- **GET** `/departments/:departmentId`
- **Description**: Get single department details
- **Headers**: `Authorization: Bearer <token>`

### 4.4 Update Department
- **PUT** `/departments/:departmentId`
- **Description**: Update department information
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`

### 4.5 Delete Department
- **DELETE** `/departments/:departmentId`
- **Description**: Soft delete department
- **Headers**: `Authorization: Bearer <token>`

### 4.6 Get Active Departments
- **GET** `/departments/list/active`
- **Description**: Get all active departments for dropdowns
- **Headers**: `Authorization: Bearer <token>`

---

## 5. Designation Management

### 5.1 Create Designation
- **POST** `/designations`
- **Description**: Create a new designation
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body**:
  ```json
  {
    "title": "Software Engineer",
    "description": "Full-stack development role",
    "level": 3,
    "department": "department_id_here"
  }
  ```

### 5.2 Get All Designations
- **GET** `/designations`
- **Description**: Get all active designations
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 10)
  - `department`: String (filter by department ID)
  - `search`: String (search in title, description)
  - `sortBy`: String (default: 'createdAt')
  - `sortOrder`: String (default: 'desc')

### 5.3 Get Single Designation
- **GET** `/designations/:designationId`
- **Description**: Get single designation details
- **Headers**: `Authorization: Bearer <token>`

### 5.4 Update Designation
- **PUT** `/designations/:designationId`
- **Description**: Update designation information
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`

### 5.5 Delete Designation
- **DELETE** `/designations/:designationId`
- **Description**: Soft delete designation
- **Headers**: `Authorization: Bearer <token>`

### 5.6 Get Designations by Department
- **GET** `/designations/department/:departmentId`
- **Description**: Get designations for a specific department
- **Headers**: `Authorization: Bearer <token>`

### 5.7 Get Active Designations
- **GET** `/designations/list/active`
- **Description**: Get all active designations for dropdowns
- **Headers**: `Authorization: Bearer <token>`

---

## 6. Employee ID Card Management

### 6.1 Create ID Card
- **POST** `/id-cards`
- **Description**: Create a new employee ID card with picture
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body** (form-data):
  - `employeePicture`: File (required, max 100MB)
  - `employeeType`: String (required: full-time, part-time, contract, intern, temporary)
  - `fullName`: String (required)
  - `address`: JSON object (required)
  - `bloodGroup`: String (required: A+, A-, B+, B-, AB+, AB-, O+, O-)
  - `mobileNumber`: String (required)
  - `email`: String (required)
  - `dateOfBirth`: Date (required)
  - `dateOfJoining`: Date (required)
  - `department`: String (required, department ID)
  - `designation`: String (required, designation ID)

### 6.2 Get All ID Cards
- **GET** `/id-cards`
- **Description**: Get all active employee ID cards
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: Number (default: 1)
  - `limit`: Number (default: 10)
  - `employeeType`: String (filter by employee type)
  - `department`: String (filter by department ID)
  - `search`: String (search in name, email, ID card number)
  - `sortBy`: String (default: 'createdAt')
  - `sortOrder`: String (default: 'desc')

### 6.3 Get Single ID Card
- **GET** `/id-cards/:idCardId`
- **Description**: Get single ID card details
- **Headers**: `Authorization: Bearer <token>`

### 6.4 Get ID Card by Number
- **GET** `/id-cards/number/:idCardNumber`
- **Description**: Get ID card by card number
- **Headers**: `Authorization: Bearer <token>`

### 6.5 Update ID Card
- **PUT** `/id-cards/:idCardId`
- **Description**: Update ID card information (supports partial updates and picture upload)
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body** (form-data, all fields optional):
  - `employeePicture`: File (optional, max 100MB)
  - `employeeType`: String (optional: full-time, part-time, contract, intern, temporary)
  - `fullName`: String (optional)
  - `address`: JSON object (optional)
  - `bloodGroup`: String (optional: A+, A-, B+, B-, AB+, AB-, O+, O-)
  - `mobileNumber`: String (optional)
  - `email`: String (optional)
  - `dateOfBirth`: Date (optional)
  - `dateOfJoining`: Date (optional)
  - `department`: String (optional, department ID)
  - `designation`: String (optional, designation ID)

### 6.6 Update Employee Picture
- **PUT** `/id-cards/:idCardId/picture`
- **Description**: Update employee picture
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body** (form-data):
  - `employeePicture`: File (required, max 100MB)

### 6.7 Delete ID Card
- **DELETE** `/id-cards/:idCardId`
- **Description**: Soft delete ID card
- **Headers**: `Authorization: Bearer <token>`

### 6.8 Get ID Card Statistics
- **GET** `/id-cards/stats/overview`
- **Description**: Get ID card statistics
- **Headers**: `Authorization: Bearer <token>`

### 6.9 Get Departments List
- **GET** `/id-cards/departments/list`
- **Description**: Get all departments for ID card creation
- **Headers**: `Authorization: Bearer <token>`

---

## 7. Dashboard

### 7.1 Dashboard Overview
- **GET** `/dashboard/overview`
- **Description**: Get dashboard overview statistics
- **Headers**: `Authorization: Bearer <token>`

### 7.2 Chart Data
- **GET** `/dashboard/charts`
- **Description**: Get chart data for analytics
- **Headers**: `Authorization: Bearer <token>`

### 7.3 Recent Activity
- **GET** `/dashboard/recent-activity`
- **Description**: Get recent activity across all modules
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `limit`: Number (default: 10)

### 7.4 System Health
- **GET** `/dashboard/system-health`
- **Description**: Get system health information
- **Headers**: `Authorization: Bearer <token>`

### 7.5 Quick Stats
- **GET** `/dashboard/quick-stats`
- **Description**: Get quick statistics for today, this week, this month
- **Headers**: `Authorization: Bearer <token>`

---

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

For validation errors:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Field is required", "Invalid email format"]
}
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## File Upload

### Supported Formats
- Images: JPEG, JPG, PNG, WebP
- Maximum file size: 100MB per file
- Maximum additional images: 5 per product

### Upload Directories
- Product main images: `public/uploads/products/main/`
- Product additional images: `public/uploads/products/additional/`
- Employee pictures: `public/uploads/employees/pictures/`

## Database Schema

### Admin
- `fullName`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `role`: String (enum: 'admin', 'super_admin')
- `isActive`: Boolean (default: true)
- `lastLogin`: Date
- `createdAt`, `updatedAt`: Timestamps

### Product
- `productName`: String (required)
- `productFeatures`: Array of strings (required)
- `mainImage`: String (required, file path)
- `additionalImages`: Array of strings (file paths)
- `description`: String
- `price`: Number
- `category`: String
- `isActive`: Boolean (default: true)
- `createdBy`: ObjectId (ref: Admin)
- `createdAt`, `updatedAt`: Timestamps

### Contact
- `fullName`: String (required)
- `emailAddress`: String (required)
- `mobileNumber`: String (required)
- `subject`: String (required)
- `message`: String (required)
- `status`: String (enum: 'new', 'read', 'replied', 'closed')
- `ipAddress`: String
- `userAgent`: String
- `createdAt`, `updatedAt`: Timestamps

### Department
- `name`: String (required, unique)
- `description`: String
- `code`: String (required, unique, uppercase)
- `isActive`: Boolean (default: true)
- `createdBy`: ObjectId (ref: Admin)
- `createdAt`, `updatedAt`: Timestamps

### Designation
- `title`: String (required, unique)
- `description`: String
- `level`: Number (required, 1-20)
- `department`: ObjectId (ref: Department, required)
- `isActive`: Boolean (default: true)
- `createdBy`: ObjectId (ref: Admin)
- `createdAt`, `updatedAt`: Timestamps

### IdCard
- `idCardNumber`: String (required, unique, auto-generated)
- `employeeType`: String (enum: 'full-time', 'part-time', 'contract', 'intern', 'temporary')
- `fullName`: String (required)
- `employeePicture`: String (required, file path)
- `address`: Object (street, city, state, zipCode, country)
- `bloodGroup`: String (enum: A+, A-, B+, B-, AB+, AB-, O+, O-)
- `mobileNumber`: String (required)
- `email`: String (required, unique)
- `dateOfBirth`: Date (required)
- `dateOfJoining`: Date (required)
- `department`: ObjectId (ref: Department, required)
- `designation`: ObjectId (ref: Designation, required)
- `isActive`: Boolean (default: true)
- `createdBy`: ObjectId (ref: Admin)
- `createdAt`, `updatedAt`: Timestamps

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation using Joi
- **CORS**: Cross-Origin Resource Sharing enabled
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **File Upload Security**: File type and size validation

## Development Guidelines

1. **Environment Variables**: Always use environment variables for sensitive data
2. **Error Handling**: Use try-catch blocks and proper error responses
3. **Validation**: Validate all input data using Joi schemas
4. **Authentication**: Protect routes that require authentication
5. **File Uploads**: Validate file types and sizes
6. **Database**: Use proper indexes for better performance
7. **Logging**: Log important events and errors

## Support

For support and questions, please contact the development team.
