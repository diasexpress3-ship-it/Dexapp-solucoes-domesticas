import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAFRs_NG8CQzi1KxuQjqKPuYjMKBDzwHmw",
  authDomain: "dexapp---solucoes-domesticas.firebaseapp.com",
  projectId: "dexapp---solucoes-domesticas",
  storageBucket: "dexapp---solucoes-domesticas.firebasestorage.app",
  messagingSenderId: "378106336470",
  appId: "1:378106336470:web:2943cfc10ae46fd7056577"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// UID fornecido por você
const uid = "MRFat1RdtmUFraxHPA5WCEe8Nbx2";

const adminData = {
  id: uid,
  nome: 'Administrador',
  email: 'startbusiness26@gmail.com',
  profile: 'admin',
  status: 'ativo',
  dataCadastro: new Date().toISOString(),
  ultimoAcesso: null,
  telefone: ''
};

const createAdmin = async () => {
  try {
    console.log('🔄 A criar documento com UID:', uid);
    console.log('📦 Dados:', adminData);
    
    if (!uid) {
      console.error('❌ UID não pode estar vazio!');
      return;
    }
    
    await setDoc(doc(db, 'users', uid), adminData);
    
    console.log('✅ Admin criado com sucesso!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Senha: Sahombe13');
    console.log('📁 Coleção: users');
    console.log('🆔 UID:', uid);
  } catch (error) {
    console.error('❌ Erro detalhado:', error);
    console.error('Código:', error.code);
    console.error('Mensagem:', error.message);
  }
};

// Executar a função
createAdmin();
