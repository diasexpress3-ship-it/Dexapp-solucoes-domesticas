import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../services/firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: Partial<User>, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      console.log('Auth state changed:', fUser?.email);
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            console.log('User data loaded:', userData);
            setUser(userData);
          } else {
            console.warn('User document not found for:', fUser.uid);
            setUser(null);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${fUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      console.log('Login attempt:', email);
      await signInWithEmailAndPassword(auth, email, pass);
      console.log('Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: Partial<User>, pass: string) => {
    const email = userData.email || `${userData.telefone}@temp.dex.co.mz`;
    try {
      console.log('Register attempt:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const newUser: User = {
        id: userCredential.user.uid,
        nome: userData.nome || '',
        email: email,
        telefone: userData.telefone || '',
        role: userData.role || 'cliente',
        status: userData.role === 'prestador' ? 'pendente' : 'ativo',
        dataCadastro: new Date(),
        ...userData
      } as User;
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...newUser,
        dataCadastro: serverTimestamp()
      });
      
      setUser(newUser);
      console.log('Register successful');
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
