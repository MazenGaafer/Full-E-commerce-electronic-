# Electronics E-Commerce Platform

A full-stack electronics e-commerce platform built with React, Node.js, Express, MySQL, and Prisma.

## 🚀 Features

### Customer Features
- Browse electronics by categories (Smartphones, Laptops, Tablets, Gaming, Accessories)
- Advanced filtering (Brand, Price range, RAM, Storage, Processor, Graphics Card, Screen size)
- Product comparison (up to 3 items)
- Detailed product pages with technical specifications
- Product reviews and ratings
- Shopping cart management
- Secure checkout with multiple payment methods
- Order tracking
- User authentication and profile management

### Admin Features
- Dashboard with analytics
- Product management (CRUD operations)
- Category and brand management
- Order management with status updates
- User management
- Image upload for products
- Technical specifications management

### Security Features
- JWT authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- Secure HTTP headers with Helmet
- Protected routes

## 📁 Project Structure

```
electronics-ecommerce/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── category.controller.js
│   │   ├── brand.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   ├── review.controller.js
│   │   └── user.controller.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   ├── upload.js
│   │   └── validate.js
│   ├── routes/               # API routes
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── category.routes.js
│   │   ├── brand.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── review.routes.js
│   │   └── user.routes.js
│   └── server.js             # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── layouts/          # Layout components
│   │   │   ├── MainLayout.jsx
│   │   │   └── AdminLayout.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   ├── Compare.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Products.jsx
│   │   │       ├── Orders.jsx
│   │   │       ├── Categories.jsx
│   │   │       ├── Brands.jsx
│   │   │       └── Users.jsx
│   │   ├── services/         # API services
│   │   │   └── api.js
│   │   ├── store/            # State management (Zustand)
│   │   │   ├── authStore.js
│   │   │   ├── cartStore.js
│   │   │   └── compareStore.js
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── prisma/
│   └── schema.prisma         # Database schema
├── uploads/                  # Uploaded images
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **Morgan** - Logging

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd electronics-ecommerce
```

### Step 2: Setup Backend

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Step 3: Configure Environment Variables

Edit `.env` file:

```env
PORT=5000
NODE_ENV=development

# Database - Update with your MySQL credentials
DATABASE_URL="mysql://username:password@localhost:3306/electronics_store"

# JWT Secret - Change this to a secure random string
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Stripe (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Frontend URL
CLIENT_URL=http://localhost:5173

# Admin Credentials
ADMIN_EMAIL=admin@electronics.com
ADMIN_PASSWORD=Admin@123456
```

### Step 4: Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### Step 5: Setup Frontend

```bash
cd frontend
npm install
```

### Step 6: Run the Application

#### Option 1: Run Both (from root directory)
```bash
npm run dev
```

#### Option 2: Run Separately

**Backend:**
```bash
npm run server
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Prisma Studio: http://localhost:5555

## 🗄️ Database Schema

### Key Models

**User**
- Authentication and profile information
- Roles: CUSTOMER, ADMIN

**Product**
- Product details (name, description, price, stock)
- Relations: Category, Brand, Images, Specifications

**ProductSpecification**
- Technical specs (RAM, Storage, Processor, etc.)
- Grouped by category (Performance, Display, Battery)

**Category & Brand**
- Product organization

**Cart & CartItem**
- Shopping cart functionality

**Order & OrderItem**
- Order management
- Status tracking (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)

**Review**
- Product reviews and ratings (1-5 stars)

## 🔐 API Endpoints

### Authentication
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/profile       - Get user profile (Protected)
PUT    /api/auth/profile       - Update profile (Protected)
```

### Products
```
GET    /api/products           - Get all products (with filters)
GET    /api/products/featured  - Get featured products
GET    /api/products/compare   - Compare products
GET    /api/products/:id       - Get product by ID
POST   /api/products           - Create product (Admin)
PUT    /api/products/:id       - Update product (Admin)
DELETE /api/products/:id       - Delete product (Admin)
```

