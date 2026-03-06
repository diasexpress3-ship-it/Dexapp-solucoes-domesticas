import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { UploadImage } from '../../components/ui/UploadImage';
import { 
  Target, 
  Users, 
  ShieldCheck, 
  Heart,
  CheckCircle2,
  ArrowRight,
  Star,
  Award,
  Globe,
  Briefcase,
  Clock,
  Zap,
  Home,
  MapPin,
  MessageCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

// Ícone Rocket customizado
const RocketIcon = (props: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

interface Images {
  team: string | null;
  office: string | null;
  aboutHero: string | null;
  aboutMission: string | null;
  aboutVision: string | null;
}

const VALUES = [
  { icon: ShieldCheck, title: 'Segurança', description: 'Verificamos rigorosamente todos os prestadores.', color: 'from-blue-400 to-blue-600' },
  { icon: Target, title: 'Excelência', description: 'Buscamos a perfeição em cada serviço prestado.', color: 'from-accent to-orange-600' },
  { icon: Users, title: 'Comunidade', description: 'Fortalecemos a economia local conectando talentos.', color: 'from-green-400 to-green-600' },
  { icon: Heart, title: 'Cuidado', description: 'Tratamos cada casa com respeito e dedicação.', color: 'from-pink-400 to-pink-600' },
];

const TIMELINE = [
  { year: '2020', event: 'Fundação da DEXAPP', description: 'Iniciamos com a missão de revolucionar serviços domésticos.', icon: RocketIcon, color: 'from-purple-400 to-purple-600' },
  { year: '2021', event: 'Primeiros 100 prestadores', description: 'Alcançamos a marca de 100 profissionais verificados.', icon: Users, color: 'from-blue-400 to-blue-600' },
  { year: '2022', event: 'Lançamento do App Mobile', description: 'Disponibilizamos nosso aplicativo para iOS e Android.', icon: Zap, color: 'from-yellow-400 to-yellow-600' },
  { year: '2023', event: '+5000 clientes atendidos', description: 'Ultrapassamos a marca de 5 mil famílias atendidas.', icon: Award, color: 'from-green-400 to-green-600' },
  { year: '2024', event: 'Expansão para outras cidades', description: 'Chegamos a novas províncias de Moçambique.', icon: Globe, color: 'from-indigo-400 to-indigo-600' },
  { year: '2025', event: 'Reconhecimento nacional', description: 'Premiados como melhor plataforma de serviços domésticos.', icon: Star, color: 'from-accent to-orange-600' },
];

export default function SobrePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [images, setImages] = useState<Images>({
    team: null,
    office: null,
    aboutHero: null,
    aboutMission: null,
    aboutVision: null,
  });

  // Buscar imagens
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imagesRef = doc(db, 'config', 'sobreImages');
        const imagesSnap = await getDoc(imagesRef);
        
        if (imagesSnap.exists()) {
          setImages(prev => ({ ...prev, ...imagesSnap.data() }));
        }
      } catch (error) {
        console.error("Erro ao buscar imagens:", error);
      }
    };

    fetchImages();

    const unsubscribe = onSnapshot(doc(db, 'config', 'sobreImages'), (doc) => {
      if (doc.exists()) {
        setImages(prev => ({ ...prev, ...doc.data() }));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageUpload = useCallback((field: keyof Images) => (url: string) => {
    setImages(prev => ({ ...prev, [field]: url }));
  }, []);

  return (
    <AppLayout>
      {/* Hero Section - COM BOTÃO DE UPLOAD */}
      <section className="relative bg-gradient-to-br from-primary to-blue-900 pt-32 pb-24 text-white">
        {images.aboutHero && (
          <div className="absolute inset-0">
            <img src={images.aboutHero} alt="Hero" className="w-full h-full object-cover opacity-20" />
          </div>
        )}
        
        {/* BOTÃO DE UPLOAD PARA ADMIN */}
        {user?.role === 'admin' && (
          <div className="absolute bottom-4 right-4 z-20">
            <UploadImage
              currentImageUrl={images.aboutHero}
              onUpload={handleImageUpload('aboutHero')}
              collectionPath="config"
              docId="sobreImages"
              field="aboutHero"
              isAdminOnly={true}
              label="Alterar Fundo"
              className="w-32 h-20 rounded-lg border-2 border-white"
            />
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-black mb-6">
              Sobre a <span className="text-accent">DEXAPP</span>
            </h1>
            <p className="text-xl opacity-90">
              Transformando a forma como você cuida do seu lar.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section - COM BOTÃO DE UPLOAD */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={images.team || "https://images.unsplash.com/photo-1522071820081-009f0129c71c"} 
              alt="Equipa" 
              className="w-full h-full object-cover"
            />
            
            {/* BOTÃO DE UPLOAD PARA ADMIN */}
            {user?.role === 'admin' && (
              <div className="absolute top-4 right-4">
                <UploadImage
                  currentImageUrl={images.team}
                  onUpload={handleImageUpload('team')}
                  collectionPath="config"
                  docId="sobreImages"
                  field="team"
                  isAdminOnly={true}
                  label="Alterar Foto"
                  className="w-12 h-12 rounded-full shadow-xl"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Valores Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-primary text-center mb-12">
            Nossos <span className="text-accent">Valores</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value, i) => (
              <Card key={i} className="border-none shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${value.color} text-white flex items-center justify-center mx-auto mb-6`}>
                    <value.icon size={36} />
                  </div>
                  <h3 className="text-xl font-black text-primary mb-3">{value.title}</h3>
                  <p className="text-sm text-gray-500">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-primary text-center mb-12">
            Nossa <span className="text-accent">História</span>
          </h2>
          <div className="space-y-8">
            {TIMELINE.map((item, idx) => (
              <div key={idx} className="flex gap-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center font-black text-xl`}>
                  {item.year.slice(-2)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-primary mb-2">{item.event}</h3>
                  <p className="text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
