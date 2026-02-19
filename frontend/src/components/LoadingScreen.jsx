import Lottie from 'lottie-react'
import animacaoLottie from '../assets/Water loading'

const LoadingScreen = ({ mensagem }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-64 h-64 mx-auto mb-8">
          <Lottie animationData={animacaoLottie} loop={true} />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Inicializando Sistemas
        </h2>
        <p className="text-blue-400 font-medium animate-pulse">
          {mensagem}
        </p>
        
        <div className="mt-10 p-5 bg-slate-800/50 rounded-xl border border-slate-700 backdrop-blur-sm">
          <p className="text-xs text-slate-400 leading-relaxed">
            
            Estamos "acordando" a API de cálculo para você. Isso leva cerca de 1 minuto.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen