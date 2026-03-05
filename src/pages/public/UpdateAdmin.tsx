import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, AlertCircle, CheckCircle, 
  XCircle, Loader2, Mail, Lock, User,
  ArrowRight, Home
} from 'lucide-react';
import { auth, db } from '../../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { AppLayout } from '../../components/layout/AppLayout';

export default function UpdateAdmin() {
  const [status, setStatus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌'
    }[type];
    setStatus(prev => [...prev, `${emoji} ${message}`]);
  };

  const clearLogs = () => {
    setStatus([]);
  };

  const executeUpdate = async () => {
    setLoading(true);
    setSuccess(false);
    clearLogs();
    
    addLog('Iniciando processo de atualização do administrador...', 'info');

    try {
      // 1️⃣ Verificar se usuário existe e apagar
      addLog('Verificando usuário existente...', 'info');
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, 'startbusiness26@gmail.com', 'Sahombe13');
        const oldUser = userCredential.user;
        addLog(`Usuário encontrado com UID: ${oldUser.uid}`, 'info');
        
        addLog('Apagando usuário antigo...', 'info');
        await oldUser.delete();
        addLog('Usuário antigo apagado com sucesso!', 'success');
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          addLog('Usuário não existe. Prosseguindo com criação...', 'info');
        } else {
          addLog(`Erro ao verificar usuário: ${error.message}`, 'error');
        }
      }

      // 2️⃣ Criar novo usuário
      addLog('Criando novo usuário no Authentication...', 'info');
      const userCredential = await createUserWithEmailAndPassword(auth, 'startbusiness26@gmail.com', 'Sahombe13');
      const newUser = userCredential.user;
      
      addLog(`✅ Novo usuário criado!`, 'success');
      addLog(`📧 Email: ${newUser.email}`, 'success');
      addLog(`🆔 Novo UID: ${newUser.uid}`, 'success');

      // 3️⃣ Criar documento no Firestore
      addLog('Criando documento no Firestore...', 'info');
      
      const adminData = {
        id: newUser.uid,
        nome: 'Administrador',
        email: 'startbusiness26@gmail.com',
        profile: 'admin',
        status: 'ativo',
        dataCadastro: new Date().toISOString(),
        ultimoAcesso: null,
        telefone: ''
      };

      await setDoc(doc(db, 'users', newUser.uid), adminData);
      addLog('✅ Documento criado no Firestore!', 'success');
      addLog(`📄 Dados salvos:`, 'info');
      addLog(JSON.stringify(adminData, null, 2), 'info');

      // 4️⃣ Verificar documento
      addLog('Verificando documento criado...', 'info');
      const docCheck = await getDoc(doc(db, 'users', newUser.uid));
      
      if (docCheck.exists()) {
        addLog('✅ Documento verificado com sucesso!', 'success');
        addLog('🎉 Processo concluído!', 'success');
        setSuccess(true);
      } else {
        addLog('❌ Erro: Documento não encontrado após criação!', 'error');
      }

    } catch (error: any) {
      addLog(`❌ Erro durante execução: ${error.code} - ${error.message}`, 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout hideHeader hideFooter>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-none shadow-2xl">
            <CardHeader className="text-center">
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-900 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  D
                </div>
                <span className="text-2xl font-black text-primary">DEXAPP</span>
              </Link>
              <h1 className="text-2xl font-black text-primary">🛠️ Atualizar Administrador</h1>
              <p className="text-gray-500">Recriar usuário admin no Authentication e Firestore</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Aviso */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <p className="font-bold mb-2">⚠️ Este script irá:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Apagar o usuário atual (se existir)</li>
                    <li>Criar novo usuário com email <strong>startbusiness26@gmail.com</strong></li>
                    <li>Senha: <strong>Sahombe13</strong></li>
                    <li>Criar documento no Firestore com o novo UID</li>
                  </ul>
                </div>
              </div>

              {/* Botão de execução */}
              <Button
                onClick={executeUpdate}
                disabled={loading}
                className="w-full h-14 bg-accent hover:bg-accent/90 text-white text-lg"
                leftIcon={loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
              >
                {loading ? 'Executando...' : '🚀 Executar Atualização'}
              </Button>

              {/* Log de execução */}
              {status.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
                  {status.map((line, index) => (
                    <div key={index} className="border-b border-gray-100 pb-1 last:border-0">
                      {line}
                    </div>
                  ))}
                </div>
              )}

              {/* Mensagem de sucesso */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-xl font-black text-green-700 mb-2">Processo Concluído!</h3>
                    <p className="text-green-600">Agora você pode fazer login com:</p>
                    <p className="font-mono bg-white p-3 rounded-lg mt-2">
                      📧 startbusiness26@gmail.com<br />
                      🔑 Sahombe13
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/login')}
                    className="bg-green-600 hover:bg-green-700"
                    rightIcon={<ArrowRight size={16} />}
                  >
                    Ir para Login
                  </Button>
                </div>
              )}

              {/* Botão voltar */}
              <div className="text-center">
                <button
                  onClick={() => navigate('/')}
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  ← Voltar ao início
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