### Categories
```
GET    /api/categories         - Get all categories
GET    /api/categories/:id     - Get category by ID
POST   /api/categories         - Create category (Admin)
PUT    /api/categories/:id     - Update category (Admin)
DELETE /api/categories/:id     - Delete category (Admin)
```

### Brands
```
GET    /api/brands             - Get all brands
GET    /api/brands/:id         - Get brand by ID
POST   /api/brands             - Create brand (Admin)
PUT    /api/brands/:id         - Update brand (Admin)
DELETE /api/brands/:id         - Delete brand (Admin)
```

### Cart
```
GET    /api/cart               - Get user cart (Protected)
POST   /api/cart               - Add to cart (Protected)
PUT    /api/cart/:productId    - Update cart item (Protected)
DELETE /api/cart/:productId    - Remove from cart (Protected)
DELETE /api/cart               - Clear cart (Protected)
```

### Orders
```
POST   /api/orders             - Create order (Protected)
GET    /api/orders             - Get all orders (Admin)
GET    /api/orders/my-orders   - Get user orders (Protected)
GET    /api/orders/:id         - Get order by ID (Protected)
PUT    /api/orders/:id/status  - Update order status (Admin)
```

### Reviews
```
POST   /api/reviews            - Create review (Protected)
GET    /api/reviews/product/:id - Get product reviews
DELETE /api/reviews/:id        - Delete review (Protected/Admin)
```

### Users (Admin)
```
GET    /api/users              - Get all users (Admin)
GET    /api/users/:id          - Get user by ID (Admin)
PUT    /api/users/:id          - Update user (Admin)
DELETE /api/users/:id          - Delete user (Admin)
```

## 🎨 Frontend Routes

### Public Routes
```
/                    - Home page
/products            - Products listing with filters
/products/:id        - Product detail page
/compare             - Product comparison
/login               - Login page
/register            - Register page
```

### Protected Routes (Customer)
```
/cart                - Shopping cart
/checkout            - Checkout page
/profile             - User profile
/orders              - Order history
/orders/:id          - Order details
```

### Admin Routes
```
/admin               - Admin dashboard
/admin/products      - Manage products
/admin/orders        - Manage orders
/admin/categories    - Manage categories
/admin/brands        - Manage brands
/admin/users         - Manage users
```

## 🔧 Advanced Features Implementation

### Product Filtering
Products can be filtered by:
- Category
- Brand
- Price range (min/max)
- Search term
- Technical specs (RAM, Storage, Processor, Screen size)
- Sort by (price, date, rating)

### Product Comparison
- Compare up to 3 products side by side
- View specifications in table format
- Compare prices, ratings, and features

### Review System
- Users can only review purchased products
- One review per product per user
- Rating distribution display
- Average rating calculation

### Security Features
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with expiration
- Protected routes (authentication required)
- Admin-only routes (role-based access)
- Input validation on all forms
- Rate limiting (100 requests per 15 minutes)
- Helmet for security headers
- CORS configuration

## 🚢 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment variables
2. Update `DATABASE_URL` with production database
3. Update `CLIENT_URL` with production frontend URL
4. Deploy to services like Heroku, Railway, or DigitalOcean

### Frontend Deployment
```bash
cd frontend
npm run build
```
Deploy the `dist` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront

### Database
- Use managed MySQL service (AWS RDS, PlanetScale, etc.)
- Run migrations: `npx prisma migrate deploy`

## 📝 Sample Data

To create sample data for testing:

1. Create an admin user manually or via Prisma Studio
2. Use the admin panel to create:
   - Categories (Smartphones, Laptops, etc.)
   - Brands (Apple, Samsung, HP, etc.)
   - Products with specifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

ISC License

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### Prisma Issues
```bash
npx prisma generate
npx prisma migrate reset
```

### Port Already in Use
- Change PORT in .env (backend)
- Change port in vite.config.js (frontend)

## 📧 Support

For support, email support@electroshop.com or create an issue in the repository.

---

Built with ❤️ for electronics enthusiasts
#   F u l l - E - c o m m e r c e - e l e c t r o n i c -  
 