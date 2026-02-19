import { useState, useEffect } from "react";
import axios from "axios";
import LoadingScreen from "./components/LoadingScreen";
import CalculadoraForm from "./components/CalculadoraForm";

function App() {
  const [estaConectado, setEstaConectado] = useState(false);
  const [mensagemLoading, setMensagemLoading] = useState(
    
  );

  useEffect(() => {
    const verificarServidor = async () => {
      try {
        // Agora ele usa a variável que configuramos na Vercel
        await axios.get(`${import.meta.env.VITE_API_URL}/health`);
        setEstaConectado(true);
      } catch (error) {
        setTimeout(
          () =>
            setMensagemLoading(
              "O servidor está iniciando, aguarde um momento...",
            ),
          15000,
        );

        // Tenta novamente após 4 segundos
        setTimeout(verificarServidor, 4000);
      }
    };
    verificarServidor();
  }, []);

  return (
    <>
      {!estaConectado ? (
        /* Exibe a tela com o seu Lottie personalizado enquanto o Render sobe */
        <LoadingScreen mensagem={mensagemLoading} />
      ) : (
        /* Uma vez conectado, exibe o sistema principal */
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm py-6">
            <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
              <h1 className="text-xl font-black text-blue-900 uppercase tracking-tighter">
                BF Dias{" "}
                <span className="font-light text-slate-400">| Engineering</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Sistema Online
                </span>
              </div>
            </div>
          </header>

          <main>
            <CalculadoraForm />
          </main>

          <footer className="py-10 text-center text-slate-400 text-xs">
            <p>© 2026 B&F Dias - Soluções para Água e Efluentes</p>
            <p className="mt-1 text-[10px]">Vinhedo, SP - Brasil</p>
          </footer>
        </div>
      )}
    </>
  );
}

export default App;
