import { createContext, useContext, useState, useEffect } from 'react';
import { 
  registerWithEmail,
  loginWithEmail, 
  loginWithPhone, 
  loginWithGoogle, 
  verifyPhoneOTP,
  signOut as firebaseSignOut,
  setUpRecaptcha
} from '../services/firebase.js';
import api from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  // Set up recaptcha for phone auth
  const setupRecaptcha = () => {
    if (!recaptchaVerifier) {
      const verifier = setUpRecaptcha('recaptcha-container');
      setRecaptchaVerifier(verifier);
      return verifier;
    }
    return recaptchaVerifier;
  };

  // Register with email
  const register = async (email, password, name) => {
    try {
      const { user: firebaseUser, error: firebaseError } = await registerWithEmail(email, password);
      
      if (firebaseError) {
        // If user exists, try login instead
        if (firebaseError.includes('already-in-use')) {
          return { error: 'Email already registered. Please login instead.' };
        }
        return { error: firebaseError };
      }

      // Get Firebase ID token
      const firebaseToken = await firebaseUser.getIdToken();

      // Register with backend
      const response = await api.post('/auth/register', { firebaseToken });

      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { user: userData, error: null };
    } catch (error) {
      return { user: null, error: error.response?.data?.message || error.message };
    }
  };

  // Login with email
  const login = async (email, password) => {
    try {
      const { user: firebaseUser, error: firebaseError } = await loginWithEmail(email, password);
      
      if (firebaseError) {
        return { error: firebaseError };
      }

      // Get Firebase ID token
      const firebaseToken = await firebaseUser.getIdToken();

      // Login with backend
      const response = await api.post('/auth/login', { firebaseToken });

      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { user: userData, error: null };
    } catch (error) {
      return { user: null, error: error.response?.data?.message || error.message };
    }
  };

  // Login with phone (send OTP)
  const loginWithPhoneNumber = async (phoneNumber) => {
    try {
      // Format phone number for Sri Lanka
      let formattedPhone = phoneNumber.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = `+94${formattedPhone.substring(1)}`;
      } else if (!formattedPhone.startsWith('94')) {
        formattedPhone = `+94${formattedPhone}`;
      } else {
        formattedPhone = `+${formattedPhone}`;
      }

      const verifier = setupRecaptcha();
      const { confirmationResult: result, error } = await loginWithPhone(formattedPhone, verifier);
      
      if (error) {
        return { error };
      }

      setConfirmationResult(result);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Verify phone OTP
  const verifyOTP = async (otp) => {
    try {
      if (!confirmationResult) {
        return { error: 'No OTP sent. Please request OTP first.' };
      }

      const { user: firebaseUser, error: firebaseError } = await verifyPhoneOTP(confirmationResult, otp);
      
      if (firebaseError) {
        return { error: firebaseError };
      }

      // Get Firebase ID token
      const firebaseToken = await firebaseUser.getIdToken();

      // Login with backend
      const response = await api.post('/auth/login', { firebaseToken });

      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setConfirmationResult(null);

      return { user: userData, error: null };
    } catch (error) {
      return { user: null, error: error.response?.data?.message || error.message };
    }
  };

  // Login with Google
  const loginWithGoogleAuth = async () => {
    try {
      const { user: firebaseUser, error: firebaseError } = await loginWithGoogle();
      
      if (firebaseError) {
        return { error: firebaseError };
      }

      // Get Firebase ID token
      const firebaseToken = await firebaseUser.getIdToken();

      // Login with backend
      const response = await api.post('/auth/login', { firebaseToken });

      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { user: userData, error: null };
    } catch (error) {
      return { user: null, error: error.response?.data?.message || error.message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setConfirmationResult(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    loginWithPhoneNumber,
    verifyOTP,
    loginWithGoogleAuth,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <div id="recaptcha-container"></div>
    </AuthContext.Provider>
  );
};

