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

# Rota raiz para evitar erro 404 ao abrir o endereço no navegador
@app.get("/")
def home():
    return {"status": "API de Dimensionamento Online"}

# Adicione esta rota logo abaixo da rota home()
@app.get("/health")
def health():
    return {"status": "ok"}

class DadosAOR(BaseModel):
    vazao: float
    dbo_entrada: float
    nitrogenio: float
    fator_o2_dbo: float

class DadosSOR(BaseModel):
    aor_total: float
    alpha: float
    beta: float = 0.9

# Modelo para a Aba 3
class DadosVazao(BaseModel):
    sor_h: float
    profundidade: float

@app.post("/calcular-aor")
def calcular_aor(dados: DadosAOR):
    # Cálculo AOR conforme especificações
    aor_dbo = (dados.vazao * dados.dbo_entrada) / 1000 * dados.fator_o2_dbo 
    aor_nitrogenio = (dados.vazao * dados.nitrogenio) / 1000 * 4.6 
    aor_total = aor_dbo + aor_nitrogenio #
    return {
        "aor_dbo_kg_dia": round(aor_dbo, 2),
        "aor_nitrogenio_kg_dia": round(aor_nitrogenio, 2),
        "aor_total_kg_dia": round(aor_total, 2)
    }

@app.post("/calcular-sor")
def calcular_sor(dados: DadosSOR):
    # SOR = AOR / (alpha * beta)
    
    sor = dados.aor_total / (dados.alpha * dados.beta) #
    return {
        "sor_total_kg_dia": round(sor, 2),
        "sor_total_kg_h": round(sor / 24, 2) #
    }

@app.post("/calcular-vazao")
def calcular_vazao(dados: DadosVazao):
    # SOTE baseado em 6.5% por metro de profundidade
    sote = (dados.profundidade * 6.5) / 100 
    # Vazão de Ar = SOR_h / (Densidade * %O2 * SOTE)
    vazao_ar = dados.sor_h / (1.293 * 0.232 * sote) if sote > 0 else 0 #
    return {
        "vazao_ar_m3h": round(vazao_ar, 2),
        "sote_percentual": f"{round(sote * 100, 2)}%"
    }   
    
    
    
