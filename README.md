A full-stack Canteen Management System built with React.js and Laravel.
Setup and Installation Instructions
 Canteen Management System

IT15 Final Project — Managing inventory, orders, and sales for a canteen.

Table of Contents
1. Overview
2. Features
3. Tech Stack
4. Prerequisites
5. Installation
6. Configuration
7. Running the Project
8. Project Structure
9. API Documentation
10. Database Schema
11. Security
12. Troubleshooting
13. Contributing

  Overview
The Canteen Management System is a complete web-based solution for managing canteen operations including:
- Customer menu browsing and ordering
- Cashier point-of-sale (POS) interface
- Admin dashboard with analytics and reports
- Inventory tracking and management
- User role management (Admin, Cashier, Customer)
- Order history and receipt generation


 Features
Customer Features
-  Browse menu with categories and search
-  Add items to shopping cart
- Place orders with checkout
- View order receipt/summary
- Track my orders and order history
- Print receipts

Cashier Features
- Point-of-sale (POS) interface
- Quick item selection and cart management
-  Place orders (including for customers)
-  View order queue/status
- Print receipts
- Basic inventory visibility

Admin Features
-  Dashboard with sales analytics
-  Revenue & order metrics (daily, weekly, monthly)
- Sales charts and trends
- Best-selling items report
- Category-wise sales breakdown
-  Menu management (CRUD)
-  Category management (CRUD)
-  Inventory management with low-stock alerts
- Bulk restock operations
- User management (create/edit/delete)
- Order management
- Advanced reporting


Tech Stack
Frontend
 React  18.2.0  UI library 
 Vite  5.1.0  Build tool & dev server 
 React Router  6.22.0  Client-side routing 
 Axios  1.6.7  HTTP client 
 Tailwind CSS  3.4.1  Styling 
 Recharts  2.12.0  Data visualization 
 Chart.js  4.4.0  Charts 
 Lucide React  0.356.0  Icons 
 React Hot Toast  2.4.1  Notifications 


Backend
Laravel  12.0  Web framework 
 PHP  8.2+  Server language 
 MySQL  5.7+  Database 
Sanctum  4.3  API authentication 


Prerequisites

System
- OS: Windows
- RAM: 8gb
- Storage: 238gb

 Software

Backend
1. PHP 8.2+ 
   php -v  


2. Composer
   composer --version


3. MySQL 5.7+
   mysql --version
   

Frontend Requirements
1. Node.js 18+ & npm
   node -v && npm -v
 

Installation

Step 1: Clone Repository
git clone <repository-url>
cd CanteenManagementSystem

Step 2: Backend Setup

 2.1 Install Dependencies
cd canteen-backend
composer install


 2.2 Environment Configuration
copy .env.example .env

env
APP_NAME=canteen_db
APP_ENV=local
APP_KEY=base64:KQH/2yScKZnO99HODfWfz1e71g8p468UIydR2tc5HP8=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=canteen_db
DB_USERNAME=root
DB_PASSWORD=pass

SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:3001,localhost:5173
SESSION_DOMAIN=localhost
FRONTEND_URL=http://localhost:3000
 

 2.3 Generate Application Key

php artisan key:generate


 2.4 Create Database
bash

mysql -u root -p
CREATE DATABASE canteen_db;
EXIT;

 2.5 Run Migrations & Seeders
php artisan migrate

 Seed sample data (categories, menu items, users)
php artisan db:seed


Sample Login Credentials after seeding:
- Admin: admin@example.com / password
- Cashier: cashier@example.com / password
- Customer: customer@example.com / password


Step 3: Frontend Setup

3.1 Install Dependencies
cd canteen-frontend
npm install


 3.2 Environment Configuration (Optional)
VITE_API_URL=http://localhost:8000/api

Running the Project

Terminal 1: Start Laravel Backend
cd canteen-backend

 Using PHP built-in server
php artisan serve

Server runs on: http://localhost:8000

Terminal 2: Start React Frontend
cd canteen-frontend
npm run dev

Frontend available at: http://localhost:3000 or http://localhost:5173



Access the Application

 Role  URL  Email  Password 

 Customer  http://localhost:3000  customer@example.com  password 
 Cashier  http://localhost:3000  cashier@example.com  password 
 Admin  http://localhost:3000  admin@example.com  password 



 Project Structure

```
CanteenManagementSystem/
├── canteen-backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/         # API endpoints
│   │   │   ├── Middleware/          # Auth & role middleware
│   │   │   └── Requests/
│   │   ├── Models/                  # Eloquent models
│   │   └── Providers/
│   ├── database/
│   │   ├── migrations/              # Database schema
│   │   ├── seeders/                 # Sample data
│   │   └── factories/
│   ├── routes/
│   │   └── api.php                  # API routes
│   ├── config/
│   │   ├── cors.php                 # CORS config
│   │   └── database.php
│   ├── .env                         # Environment variables
│   ├── composer.json
│   └── artisan                      # Laravel CLI
│
├── canteen-frontend/                # React App
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Navbar, Sidebar, etc.
│   │   │   ├── auth/                # Login page
│   │   │   ├── dashboard/           # Admin dashboard
│   │   │   ├── menu/                # Menu display & management
│   │   │   ├── orders/              # Orders, Cart, POS
│   │   │   ├── inventory/           # Inventory management
│   │   │   └── users/               # User management
│   │   ├── context/                 # Auth & Cart state
│   │   ├── services/                # API client & utilities
│   │   ├── App.jsx                  # Router & layout
│   │   └── index.jsx                # Entry point
│   ├── public/
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js            # Tailwind config
│   ├── package.json
│   └── index.html
│
└── README.md                         # This file
```



 API Documentation

Base URL: `http://localhost:8000/api`

