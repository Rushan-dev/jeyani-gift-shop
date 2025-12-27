import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables (in case they weren't loaded yet)
dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Process private key - handle both \n escape sequences and actual newlines
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) {
      // Remove surrounding quotes if present
      privateKey = privateKey.replace(/^["']|["']$/g, '');
      // Replace \n escape sequences with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      // If it doesn't contain newlines, it might be on one line - that's okay
    }
    
    // Debug logging
    console.log('Firebase Admin initialization check:');
    console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing');
    console.log('- FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? `✓ Set (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : '✗ Missing');
    console.log('- FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✓ Set' : '✗ Missing');
    console.log('- Private key after processing:', privateKey ? `✓ Valid (${privateKey.length} chars)` : '✗ Invalid');
    
    if (!process.env.FIREBASE_PROJECT_ID || !privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
      console.error('❌ Firebase Admin credentials not fully configured!');
      console.error('Missing:');
      if (!process.env.FIREBASE_PROJECT_ID) console.error('  - FIREBASE_PROJECT_ID');
      if (!privateKey) console.error('  - FIREBASE_PRIVATE_KEY (or invalid format)');
      if (!process.env.FIREBASE_CLIENT_EMAIL) console.error('  - FIREBASE_CLIENT_EMAIL');
      console.error('Please check your backend/.env file');
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        })
      });
      console.log('✅ Firebase Admin initialized successfully');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    console.error('Error details:', error);
  }
}

export default admin;

