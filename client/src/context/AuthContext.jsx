import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState(null);

  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    try {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName,
        photoURL: userCredential.user.photoURL || null,
        status: 'online',
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp()
      });
      console.log('✅ User document created in Firestore:', email);
    } catch (error) {
      console.error('❌ Failed to create user document:', error.message);
    }
    
    return userCredential;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update user status
    try {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        status: 'online',
        lastSeen: serverTimestamp()
      }, { merge: true });
      console.log('✅ User status updated in Firestore:', email);
    } catch (error) {
      console.error('❌ Failed to update user status:', error.message);
    }
    
    return userCredential;
  };

  const loginWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    
    // Check if user document exists, if not create it
    try {
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          status: 'online',
          createdAt: serverTimestamp(),
          lastSeen: serverTimestamp()
        });
        console.log('✅ Google user document created in Firestore:', userCredential.user.email);
      } else {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          status: 'online',
          lastSeen: serverTimestamp()
        }, { merge: true });
        console.log('✅ Google user status updated in Firestore:', userCredential.user.email);
      }
    } catch (error) {
      console.error('❌ Failed to create/update Google user:', error.message);
    }
    
    return userCredential;
  };

  const logout = async () => {
    if (currentUser) {
      await setDoc(doc(db, 'users', currentUser.uid), {
        status: 'offline',
        lastSeen: serverTimestamp()
      }, { merge: true });
    }
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get fresh ID token
        const token = await user.getIdToken();
        setIdToken(token);
        setCurrentUser(user);
        
        // Auto-fix: Ensure user document has displayName
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // If displayName is missing or empty, update it
            if (!userData.displayName || userData.displayName.trim() === '') {
              const newDisplayName = user.displayName || user.email?.split('@')[0] || 'User';
              await setDoc(doc(db, 'users', user.uid), {
                displayName: newDisplayName,
                lastSeen: serverTimestamp()
              }, { merge: true });
              console.log('✅ Auto-fixed missing displayName for:', user.email, '→', newDisplayName);
            }
          }
        } catch (error) {
          console.error('❌ Failed to check/update displayName:', error.message);
        }
      } else {
        setIdToken(null);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Refresh token periodically
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(async () => {
        const token = await currentUser.getIdToken(true);
        setIdToken(token);
      }, 55 * 60 * 1000); // Refresh every 55 minutes

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const value = {
    currentUser,
    idToken,
    signup,
    login,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

