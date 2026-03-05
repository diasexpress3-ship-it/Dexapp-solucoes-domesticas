import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "dex-solucoes-domesticas-2b983.firebaseapp.com",
  projectId: "dex-solucoes-domesticas-2b983",
  storageBucket: "dex-solucoes-domesticas-2b983.firebasestorage.app",
  messagingSenderId: "seu-sender-id",
  appId: "seu-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const uid = 'GOZTOfdSOFV3wHD8dY0xV6...'; // UID completo da imagem

const adminData = {
  id: uid,
  nome: 'Administrador',
  email: 'startbusiness26@gmail.com',
  profile: 'admin',
  status: 'ativo',
  dataCadastro: '2026-03-04T00:00:00.000Z', // Data fixa de 04/03/2026
  ultimoAcesso: null,
  telefone: ''
};

const createAdmin = async () => {
  try {
    await setDoc(doc(db, 'users', uid), adminData);
    console.log('✅ Admin criado com sucesso!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Senha: Sahombe13');
  } catch (error) {
    console.error('❌ Erro:', error);
  }
};

createAdmin();
