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
  // Campos específicos para central
  nivel?: string;
  departamento?: string;
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
  // BUSCAR OU CRIAR DADOS DO USUÁRIO NO FIRESTORE
  // ============================================
  const fetchOrCreateUserData = async (uid: string, email: string, telefone?: string): Promise<User | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Documento existe - retornar dados
        const userData = userDoc.data() as User;
        console.log('📦 Dados do usuário carregados:', userData);
        return {
          ...userData,
          id: uid,
          dataCadastro: userData.dataCadastro || new Date()
        };
      } else {
        // Documento NÃO existe - criar um novo com base no contato
        console.log('🆕 Criando novo documento para usuário:', uid);
        
        // Determinar perfil baseado no email/telefone (para desenvolvimento)
        // Em produção, isso viria do registro
        let profile: 'cliente' | 'prestador' | 'central' | 'admin' = 'cliente';
        let status: 'activo' | 'inactivo' | 'pendente' = 'activo';
        let especialidade = '';
        let nivel = '';
        
        // Regras para determinar perfil (ajuste conforme necessário)
        const contacto = email || telefone || '';
        if (contacto.includes('prestador')) {
          profile = 'prestador';
          status = 'pendente'; // Prestadores começam como pendentes
          especialidade = 'Profissional Geral';
        } else if (contacto.includes('central')) {
          profile = 'central';
          nivel = 'Operador';
        } else if (contacto.includes('admin')) {
          profile = 'admin';
        }
        
        const novoUsuario: User = {
          id: uid,
          nome: email ? email.split('@')[0] : (telefone ? `Usuário ${telefone.slice(-4)}` : 'Usuário'),
          email: email || '',
          telefone: telefone || '',
          profile: profile,
          status: status,
          dataCadastro: new Date(),
          ultimoAcesso: new Date(),
          ...(profile === 'prestador' && {
            especialidade: especialidade,
            categoria: 'geral',
            descricao: 'Profissional aguardando aprovação',
            avaliacaoMedia: 0,
            totalAvaliacoes: 0
          }),
          ...(profile === 'cliente' && {
            endereco: '',
            cidade: 'Maputo'
          }),
          ...(profile === 'central' && {
            nivel: nivel,
            departamento: 'Atendimento'
          })
        };
        
        await setDoc(userRef, novoUsuario);
        console.log('✅ Documento criado com sucesso! Perfil:', profile);
        return novoUsuario;
      }
    } catch (error) {
      console.error('Erro ao buscar/criar dados do usuário:', error);
    }
    return null;
  };

  // ============================================
  // ATUALIZAR ÚLTIMO ACESSO
  // ============================================
  const updateLastAccess = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
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
        // Buscar ou criar dados do Firestore
        const userData = await fetchOrCreateUserData(
          firebaseUser.uid, 
          firebaseUser.email || '',
          firebaseUser.phoneNumber || ''
        );
        setUser(userData);
        
        // Atualizar último acesso
        if (userData) {
          await updateLastAccess(firebaseUser.uid);
        }
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
      
      // Buscar ou criar dados do Firestore
      const userData = await fetchOrCreateUserData(
        firebaseUser.uid, 
        firebaseUser.email || '',
        firebaseUser.phoneNumber || ''
      );
      
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
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // ============================================
  // REGISTRO - ACEITA EMAIL OU TELEFONE COMO CONTATO
  // ============================================
  const register = async (userData: any) => {
    try {
      // Determinar o contato principal (email ou telefone)
      const contacto = userData.email || userData.telefone;
      if (!contacto) {
        return { success: false, error: 'É necessário fornecer email ou telefone' };
      }

      console.log('📝 Tentativa de registro com contato:', contacto);
      
      // Para registro com telefone, precisamos gerar um email temporário
      // pois o Firebase Auth requer email
      let email = userData.email;
      let password = userData.password;
      
      // Se não tem email mas tem telefone, criar email temporário
      if (!email && userData.telefone) {
        email = `${userData.telefone.replace(/\D/g, '')}@temp.dexapp.co.mz`;
        // Se não foi fornecida senha, gerar uma padrão
        if (!password) {
          password = 'temp123456';
        }
      }
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      const firebaseUser = userCredential.user;
      
      // Preparar dados para salvar no Firestore
      const userToSave = {
        id: firebaseUser.uid,
        nome: userData.nome,
        email: userData.email || '',  // Pode ser vazio se usou telefone
        telefone: userData.telefone || '',
        profile: userData.profile || 'cliente',
        status: userData.profile === 'prestador' ? 'pendente' : 'activo',
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
          cidade: userData.cidade || 'Maputo'
        }),
        ...(userData.profile === 'central' && {
          nivel: userData.nivel || 'Operador',
          departamento: userData.departamento || 'Atendimento'
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
        errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
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