Authentication
All protected endpoints require:
```
Authorization: Bearer {access_token}
```

Main Endpoints

Auth
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login & get token
- `GET /auth/me` — Get current user
- `POST /auth/logout` — Logout

Menu
- `GET /menu` — List items (with filters)
- `POST /menu` — Create item (admin)
- `PUT /menu/{id}` — Update item (admin)
- `DELETE /menu/{id}` — Delete item (admin)

Orders
- `GET /orders` — List orders
- `POST /orders` — Create order
- `PATCH /orders/{id}/status` — Update status (admin/cashier)

Inventory
- `GET /inventory` — List stock
- `PATCH /inventory/{id}/adjust` — Adjust stock

Reports (Admin only)
- `GET /reports/sales-summary` — Sales overview
- `GET /reports/daily-sales` — Daily sales chart
- `GET /reports/best-sellers` — Top items
- `GET /reports/category-sales` — Sales by category

Full API Documentation

 Database Schema

Core Tables
1. users — System users (admin, cashier, customer)
2. categories — Menu categories
3. menu_items — Food/drink items with prices & stock
4. orders — Customer orders
5. order_items — Items in an order
6. inventory_logs — Stock change audit trail

Entity Relationship Diagram (ERD)
 Security

Implemented Security Features

Authentication & Authorization
- Bearer token authentication (Sanctum)
- Role-based access control (Admin, Cashier, Customer)
- Password hashing with bcrypt

Input Validation
- Server-side validation on all inputs
- File upload restrictions (image only, max 2MB)
- Prevention of SQL injection via parameterized queries

CORS Protection
- Configured for specific frontend origins
- Credentials supported for authentication

Environment Security
- Sensitive data in `.env` (not version controlled)
- Database credentials protected
- API keys/tokens in environment variables

Data Protection
- Encrypted database transactions
- Foreign key constraints
- Audit trail for inventory changes

Production Recommendations

1. Enable HTTPS
   ```env
   APP_URL=https://yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   ```

2. Update CORS for production domain
   ```php
   'allowed_origins' => ['https://yourdomain.com']
   ```

3. Set strong database password

4. Use environment-specific `.env` files

5. Enable rate limiting on auth endpoints



 Troubleshooting

Backend Issues

 Port 8000 Already in Use
```bash
# Find process using port 8000
netstat -ano | findstr :8000  # Windows

# Kill process or use different port
php artisan serve --port=8001
```

 Database Connection Error
```bash
# Verify MySQL is running
mysql -u root -p

# Check .env credentials
DB_HOST=127.0.0.1
DB_DATABASE=canteen_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

 Migrations Not Running
```bash
# Check migration status
php artisan migrate:status

# Reset and re-run migrations
php artisan migrate:fresh --seed
```



Frontend Issues

 Node modules errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

 Port 3000 Already in Use
```bash
# Use different port
npm run dev -- --port 3001
```

 CORS Errors
```env
# Verify FRONTEND_URL in backend .env
FRONTEND_URL=http://localhost:3000

# And in config/cors.php:
'allowed_origins' => ['http://localhost:3000']
```



API Connection Issues

 Can't reach localhost:8000
-  Backend running? (`php artisan serve`)
- Port correct in `.env`? (`APP_URL=http://localhost:8000`)
-  Firewall blocking? (Allow port 8000)

 401 Unauthorized Error
- Token expired? Re-login
-  Wrong token format? Use `Authorization: Bearer token`
-  Token missing from API calls? Check Axios interceptor



 Development Workflow

Making Changes

1. Backend Changes
   ```bash
   cd canteen-backen
   # Make changes to controllers/models
   php artisan migrate  
   ```

2. Frontend Changes
   ```bash
   cd canteen-frontend
   # Vite auto-reloads on save
   # Check console (F12) for errors
   ```

3. Database Changes
   ```bash
   # Create new migration
   php artisan make:migration create_table_name
   # Edit migration in database/migrations/
   php artisan migrate
   ```

 Testing

Backend Tests
```bash
cd canteen-backend
php artisan test
```

Frontend Tests
```bash
cd canteen-frontend
npm test
```

---

 Deployment

Production Checklist

-  Set `APP_ENV=production` in `.env`
-  Set `APP_DEBUG=false`
-  Generate unique `APP_KEY`: `php artisan key:generate`
-  Update database with production credentials
-  Use HTTPS with valid SSL certificate
-  Update `SANCTUM_STATEFUL_DOMAINS` to production domain
-  Configure CORS for production domain
-  Set strong database password
-  Enable database backups
- [ Configure email for production (if using mail)

Deploy to Server

```bash


# 1. Push to GitHub
git push origin main

# 2. SSH into server
ssh user@server

# 3. Pull latest code
git pull origin main

# 4. Install/update dependencies
composer install --no-dev
npm install --production

# 5. Run migrations
php artisan migrate --force

# 6. Restart services
sudo systemctl restart php-fpm
```



Learning Resources

- Laravel Documentation: https://laravel.com/docs
- React Documentation: https://react.dev
- Tailwind CSS: https://tailwindcss.com/docs
- MySQL Reference: https://dev.mysql.com/doc/


 
 Getting Started

Ready to run the project? Follow these 3 simple steps:

```bash
# 1. Backend
cd canteen-backend && php artisan serve

# 2. Frontend (new terminal)
cd canteen-frontend && npm run dev

# 3. Open browser
# http://localhost:3000 → Login with demo credentials
```
 Welcome to Canteen Management System.



Last Updated: March 14, 2026  
Version: 1.0.0  
Status:  Production Ready
```





# Backend Setup (Laravel)
cd canteen-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

# Frontend Setup (React)
cd canteen-frontend
npm install
cp .env.example .env
npm start
