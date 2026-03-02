import React, { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
// Importando os nossos "carteiros" do arquivo de serviços
import { 
  acordarServidorRender, 
  fetchCalcularAOR, 
  fetchCalcularSOR, 
  fetchCalcularVazao 
} from '../services/api';

export default function CalculadoraAeracao() {
  // --- GERENCIAMENTO DE ESTADO ---
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const [isWakingUp, setIsWakingUp] = useState(!isLocalhost); 

  const [abaAtiva, setAbaAtiva] = useState('aor');
  
  const [resAOR, setResAOR] = useState(null);
  const [resSOR, setResSOR] = useState(null);
  const [resVazao, setResVazao] = useState(null);

  const [formAOR, setFormAOR] = useState({ vazao: '', dbo_entrada: '', nitrogenio: '', fator_o2_dbo: '1.5' });
  const [formSOR, setFormSOR] = useState({ alpha: '', beta: '0.9', segmento: 'sanitario' });
  const [formVazao, setFormVazao] = useState({ profundidade: '' });

  const alphasSugeridos = {
    sanitario: "0.6 a 0.65", industrial: "0.5 a 0.6", curtume: "0.3 a 0.5",
    mbbr: "0.7 a 0.8", mbr: "0.3 a 0.45", chorume: "0.20"
  };

  // --- EFEITO DE INICIALIZAÇÃO (COLD START) ---
  useEffect(() => {
    if (isLocalhost) return;

    const inicializarApp = async () => {
      await acordarServidorRender(); // Chama a API para acordar
      setIsWakingUp(false);          // Desliga a tela de carregamento
    };

    inicializarApp();
  }, [isLocalhost]);


  // --- HANDLERS SUPER LIMPOS ---
  const handleAOR = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchCalcularAOR({
        vazao: parseFloat(formAOR.vazao), 
        dbo_entrada: parseFloat(formAOR.dbo_entrada), 
        nitrogenio: parseFloat(formAOR.nitrogenio), 
        fator_o2_dbo: parseFloat(formAOR.fator_o2_dbo)
      });
      setResAOR(data);
      setAbaAtiva('sor');
    } catch (error) {
      alert("Erro ao conectar com o servidor para calcular AOR.");
    }
  };

  const handleSOR = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchCalcularSOR({
        aor_total: resAOR.aor_total_kg_dia, 
        alpha: parseFloat(formSOR.alpha), 
        beta: parseFloat(formSOR.beta)
      });
      setResSOR(data);
      setAbaAtiva('vazao');
    } catch (error) {
      alert("Erro ao conectar com o servidor para calcular SOR.");
    }
  };

  const handleVazao = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchCalcularVazao({
        sor_h: resSOR.sor_total_kg_h, 
        profundidade: parseFloat(formVazao.profundidade)
      });
      setResVazao(data);
    } catch (error) {
      alert("Erro ao conectar com o servidor para calcular a Vazão.");
    }
  };


  // --- ESTILOS DA INTERFACE ---
  const tabStyle = (id, habilitada) => ({
    padding: '16px 24px', flex: 1, cursor: habilitada ? 'pointer' : 'not-allowed', border: 'none', transition: 'all 0.3s ease',
    backgroundColor: abaAtiva === id ? '#0747a6' : (habilitada ? '#f4f5f7' : '#fafbfc'),
    color: abaAtiva === id ? '#fff' : (habilitada ? '#42526e' : '#c1c7d0'),
    fontWeight: '600', fontSize: '0.9rem', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    borderBottom: abaAtiva === id ? '4px solid #002147' : '1px solid #dfe1e6'
  });

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #dfe1e6', marginTop: '6px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#fff'
  };


  // --- TELA DE ESPERA INICIAL ---
  if (isWakingUp) {
    return <LoadingScreen mensagem="Inicializando servidor da B&F Dias no Render... (Pode levar até 50 segundos)" />;
  }

  // --- RENDERIZAÇÃO DA INTERFACE ---
  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', color: '#172b4d' }}>
      
      <header style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0747a6', marginBottom: '8px' }}>
          Dimensionamento de Aeração
        </h1>
        <p style={{ color: '#6b778c' }}>Cálculos técnicos precisos para sistemas de tratamento de efluentes</p>
      </header>

      <nav style={{ display: 'flex', gap: '4px', marginBottom: '0' }}>
        <button style={tabStyle('aor', true)} onClick={() => setAbaAtiva('aor')}>
          <span>01</span> AOR (Carga Real)
        </button>
        <button style={tabStyle('sor', !!resAOR)} onClick={() => resAOR && setAbaAtiva('sor')}>
          <span>02</span> SOR (Condição Padrão)
        </button>
        <button style={tabStyle('vazao', !!resSOR)} onClick={() => resSOR && setAbaAtiva('vazao')}>
          <span>03</span> Vazão de Ar Final
        </button>
      </nav>

      <div style={{ background: '#fff', padding: '40px', borderRadius: '0 0 12px 12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #dfe1e6', borderTop: 'none' }}>
        
        {/* ABA 01: AOR */}
        {abaAtiva === 'aor' && (
          <section>
            <div style={{ marginBottom: '24px', borderBottom: '1px solid #f4f5f7', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Parâmetros do Efluente</h3>
            </div>
            <form onSubmit={handleAOR}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Vazão do Projeto (m³/dia)
                  <input type="number" step="any" value={formAOR.vazao} onChange={e => setFormAOR({...formAOR, vazao: e.target.value})} required style={inputStyle} placeholder="Ex: 5000"/>
                </label>
                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>DBO de Entrada (mg/L)
                  <input type="number" step="any" value={formAOR.dbo_entrada} onChange={e => setFormAOR({...formAOR, dbo_entrada: e.target.value})} required style={inputStyle} placeholder="Ex: 300"/>
                </label>
                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Nitrogênio (mg/L)
                  <input type="number" step="any" value={formAOR.nitrogenio} onChange={e => setFormAOR({...formAOR, nitrogenio: e.target.value})} required style={inputStyle} placeholder="Ex: 40"/>
                </label>
                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Fator O₂
                  <input type="number" step="any" value={formAOR.fator_o2_dbo} onChange={e => setFormAOR({...formAOR, fator_o2_dbo: e.target.value})} required style={inputStyle}/>
                </label>
              </div>
              <button type="submit" style={{ marginTop: '32px', padding: '14px', background: '#0747a6', color: '#fff', border: 'none', width: '100%', cursor: 'pointer', borderRadius: '6px', fontWeight: '700', fontSize: '1rem' }}>
                Calcular Carga Diária (AOR)
              </button>
            </form>

            {resAOR && (
              <div style={{ marginTop: '32px', padding: '24px', background: '#ebf2ff', borderRadius: '8px', border: '1px solid #cce0ff' }}>
                <h4 style={{ color: '#002147', marginTop: 0, marginBottom: '16px', fontSize: '1rem', fontWeight: '700' }}>Relatório de Carga Gerada:</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#42526e' }}>AOR Total Calculado</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0747a6' }}>{resAOR.aor_total_kg_dia} <small style={{ fontSize: '0.8rem' }}>kg O₂/dia</small></div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#42526e' }}>
                    <div>DBO: {resAOR.aor_dbo_kg_dia} kg/dia</div>
                    <div>N-NH₄: {resAOR.aor_nitrogenio_kg_dia} kg/dia</div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ABA 02: SOR */}
        {abaAtiva === 'sor' && (
          <section>
            <div style={{ marginBottom: '24px', borderBottom: '1px solid #f4f5f7', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Fatores de Correção</h3>
            </div>
            <form onSubmit={handleSOR}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Segmento Industrial
                  <select value={formSOR.segmento} onChange={e => setFormSOR({...formSOR, segmento: e.target.value})} style={inputStyle}>
                    {Object.keys(alphasSugeridos).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                </label>
                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Fator Alpha (α) - Ref: {alphasSugeridos[formSOR.segmento]}
                  <input type="number" step="0.01" value={formSOR.alpha} onChange={e => setFormSOR({...formSOR, alpha: e.target.value})} required style={inputStyle}/>
                </label>
                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Fator Beta (β)
                  <input type="number" step="0.01" value={formSOR.beta} onChange={e => setFormSOR({...formSOR, beta: e.target.value})} required style={inputStyle}/>
                </label>
              </div>
              <button type="submit" style={{ marginTop: '32px', padding: '14px', background: '#00875a', color: '#fff', border: 'none', width: '100%', cursor: 'pointer', borderRadius: '6px', fontWeight: '700' }}>
                Converter para SOR (Standard)
              </button>
            </form>
            {resSOR && (
              <div style={{ marginTop: '32px', padding: '24px', background: '#e3fcef', borderRadius: '8px', border: '1px solid #abf5d1' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#006644' }}>SOR Diário</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#006644' }}>{resSOR.sor_total_kg_dia} <small>kg/dia</small></div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#006644' }}>Demanda por Hora</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#006644' }}>{resSOR.sor_total_kg_h} <small>kg O₂/h</small></div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ABA 03: VAZÃO */}
        {abaAtiva === 'vazao' && (
          <section>
            <div style={{ marginBottom: '24px', borderBottom: '1px solid #f4f5f7', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Dimensionamento de Ar</h3>
            </div>
            <form onSubmit={handleVazao}>
              <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Profundidade de Instalação dos Difusores (m)
                <input type="number" step="0.1" value={formVazao.profundidade} onChange={e => setFormVazao({profundidade: e.target.value})} required style={inputStyle} placeholder="Ex: 4.5"/>
              </label>
              <button type="submit" style={{ marginTop: '32px', padding: '14px', background: '#ff8b00', color: '#fff', border: 'none', width: '100%', cursor: 'pointer', borderRadius: '6px', fontWeight: '700' }}>
                Gerar Vazão de Ar Necessária
              </button>
            </form>
            {resVazao && (
              <div style={{ marginTop: '32px', padding: '30px', background: '#fff7e6', borderRadius: '12px', border: '2px solid #ffab00', textAlign: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#855100', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Vazão de Ar Requerida</span>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: '#ff8b00', margin: '8px 0' }}>
                  {resVazao.vazao_ar_m3h} <small style={{ fontSize: '1rem' }}>m³/h</small>
                </div>
                <div style={{ color: '#855100', fontWeight: '600' }}>Eficiência de Transferência (SOTE): {resVazao.sote_percentual}</div>
              </div>
            )}
          </section>
        )}
      </div>  
    </div>
  );
}