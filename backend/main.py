from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. CONFIGURAÇÃO DOS PRODUTOS (CONFORME SITE) ---
# Convertendo m3/min para m3/h (Multiplicando por 60)
CATALOGO_BF = {
    "circular_soldado": {
        "nome": "Difusor Circular B&F 230mm (Soldado)",
        "vazao_max_h": 7.2, # 0.120 * 60
        "indicacao": "Elevada transferência de oxigênio e resistência hidrodinâmica.",
        
    },
    "circular_hd": {
        "nome": "Difusor Circular B&F HD (Rosqueado)",
        "vazao_max_h": 9.0, # Estimado para modelo 270mm
        "indicacao": "Conexão rosqueada com plásticos reforçados e alta resistência mecânica.",
        
    },
    "tubular": {
        "nome": "Difusor Tubular de Membrana",
        "vazao_max_h": 10.0, # Média para modelos padrão
        "indicacao": "Especialmente indicado para sistemas removíveis/flutuantes (Air Float®).",
        
    }
}

class DadosProjeto(BaseModel):
    vazao: float
    profundidade: float
    dbo_entrada: float
    tipo_efluente: str # 'domestico', 'industrial', 'alimenticio', 'rio'

@app.post("/calcular")
def calcular(dados: DadosProjeto):
    # 1. Definir Fator Alpha (Dificuldade)
    alphas = {"domestico": 0.85, "industrial": 0.65, "alimenticio": 0.45, "rio": 0.90}
    alpha = alphas.get(dados.tipo_efluente, 0.85)
    
    # 2. Cálculos de Engenharia
    carga_dbo = (dados.vazao * dados.dbo_entrada) / 1000
    aor = carga_dbo * 1.2 # Necessidade Real
    sote = (dados.profundidade * 6.5) / 100 # Eficiência por metro
    sor = aor / (alpha * 0.95) # Condição Padrão
    
    vazao_ar_total = sor / (1.293 * 0.232 * sote)
    
    # 3. Lógica de Seleção de Produto (O "Cérebro" do MVP)
    if dados.tipo_efluente == "industrial" or dados.tipo_efluente == "alimenticio":
        # Para casos críticos e químicos, o Tubular ou HD são melhores
        produto = CATALOGO_BF["tubular"] if dados.profundidade > 4 else CATALOGO_BF["circular_hd"]
    else:
        # Para esgoto comum/doméstico, o campeão de vendas: Circular 230mm
        produto = CATALOGO_BF["circular_soldado"]

    # Cálculo de quantidade (Usando 70% da capacidade máxima para segurança)
    capacidade_segura = produto["vazao_max_h"] * 0.7
    quantidade = int(vazao_ar_total / capacidade_segura) + 1
    
    return {
        "resultados_engenharia": {
            "vazao_ar_total": round(vazao_ar_total, 2),
            "eficiencia_sote": f"{round(sote*100, 1)}%",
            "sor_kgh": round(sor, 2)
        },
        "solucao_bf_dias": {
            "produto": produto["nome"],
            "quantidade": quantidade,
            "indicacao": produto["indicacao"],
            
        }
    }

@app.get("/health")
def health(): return {"status": "online"}