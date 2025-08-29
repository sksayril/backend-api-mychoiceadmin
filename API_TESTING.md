# API Testing Guide

This document provides comprehensive testing examples for all API endpoints using cURL, Postman, or any HTTP client.

## Setup

1. **Start the server**
   ```bash
   npm start
   ```

2. **Base URL**
   ```
   http://localhost:3000/api
   ```

---

## 1. Admin Authentication Testing

### 1.1 Admin Signup
```bash
curl -X POST http://localhost:3000/api/admin/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

**Expected Response:**
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
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### 1.3 Get Admin Profile
```bash
curl -X GET http://localhost:3000/api/admin/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 1.4 Update Admin Profile
```bash
curl -X PUT http://localhost:3000/api/admin/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Updated",
    "email": "john.updated@example.com"
  }'
```

---

## 2. Product Management Testing

### 2.1 Create Product (with image upload)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "mainImage=@/path/to/your/image.jpg" \
  -F "productName=Premium Rice Bran Oil" \
  -F "productFeatures=[\"Cholesterol Free\", \"High Smoke Point\", \"Rich in Oryzanol\", \"Ideal for Frying\"]" \
  -F "description=High-quality rice bran oil for healthy cooking" \
  -F "price=299.99" \
  -F "category=Cooking Oil"
```

### 2.2 Get All Products (Public)
```bash
curl -X GET "http://localhost:3000/api/products?page=1&limit=10&category=Cooking%20Oil"
```

### 2.3 Get Single Product (Public)
```bash
curl -X GET http://localhost:3000/api/products/PRODUCT_ID
```

### 2.4 Update Product
```bash
curl -X PUT http://localhost:3000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Updated Premium Rice Bran Oil",
    "productFeatures": ["Cholesterol Free", "High Smoke Point", "Rich in Oryzanol", "Ideal for Frying", "Organic"],
    "description": "Updated description",
    "price": 349.99,
    "category": "Premium Cooking Oil"
  }'
```

### 2.5 Upload Additional Images
```bash
curl -X POST http://localhost:3000/api/products/PRODUCT_ID/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "additionalImages=@/path/to/image1.jpg" \
  -F "additionalImages=@/path/to/image2.jpg"
```

### 2.6 Delete Product
```bash
curl -X DELETE http://localhost:3000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 3. Contact Management Testing

### 3.1 Submit Contact Form (Public)
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "emailAddress": "john@example.com",
    "mobileNumber": "+1234567890",
    "subject": "Product Inquiry",
    "message": "I would like to know more about your products and pricing."
  }'
```

### 3.2 Get All Contacts (Admin)
```bash
curl -X GET "http://localhost:3000/api/contact?page=1&limit=10&status=new" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3.3 Update Contact Status
```bash
curl -X PUT http://localhost:3000/api/contact/CONTACT_ID/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "read"
  }'
```

### 3.4 Get Contact Statistics
```bash
curl -X GET http://localhost:3000/api/contact/stats/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 4. ID Card Management Testing

### 4.1 Create ID Card
```bash
curl -X POST http://localhost:3000/api/id-cards \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeType": "full-time",
    "fullName": "Jane Smith",
    "address": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "bloodGroup": "A+",
    "mobileNumber": "+1234567890",
    "email": "jane.smith@company.com",
    "dateOfBirth": "1990-01-01",
    "dateOfJoining": "2024-01-01",
    "department": "Engineering",
    "designation": "Software Engineer"
  }'
```

### 4.2 Get All ID Cards
```bash
curl -X GET "http://localhost:3000/api/id-cards?page=1&limit=10&department=Engineering" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4.3 Get ID Card by Number
```bash
curl -X GET http://localhost:3000/api/id-cards/number/EMP12345678 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4.4 Update ID Card
```bash
curl -X PUT http://localhost:3000/api/id-cards/ID_CARD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeType": "full-time",
    "fullName": "Jane Smith Updated",
    "address": {
      "street": "456 Updated Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10002",
      "country": "USA"
    },
    "bloodGroup": "A+",
    "mobileNumber": "+1234567890",
    "email": "jane.updated@company.com",
    "dateOfBirth": "1990-01-01",
    "dateOfJoining": "2024-01-01",
    "department": "Senior Engineering",
    "designation": "Senior Software Engineer"
  }'
```

### 4.5 Get ID Card Statistics
```bash
curl -X GET http://localhost:3000/api/id-cards/stats/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 5. Dashboard Testing

