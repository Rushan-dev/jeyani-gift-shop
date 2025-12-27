---
name: E-commerce Gift Shop
overview: Build a production-ready full-stack e-commerce gift shop with React frontend, Node.js/Express backend, Firebase authentication, MongoDB database, admin panel, and payment integration. The system will support multiple authentication methods, product management, cart/wishlist, reviews, and order processing.
todos:
  - id: setup-frontend
    content: Initialize React frontend with Vite, install dependencies (react-router-dom, tailwindcss, axios, firebase), configure Tailwind, set up folder structure
    status: completed
  - id: setup-backend
    content: Initialize Node.js/Express backend, install dependencies (express, mongoose, jsonwebtoken, bcryptjs, multer, cloudinary, stripe, cors, dotenv), configure MongoDB connection, create server.js
    status: completed
  - id: firebase-config
    content: Set up Firebase project configuration for email/password, phone OTP, and Google Sign-In. Create Firebase service utilities in frontend
    status: completed
    dependencies:
      - setup-frontend
  - id: backend-auth
    content: Create User model with roles, implement JWT middleware, create auth routes (register, login, verify-otp), handle Firebase token verification
    status: completed
    dependencies:
      - setup-backend
  - id: frontend-auth
    content: Create AuthContext, build registration/login pages with multiple auth methods, implement OTP verification flow, create protected routes
    status: completed
    dependencies:
      - firebase-config
      - backend-auth
  - id: product-models
    content: Create Product and Category models, implement product CRUD routes (admin), add search/filter endpoints, set up Multer + Cloudinary for uploads
    status: completed
    dependencies:
      - setup-backend
  - id: product-ui
    content: Create ProductContext, build ProductListing and ProductDetails pages, implement search and category filtering, create responsive product cards
    status: completed
    dependencies:
      - setup-frontend
      - product-models
  - id: cart-wishlist
    content: Extend User model with cart/wishlist, create cart/wishlist routes, build Cart and Wishlist pages, implement cart persistence
    status: completed
    dependencies:
      - frontend-auth
      - product-ui
  - id: reviews-ratings
    content: Create Review model, add review routes, build Review component with star ratings, display reviews on product details page
    status: completed
    dependencies:
      - product-models
      - frontend-auth
  - id: admin-backend
    content: Create admin middleware, admin product routes (CRUD), admin order routes, payment verification route
    status: completed
    dependencies:
      - backend-auth
      - product-models
  - id: admin-panel
    content: Create AdminDashboard page, build ProductManagement component, OrderManagement component, PaymentVerification component, admin navigation
    status: completed
    dependencies:
      - admin-backend
      - frontend-auth
  - id: order-payment
    content: Create Order model, order routes, integrate Stripe for card payments, handle payment slip upload, build Checkout and OrderConfirmation pages
    status: completed
    dependencies:
      - cart-wishlist
      - admin-backend
  - id: ui-polish
    content: Implement mobile-first responsive design, add loading states, toast notifications, form validation, error pages, optimize images
    status: completed
    dependencies:
      - product-ui
      - cart-wishlist
      - admin-panel
  - id: deployment-config
    content: Create deployment configs for Vercel/Netlify (frontend) and Render/Railway (backend), set up environment variables, create comprehensive README
    status: completed
    dependencies:
      - ui-polish
---

# E-commerce Gift Shop

- Full Stack Implementation Plan

## Project Structure

```javascript
gifts/
├── frontend/                 # React.js application
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Context API (Cart, Auth)
│   │   ├── services/       # API calls, Firebase config
│   │   ├── utils/          # Helper functions
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.js
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, validation, upload
│   │   ├── config/         # DB, JWT config
│   │   └── server.js
│   ├── package.json
│   └── .env.example
└── README.md
```



## Architecture Overview

```mermaid
graph TB
    subgraph frontend [Frontend - React]
        UI[React Components]
        Router[React Router]
        Context[Context API]
        FirebaseAuth[Firebase Auth]
    end
    
    subgraph backend [Backend - Express]
        API[REST API Routes]
        Auth[JWT Middleware]
        Controllers[Controllers]
        Multer[Multer Upload]
    end
    
    subgraph services [External Services]
        Firebase[Firebase Auth]
        MongoDB[(MongoDB Atlas)]
        Cloudinary[Cloudinary]
        Stripe[Stripe API]
    end
    
    UI --> Router
    Router --> Context
    Context --> FirebaseAuth
    Context --> API
    FirebaseAuth --> Firebase
    API --> Auth
    Auth --> Controllers
    Controllers --> MongoDB
    Controllers --> Cloudinary
    Controllers --> Stripe
```



## Implementation Phases

### Phase 1: Project Setup & Configuration

**Frontend Setup:**

- Initialize React app with Vite or Create React App
- Install dependencies: react-router-dom, tailwindcss, axios, firebase
- Configure Tailwind CSS with custom theme
- Set up folder structure and routing

**Backend Setup:**

- Initialize Node.js project with Express
- Install dependencies: express, mongoose, jsonwebtoken, bcryptjs, multer, cloudinary, stripe, cors, dotenv
- Configure MongoDB Atlas connection
- Set up environment variables structure
- Create basic Express server with middleware

### Phase 2: Authentication System

**Firebase Configuration:**

- Set up Firebase project configuration
- Configure Firebase Auth for email/password, phone, and Google Sign-In
- Create Firebase service utilities in frontend

