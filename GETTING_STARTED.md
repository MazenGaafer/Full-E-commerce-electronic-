# 🚀 Getting Started - Electronics E-Commerce Platform

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MySQL** (v8 or higher)
- **npm** (comes with Node.js)

## 📥 Installation

### 1. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Setup MySQL Database
```sql
-- Create database
CREATE DATABASE electronics_store;
```

### 3. Configure Environment
Update the `.env` file with your MySQL credentials:
```env
DATABASE_URL="mysql://root:your_password@localhost:3306/electronics_store"
```

### 4. Setup Database Schema
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with sample data
npm run prisma:seed
```

### 5. Start the Application
```bash
# Start both backend and frontend
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:5173/admin

## 🔐 Login Credentials

### Admin Account
- **Email**: admin@electronics.com
- **Password**: Admin@123456

### Customer Account
- Register at http://localhost:5173/register

## 🎉 You're Ready!

Your development environment is now ready. Start exploring and building!

**Happy coding! 🚀**