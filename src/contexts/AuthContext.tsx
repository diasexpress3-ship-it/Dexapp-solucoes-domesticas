import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
  status: 'activo' | 'inactivo' | 'pendente' | 'pendente_documentos' | 'rejeitado';
  dataCadastro: Date | string;
  ultimoAcesso?: Date | null;
  
  // Campos específicos para prestador
  especialidade?: string;
  categoria?: string;
  descricao?: string;
  experiencia?: string;
  avaliacaoMedia?: number;
  totalAvaliacoes?: number;
  valorHora?: number;
  endereco?: string;
  cidade?: string;
  documentos?: {
    bi?: { nome: string; tipo: string; dataUpload: Date };
    declaracaoBairro?: { nome: string; tipo: string; dataUpload: Date };
  };
  totalGanho?: number;
  servicosConcluidos?: number;
  
  // Campos específicos para cliente
  enderecoCliente?: string;
  cidadeCliente?: string;
  
  // Campos específicos para central/admin
  nivel?: string;
  departamento?: string;
  permissoes?: {
    usuarios?: boolean;
    prestadores?: boolean;
    solicitacoes?: boolean;
    pagamentos?: boolean;
    relatorios?: boolean;
    configuracoes?: boolean;
  };
  
  // Metadados
  criadoPor?: string;
  criadoPorNome?: string;
  dataAprovacao?: Date;
  aprovadoPor?: string;
  dataRejeicao?: Date;
  rejeitadoPor?: string;
  observacao?: string;
}

interface AuthContextData {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string; userId?: string }>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<User>) => Promise<void>;
  updateUserProfile: (data: { nome?: string; foto?: string }) => Promise<{ success: boolean; error?: string }>;
  updateUserEmail: (newEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshUserData: () => Promise<void>;
  isAdmin: boolean;
  isPrestador: boolean;
  isCliente: boolean;
  isCentral: boolean;
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
        // Documento NÃO existe - criar um novo
        console.log('🆕 Criando novo documento para usuário:', uid);
        
        // Determinar perfil baseado no email
        let profile: 'cliente' | 'prestador' | 'central' | 'admin' = 'cliente';
        let status: 'activo' | 'inactivo' | 'pendente' | 'pendente_documentos' = 'activo';
        let especialidade = '';
        let nivel = '';
        
        const contacto = email || telefone || '';
        if (contacto.includes('prestador')) {
          profile = 'prestador';
          status = 'pendente';
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
            totalAvaliacoes: 0,
            valorHora: 500,
            endereco: '',
            cidade: 'Maputo'
          }),
          ...(profile === 'cliente' && {
            enderecoCliente: '',
            cidadeCliente: 'Maputo'
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
  // REGISTRO
  // ============================================
  const register = async (userData: any) => {
    try {
      const contacto = userData.email || userData.telefone;
      if (!contacto) {
        return { success: false, error: 'É necessário fornecer email ou telefone' };
      }

      console.log('📝 Tentativa de registro com contato:', contacto);
      
      let email = userData.email;
      let password = userData.password;
      
      // Se não tem email mas tem telefone, criar email temporário
      if (!email && userData.telefone) {
        email = `${userData.telefone.replace(/\D/g, '')}@temp.dexapp.co.mz`;
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
      const userToSave: any = {
        id: firebaseUser.uid,
        nome: userData.nome,
        email: userData.email || '',
        telefone: userData.telefone || '',
        profile: userData.profile || 'cliente',
        status: userData.status || (userData.profile === 'prestador' ? 'pendente' : 'activo'),
        dataCadastro: new Date(),
        ultimoAcesso: new Date(),
      };

      // Adicionar campos específicos por perfil
      if (userData.profile === 'prestador') {
        userToSave.especialidade = userData.especialidade || '';
        userToSave.categoria = userData.categoria || '';
        userToSave.descricao = userData.descricao || '';
        userToSave.experiencia = userData.experiencia || '';
        userToSave.avaliacaoMedia = 0;
        userToSave.totalAvaliacoes = 0;
        userToSave.valorHora = userData.valorHora || 500;
        userToSave.endereco = userData.endereco || '';
        userToSave.cidade = userData.cidade || 'Maputo';
        userToSave.totalGanho = 0;
        userToSave.servicosConcluidos = 0;
        
        if (userData.documentos) {
          userToSave.documentos = userData.documentos;
        }
      }

      if (userData.profile === 'cliente') {
        userToSave.enderecoCliente = userData.endereco || '';
        userToSave.cidadeCliente = userData.cidade || 'Maputo';
      }

      if (userData.profile === 'central') {
        userToSave.nivel = userData.nivel || 'Operador';
        userToSave.departamento = userData.departamento || 'Atendimento';
      }

      if (userData.profile === 'admin') {
        userToSave.nivel = userData.nivel || 'Master';
        userToSave.departamento = userData.departamento || 'Administração';
        userToSave.permissoes = userData.permissoes || {
          usuarios: true,
          prestadores: true,
          solicitacoes: true,
          pagamentos: true,
          relatorios: true,
          configuracoes: true
        };
      }

      // Metadados de criação
      if (userData.criadoPor) {
        userToSave.criadoPor = userData.criadoPor;
        userToSave.criadoPorNome = userData.criadoPorNome;
      }
      
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
      await updateDoc(doc(db, 'users', user.id), {
        ...data,
        updatedAt: new Date()
      });
      setUser(prev => prev ? { ...prev, ...data } : null);
      console.log('✅ Dados do usuário atualizados:', data);
    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error);
    }
  };

  // ============================================
  // ATUALIZAR PERFIL (NOME/FOTO)
  // ============================================
  const updateUserProfile = async (data: { nome?: string; foto?: string }) => {
    if (!firebaseUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      if (data.nome) {
        await updateProfile(firebaseUser, {
          displayName: data.nome,
          photoURL: data.foto || firebaseUser.photoURL
        });
      }

      if (data.foto) {
        await updateProfile(firebaseUser, {
          photoURL: data.foto
        });
      }

      if (data.nome && user) {
        await updateUserData({ nome: data.nome });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // ATUALIZAR EMAIL
  // ============================================
  const updateUserEmail = async (newEmail: string, password: string) => {
    if (!firebaseUser || !user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      // Reautenticar usuário
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(firebaseUser, credential);
      
      // Atualizar email
      await updateEmail(firebaseUser, newEmail);
      
      // Atualizar no Firestore
      await updateUserData({ email: newEmail });
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar email:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // ATUALIZAR SENHA
  // ============================================
  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!firebaseUser || !user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      // Reautenticar usuário
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      
      // Atualizar senha
      await updatePassword(firebaseUser, newPassword);
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // REDEFINIR SENHA
  // ============================================
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao enviar email de redefinição:', error);
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // ATUALIZAR DADOS DO USUÁRIO
  // ============================================
  const refreshUserData = async () => {
    if (!firebaseUser) return;

    try {
      const userData = await fetchOrCreateUserData(
        firebaseUser.uid,
        firebaseUser.email || '',
        firebaseUser.phoneNumber || ''
      );
      setUser(userData);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  };

  // ============================================
  // HELPERS
  // ============================================
  const isAdmin = user?.profile === 'admin';
  const isPrestador = user?.profile === 'prestador';
  const isCliente = user?.profile === 'cliente';
  const isCentral = user?.profile === 'central';

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
        updateUserData,
        updateUserProfile,
        updateUserEmail,
        updateUserPassword,
        resetPassword,
        refreshUserData,
        isAdmin,
        isPrestador,
        isCliente,
        isCentral
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