**Backend Auth:**

- Create User model (MongoDB schema) with roles (user/admin)
- Implement JWT token generation and verification middleware
- Create auth routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-otp`
- Handle Firebase token verification and JWT creation
- Implement phone number validation for Sri Lankan format (+94)

**Frontend Auth:**

- Create AuthContext for global auth state
- Build registration page with email/phone options
- Build login page with multiple auth methods
- Implement OTP verification flow
- Create protected route wrapper component

### Phase 3: Product Management

**Backend:**

- Create Product model with fields: name, description, category, images, originalPrice, discountPrice, stock, ratings, reviews
- Create Category model
- Implement product CRUD routes (admin only)
- Add product search and filter endpoints
- Set up Multer + Cloudinary for image uploads

**Frontend:**

- Create ProductContext for product state
- Build ProductListing page with grid layout
- Build ProductDetails page with image gallery
- Implement search functionality
- Implement category filtering
- Create responsive product cards

### Phase 4: Cart & Wishlist

**Backend:**

- Extend User model with cart and wishlist arrays
- Create cart routes: add, remove, update quantity
- Create wishlist routes: add, remove, get

**Frontend:**

- Create CartContext for cart state management
- Build Cart page with quantity controls
- Build Wishlist page
- Add "Add to Cart" and "Buy Now" buttons
- Implement cart persistence (localStorage + backend sync)

### Phase 5: Reviews & Ratings

**Backend:**

- Create Review model (user, product, rating, comment, date)
- Add review routes: create, get by product, update, delete
- Calculate average ratings on products

**Frontend:**

- Build Review component with star ratings
- Display reviews on product details page
- Create review form (authenticated users only)
- Show average rating on product cards

### Phase 6: Admin Panel

**Backend:**

- Create admin middleware to check user role
- Admin product routes: create, update, delete
- Admin order routes: get all orders, update status
- Admin payment verification route

**Frontend:**

- Create AdminDashboard page (protected admin route)
- Build ProductManagement component (CRUD operations)
- Build OrderManagement component with status updates
- Build PaymentVerification component for bank transfers
- Create admin navigation and layout

### Phase 7: Order & Payment System

**Backend:**

- Create Order model (user, products, total, paymentMethod, paymentStatus, orderStatus, paymentSlip)
- Create order routes: create, get user orders, get all orders (admin)
- Integrate Stripe for card payments (test mode)
- Handle payment slip upload for bank transfers
- Implement order status workflow

**Frontend:**

- Build Checkout page with payment method selection
- Integrate Stripe Elements for card payment
- Create payment slip upload component
- Build OrderConfirmation page
- Create OrderHistory page for users

### Phase 8: UI/UX Polish

**Responsive Design:**

- Mobile-first approach with Tailwind breakpoints
- Responsive navigation (hamburger menu for mobile)
- Touch-friendly buttons and inputs
- Optimize images and loading states

**User Experience:**

- Add loading spinners and skeletons
- Implement toast notifications for actions
- Add form validation and error handling
- Create 404 and error pages

### Phase 9: Deployment Configuration

**Frontend (Vercel/Netlify):**

- Create `vercel.json` or `netlify.toml`
- Configure environment variables
- Set up build scripts

**Backend (Render/Railway):**

- Create deployment configuration
- Set up environment variables
- Configure MongoDB Atlas connection string
- Set up Cloudinary credentials

**Documentation:**

- Create comprehensive README with setup instructions
- Document API endpoints
- Include environment variable examples

## Key Files to Create

### Frontend Core Files:

- `frontend/src/App.js` - Main app component with routing
- `frontend/src/context/AuthContext.js` - Authentication state
- `frontend/src/context/CartContext.js` - Cart state management
- `frontend/src/services/api.js` - Axios instance with interceptors
- `frontend/src/services/firebase.js` - Firebase configuration
- `frontend/src/pages/Home.js` - Landing page
- `frontend/src/pages/Products.js` - Product listing with filters
- `frontend/src/pages/ProductDetails.js` - Product detail view
- `frontend/src/pages/Cart.js` - Shopping cart
- `frontend/src/pages/Checkout.js` - Checkout process
- `frontend/src/pages/Admin/Dashboard.js` - Admin dashboard

### Backend Core Files:

- `backend/src/server.js` - Express server setup
- `backend/src/config/database.js` - MongoDB connection
- `backend/src/models/User.js` - User schema
- `backend/src/models/Product.js` - Product schema
- `backend/src/models/Order.js` - Order schema
- `backend/src/models/Review.js` - Review schema
- `backend/src/middleware/auth.js` - JWT verification
- `backend/src/middleware/admin.js` - Admin role check
- `backend/src/middleware/upload.js` - Multer configuration
- `backend/src/routes/auth.js` - Authentication routes
- `backend/src/routes/products.js` - Product routes
- `backend/src/routes/orders.js` - Order routes
- `backend/src/routes/admin.js` - Admin routes

## Sample Data Structure

**Categories:**

- Photo Frames
- Duro Frames (Plymount)
- UV Frames
- Mugs (Normal Mug & Magic Mug)
- Other Gift Items

**Sample Products:**

- Include 2-3 products per category with images, prices, descriptions
- Include sample reviews and ratings

## Security Considerations

- JWT tokens with expiration
- Password hashing (handled by Firebase)