### 5.1 Dashboard Overview
```bash
curl -X GET http://localhost:3000/api/dashboard/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5.2 Chart Data
```bash
curl -X GET http://localhost:3000/api/dashboard/charts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5.3 Recent Activity
```bash
curl -X GET "http://localhost:3000/api/dashboard/recent-activity?limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5.4 System Health
```bash
curl -X GET http://localhost:3000/api/dashboard/system-health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5.5 Quick Stats
```bash
curl -X GET http://localhost:3000/api/dashboard/quick-stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 6. Postman Collection

### Import this JSON into Postman:

```json
{
  "info": {
    "name": "MyChoice Admin API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Admin",
      "item": [
        {
          "name": "Signup",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"fullName\": \"John Doe\",\n  \"email\": \"admin@example.com\",\n  \"password\": \"password123\",\n  \"role\": \"admin\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/admin/signup",
              "host": ["{{baseUrl}}"],
              "path": ["admin", "signup"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/admin/login",
              "host": ["{{baseUrl}}"],
              "path": ["admin", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Products",
      "item": [
        {
          "name": "Create Product",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "formdata",
              "formdata": [
                {
                  "key": "mainImage",
                  "type": "file",
                  "src": []
                },
                {
                  "key": "productName",
                  "value": "Premium Rice Bran Oil",
                  "type": "text"
                },
                {
                  "key": "productFeatures",
                  "value": "[\"Cholesterol Free\", \"High Smoke Point\", \"Rich in Oryzanol\", \"Ideal for Frying\"]",
                  "type": "text"
                }
              ]
            },
            "url": {
              "raw": "{{baseUrl}}/products",
              "host": ["{{baseUrl}}"],
              "path": ["products"]
            }
          }
        },
        {
          "name": "Get Products",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/products",
              "host": ["{{baseUrl}}"],
              "path": ["products"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## 7. Testing Checklist

### Authentication
- [ ] Admin signup with valid data
- [ ] Admin signup with duplicate email (should fail)
- [ ] Admin login with valid credentials
- [ ] Admin login with invalid credentials (should fail)
- [ ] Access protected routes without token (should fail)
- [ ] Access protected routes with invalid token (should fail)

### Products
- [ ] Create product with main image
- [ ] Create product without image (should fail)
- [ ] Get all products (public access)
- [ ] Get single product (public access)
- [ ] Update product (admin only)
- [ ] Upload additional images
- [ ] Delete product (soft delete)

### Contacts
- [ ] Submit contact form (public)
- [ ] Get all contacts (admin only)
- [ ] Update contact status
- [ ] Get contact statistics

### ID Cards
- [ ] Create ID card with auto-generated number
- [ ] Get all ID cards with filters
- [ ] Get ID card by number
- [ ] Update ID card
- [ ] Get ID card statistics

### Dashboard
- [ ] Get dashboard overview
- [ ] Get chart data
- [ ] Get recent activity
- [ ] Get system health
- [ ] Get quick stats

### Error Handling
- [ ] Test validation errors
- [ ] Test authentication errors
- [ ] Test file upload errors
- [ ] Test database errors

---

## 8. Common Issues and Solutions

### 1. CORS Errors
**Issue:** Browser blocks requests due to CORS policy
**Solution:** The API includes CORS middleware, but ensure your frontend is making requests to the correct URL.

### 2. File Upload Issues
**Issue:** File upload fails
**Solution:** 
- Ensure file size is under 5MB
- Use supported formats (jpg, jpeg, png, webp)
- Use `multipart/form-data` content type

### 3. Authentication Issues
**Issue:** Token not working
**Solution:**
- Check if token is properly formatted: `Bearer <token>`
- Ensure token hasn't expired (7 days default)
- Verify token was obtained from login/signup

### 4. Database Connection
**Issue:** Database connection fails
**Solution:**
- Check MongoDB is running
- Verify DATABASE_URL in .env file
- Ensure network connectivity

---

## 9. Performance Testing

### Load Testing with Apache Bench
```bash
# Test public endpoints
ab -n 1000 -c 10 http://localhost:3000/api/products

# Test authenticated endpoints (requires token)
ab -n 100 -c 5 -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/dashboard/overview
```

### Memory Usage Monitoring
```bash
# Monitor Node.js process
node --inspect app.js

# Check memory usage
curl -X GET http://localhost:3000/api/dashboard/system-health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

This testing guide covers all major functionality of the MyChoice Admin API. Use these examples to verify that your API is working correctly and to test new features as they are developed.
