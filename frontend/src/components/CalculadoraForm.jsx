import { useState } from "react";
import axios from "axios";

const CalculadoraForm = () => {
  const [formData, setFormData] = useState({
    vazao: "",
    profundidade: "",
    dbo_entrada: "300",
    tipo_efluente: "domestico", 
  });

  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalcular = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/calcular`,
        formData,
      );
      setResultado(response.data);
    } catch (error) {
      console.error("Erro ao calcular:", error);
      alert("Erro ao conectar com a API da BF Dias.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* COLUNA DO FORMULÁRIO */}
        <div className="lg:col-span-5 bg-white shadow-2xl rounded-3xl p-8 border border-slate-100">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Dimensionamento Técnico
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Configure os parâmetros do sistema de aeração.
            </p>
          </div>

          <form onSubmit={handleCalcular} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Vazão do Efluente (m³/h)
              </label>
              <input
                type="number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                value={formData.vazao}
                onChange={(e) =>
                  setFormData({ ...formData, vazao: e.target.value })
                }
                placeholder="Ex: 150"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Lâmina d'água (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.profundidade}
                  onChange={(e) =>
                    setFormData({ ...formData, profundidade: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  DBO Entrada (mg/L)
                </label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.dbo_entrada}
                  onChange={(e) =>
                    setFormData({ ...formData, dbo_entrada: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Segmento / Tipo de Efluente
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                value={formData.tipo_efluente}
                onChange={(e) =>
                  setFormData({ ...formData, tipo_efluente: e.target.value })
                }
              >
                <option value="domestico">Esgoto Doméstico</option>
                <option value="industrial">Indústria Geral / Químico</option>
                <option value="alimenticio">Alimentício / Laticínios</option>
                <option value="rio">Recuperação de Corpos Hídricos</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all transform active:scale-[0.98]"
            >
              {loading ? "Calculando..." : "Gerar Solução BF Dias"}
            </button>
          </form>
        </div>

        {/* COLUNA DO RESULTADO */}
        <div className="lg:col-span-7">
          {resultado ? (
            <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-100 animate-slide-up">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
                <span className="bg-blue-400/30 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                  Recomendação Oficial
                </span>
                <h3 className="text-3xl font-black mt-2 leading-tight">
                  {resultado.solucao_bf_dias.produto}
                </h3>
              </div>

              <div className="p-8">
                <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                  <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 text-center min-w-[160px]">
                    <span className="block text-5xl font-black text-blue-600 tracking-tighter">
                      {resultado.solucao_bf_dias.quantidade}
                    </span>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      Unidades
                    </span>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-slate-500 text-base leading-relaxed italic">
                      "{resultado.solucao_bf_dias.indicacao}"
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">
                      Eficiência SOTE
                    </span>
                    <span className="text-xl font-bold text-slate-800">
                      {resultado.resultados_engenharia.eficiencia_sote}
                    </span>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">
                      Ar Requerido
                    </span>
                    <span className="text-xl font-bold text-slate-800">
                      {resultado.resultados_engenharia.vazao_ar_total} m³/h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 p-12 text-center">
              <div className="mb-6 bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center text-4xl animate-bounce">
                🚀
              </div>
              <p className="max-w-xs text-lg font-bold text-slate-400">
                Aguardando parâmetros para iniciar o cálculo de
                dimensionamento...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculadoraForm;
