import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

// ============================================
// INTERFACES E TIPOS
// ============================================
export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  profile: 'cliente' | 'prestador' | 'central' | 'admin';
  status: 'activo' | 'inactivo' | 'pendente';
  dataCadastro: Date | string;
  ultimoAcesso?: Date | null;
  // Campos específicos para prestador
  especialidade?: string;
  categoria?: string;
  descricao?: string;
  avaliacaoMedia?: number;
  totalAvaliacoes?: number;
  // Campos específicos para cliente
  endereco?: string;
  cidade?: string;
}

interface AuthContextData {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string; userId?: string }>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<User>) => Promise<void>;
}

// ============================================
// CRIAÇÃO DO CONTEXTO
// ============================================
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// ============================================
// HOOK PERSONALIZADO
// ============================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// ============================================
// PROVIDER
// ============================================
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // BUSCAR DADOS DO USUÁRIO NO FIRESTORE
  // ============================================
  const fetchUserData = async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        console.log('📦 Dados do usuário carregados:', userData);
        return {
          ...userData,
          id: uid,
          dataCadastro: userData.dataCadastro || new Date()
        };
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
    return null;
  };

  // ============================================
  // ATUALIZAR ÚLTIMO ACESSO
  // ============================================
  const updateLastAccess = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ultimoAcesso: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar último acesso:', error);
    }
  };

  // ============================================
  // OBSERVADOR DE ESTADO DE AUTENTICAÇÃO
  // ============================================
  useEffect(() => {
    console.log('🔥 Inicializando observador de autenticação...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser?.email || 'null');
      
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Buscar dados do Firestore
        const userData = await fetchUserData(firebaseUser.uid);
        setUser(userData);
        
        // Atualizar último acesso
        await updateLastAccess(firebaseUser.uid);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ============================================
  // LOGIN
  // ============================================
  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentativa de login:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Buscar dados do Firestore
      const userData = await fetchUserData(firebaseUser.uid);
      
      console.log('✅ Login bem-sucedido para:', userData?.profile);
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      
      let errorMessage = 'Erro ao fazer login';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // ============================================
  // REGISTRO
  // ============================================
  const register = async (userData: any) => {
    try {
      console.log('📝 Tentativa de registro:', userData.email);
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      
      const firebaseUser = userCredential.user;
      
      // Preparar dados para salvar no Firestore
      const userToSave = {
        id: firebaseUser.uid,
        nome: userData.nome,
        email: userData.email,
        telefone: userData.telefone || '',
        profile: userData.profile || 'cliente',
        status: 'activo',
        dataCadastro: new Date(),
        ultimoAcesso: new Date(),
        ...(userData.profile === 'prestador' && {
          especialidade: userData.especialidade || '',
          categoria: userData.categoria || '',
          descricao: userData.descricao || '',
          avaliacaoMedia: 0,
          totalAvaliacoes: 0
        }),
        ...(userData.profile === 'cliente' && {
          endereco: userData.endereco || '',
          cidade: userData.cidade || ''
        })
      };
      
      // Salvar no Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), userToSave);
      
      console.log('✅ Registro bem-sucedido para:', userData.profile);
      
      return { success: true, userId: firebaseUser.uid };
    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      
      let errorMessage = 'Erro ao criar conta';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email já está em uso';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // ============================================
  // LOGOUT
  // ============================================
  const logout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      await signOut(auth);
      console.log('✅ Logout bem-sucedido');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  };

  // ============================================
  // ATUALIZAR DADOS DO USUÁRIO
  // ============================================
  const updateUserData = async (data: Partial<User>) => {
    if (!user?.id) return;
    
    try {
      await updateDoc(doc(db, 'users', user.id), data);
      setUser(prev => prev ? { ...prev, ...data } : null);
      console.log('✅ Dados do usuário atualizados:', data);
    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error);
    }
  };

  // ============================================
  // PROVIDER
  // ============================================
  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        register,
        logout,
        updateUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
