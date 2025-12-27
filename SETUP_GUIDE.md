# Environment Variables Setup Guide

## ✅ Step 1: Frontend `.env` File

Create a file named `.env` in the `frontend/` folder with these contents:

```env
VITE_FIREBASE_API_KEY=AIzaSyDMKmxLec3G6Bh_eA2NOILENqdGIyFc30w
VITE_FIREBASE_AUTH_DOMAIN=jeyani-gift-shop.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jeyani-gift-shop
VITE_FIREBASE_STORAGE_BUCKET=jeyani-gift-shop.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=654150289498
VITE_FIREBASE_APP_ID=1:654150289498:web:ac1ab5b2e3c9f8c3dcb063
VITE_API_URL=http://localhost:5000/api
```

## ✅ Step 2: Backend `.env` File

Create a file named `.env` in the `backend/` folder with these contents:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
# ⚠️ TODO: Replace with your MongoDB Atlas connection string (see instructions below)
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT
# ✅ Generated JWT Secret (use this one):
JWT_SECRET=c18705ad9e8b8f55745580f8cde69ac160ae4de39b26c9bf4d8400ec8d6cf66671b3d6f92592ba09d8dfa2136328349ac955566eabdc2faf5e85483985b46e4a
JWT_EXPIRE=7d

# Firebase Admin
# ⚠️ TODO: Get these from Firebase Console > Project Settings > Service Accounts
FIREBASE_PROJECT_ID=jeyani-gift-shop
FIREBASE_PRIVATE_KEY=your_firebase_private_key_here
FIREBASE_CLIENT_EMAIL=your_firebase_client_email_here

# Cloudinary
# ⚠️ TODO: Get these from Cloudinary Dashboard (see instructions below)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe
# ⚠️ TODO: Get these from Stripe Dashboard (see instructions below)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

---

## 📋 Remaining Setup Steps

### 1. MongoDB Atlas Setup

**Step-by-step:**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a **FREE M0 cluster**:
   - Click "Build a Database"
   - Choose "M0 FREE" tier
   - Select a region close to you
   - Click "Create"
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Enter username and password (save these!)
   - Set privileges to "Atlas admin"
   - Click "Add User"
5. Whitelist IP address:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Click "Confirm"
6. Get connection string:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<username>` and `<password>` with your database user credentials
   - Add database name: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/giftshop?retryWrites=true&w=majority`
7. Update `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/giftshop?retryWrites=true&w=majority
   ```

---

### 2. Firebase Admin Setup (Backend)

**Step-by-step:**
1. Go to https://console.firebase.google.com/project/jeyani-gift-shop/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Click "Generate key" (downloads a JSON file)
4. Open the JSON file and extract these values:
   - `project_id` → Use as `FIREBASE_PROJECT_ID` (already set to `jeyani-gift-shop`)
   - `private_key` → Copy the entire value including `\n` characters
   - `client_email` → Copy the email address
5. Update `backend/.env`:
   ```env
   FIREBASE_PROJECT_ID=jeyani-gift-shop
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@jeyani-gift-shop.iam.gserviceaccount.com
   ```
   **Important:** Keep the quotes around `FIREBASE_PRIVATE_KEY` and preserve all `\n` characters!

**Enable Authentication Methods:**
1. Go to https://console.firebase.google.com/project/jeyani-gift-shop/authentication
2. Click "Get started"
3. Enable these providers:
   - **Email/Password**: Click → Enable → Save
   - **Phone**: Click → Enable → Follow reCAPTCHA setup → Save
   - **Google**: Click → Enable → Add support email → Save

---

### 3. Cloudinary Setup

**Step-by-step:**
1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account
3. After login, you'll see your Dashboard
4. Copy these values from the Dashboard:
   - **Cloud Name** (e.g., "dxxxxx")
   - **API Key** (e.g., "123456789012345")
   - **API Secret** (e.g., "abcdefghijklmnopqrstuvwxyz")
5. Update `backend/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name_from_dashboard
   CLOUDINARY_API_KEY=your_api_key_from_dashboard
   CLOUDINARY_API_SECRET=your_api_secret_from_dashboard
   ```

---

### 4. Stripe Setup

**Step-by-step:**
1. Go to https://dashboard.stripe.com/register
2. Sign up for a free account
3. You'll be in **Test Mode** by default (perfect for development)
4. Get your API keys:
   - Go to "Developers" → "API keys"
   - Copy the **Secret key** (starts with `sk_test_...`)
5. Set up webhook (optional for now, needed for production):
   - Go to "Developers" → "Webhooks"
   - Click "Add endpoint"
   - URL: `https://your-backend-url.com/api/orders/webhook`
   - Select event: `payment_intent.succeeded`
   - Copy the "Signing secret" (starts with `whsec_...`)
6. Update `backend/.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```
   **Note:** For development, you can leave `STRIPE_WEBHOOK_SECRET` empty or use a placeholder.

**Test Cards (for testing):**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any future expiry date and any CVC

---

## ✅ Quick Checklist

- [x] Frontend `.env` file created with Firebase config
- [x] Backend `.env` file created with JWT secret
- [ ] MongoDB Atlas cluster created and connection string added
- [ ] Firebase Admin credentials added to backend `.env`
- [ ] Firebase Authentication methods enabled (Email, Phone, Google)
- [ ] Cloudinary account created and credentials added
- [ ] Stripe account created and test keys added

---

## 🚀 After Setup

1. **Seed initial categories:**
   ```bash
   cd backend
   npm run seed:categories
   ```

2. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Create an admin user:**
   - Register a user through the app
   - In MongoDB Atlas, update the user role:
     ```javascript
     db.users.updateOne(
       { email: "your-admin-email@example.com" },
       { $set: { role: "admin" } }
     )
     ```

---

## 🆘 Troubleshooting

**Firebase Authentication not working?**
- Make sure you've enabled Email/Password, Phone, and Google in Firebase Console
- Check that your `.env` variables are correct
- Restart your development server after changing `.env` files

**MongoDB connection failed?**
- Verify your connection string has the correct username/password
- Check that your IP is whitelisted in MongoDB Atlas
- Make sure the database name is included in the connection string

**Cloudinary uploads failing?**
- Verify your API credentials are correct
- Check that your Cloudinary account is active

**Stripe payments not working?**
- Make sure you're using test mode keys (start with `sk_test_`)
- Use test card numbers for testing

---

## 📝 Notes

- Never commit `.env` files to version control (they're already in `.gitignore`)
- For production deployment, add these environment variables to your hosting platform
- Keep your secrets secure and never share them publicly

