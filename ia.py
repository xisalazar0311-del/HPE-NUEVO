"""
=============================================================
  SOVEREIGN AI · SIAH HPE — Motor de Inteligencia Diaria
=============================================================
  Arquitectura:
    1. yfinance   → extrae métricas financieras reales (precio,
                    variación, márgenes, deuda, ingresos, etc.)
    2. DuckDuckGo → busca noticias recientes de TI / ciberseguridad
    3. Qwen 2.5   → (LM Studio local) analiza todo y genera un
                    JSON estructurado por empresa
    4. MongoDB    → persiste el análisis diario
    5. Flask API  → expone /api/cards para que script.js actualice
                    las cards del dashboard en tiempo real

  Uso:
    python IA.py          ← arranca el servidor Flask (modo continuo)
    python IA.py --run    ← fuerza un análisis ahora y luego sirve

  El análisis se regenera automáticamente cada 24 h mientras el
  servidor esté corriendo.
=============================================================
"""

import sys
import json
import time
import threading
from datetime import datetime, timedelta

import yfinance as yf
from pymongo import MongoClient
from openai import OpenAI
from flask import Flask, jsonify
from flask_cors import CORS

# ── Búsqueda web opcional ──────────────────────────────────
try:
    from langchain_community.tools import DuckDuckGoSearchRun
    search_tool = DuckDuckGoSearchRun()
    WEB_SEARCH_ENABLED = True
except Exception:
    WEB_SEARCH_ENABLED = False
    print("[WARN] DuckDuckGo no disponible — se omitirá búsqueda web.")

# =============================================================
# 1. CONFIGURACIÓN
# =============================================================

# Empresas a monitorear  (ticker Yahoo Finance)
EMPRESAS_TARGET = [
    {"ticker": "MSFT",  "nombre": "Microsoft",  "categoria": "Global Tech"},
    {"ticker": "NVDA",  "nombre": "NVIDIA",      "categoria": "Semiconductors"},
    {"ticker": "SNOW",  "nombre": "Snowflake",   "categoria": "Enterprise Cloud"},
    {"ticker": "AMZN",  "nombre": "Hyperscalers","categoria": "Hyperscalers"},
    {"ticker": "005930.KS", "nombre": "Samsung", "categoria": "Consumer & Edge"},
]

# Catálogo HPE para que Qwen decida la solución óptima
SOLUCIONES_HPE = {
    "HPE GreenLake":         "Nube híbrida por consumo — ideal si hay dependencia de hyperscaler o necesidad de sovereign cloud",
    "HPE Cray XD670":        "Infraestructura IA / HPC — ideal si hay demanda de GPUs o cargas de IA/ML intensivas",
    "HPE ProLiant Gen11":    "Servidores optimizados IA — ideal si hay crecimiento de infraestructura on-prem",
    "HPE Alletra MP":        "Almacenamiento All-Flash 99.9999% uptime — ideal si hay problemas de disponibilidad o costos de storage",
    "HPE Ezmeral Data Fabric":"Análisis multi-nube — ideal si hay multi-cloud o necesidades de data sovereignty",
    "HPE Aruba":             "Redes seguras y edge computing — ideal si hay expansión edge o brechas de seguridad de red",
}

# Conexión LM Studio (Qwen 2.5)
client_ai = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")

# Conexión MongoDB
MONGO_URL       = "mongodb://localhost:27017/"
DB_NAME         = "OP_HPE"
COLLECTION_NAME = "Analisis_Diario"

# Intervalo de regeneración automática (segundos)
INTERVALO_HORAS = 24

# =============================================================
# 2. HELPERS — EXTRACCIÓN DE DATOS
# =============================================================

def investigar_web(ticker: str, nombre: str) -> str:
    """Busca noticias recientes de TI, ciberseguridad o transformación digital."""
    if not WEB_SEARCH_ENABLED:
        return "Búsqueda web no disponible."
    query = (
        f"recent IT infrastructure problems, digital transformation challenges "
        f"or security breaches {nombre} {ticker} 2024 2025"
    )
    try:
        return search_tool.run(query)[:800]   # máx 800 chars para no saturar el prompt
    except Exception as e:
        return f"Sin noticias recientes ({e})."


def obtener_metricas(empresa: dict) -> dict:
    """
    Descarga métricas reales de Yahoo Finance para un ticker dado.
    Devuelve un dict listo para enviarse a Qwen 2.5.
    """
    ticker = empresa["ticker"]
    nombre = empresa["nombre"]
    print(f"  → Descargando datos de Yahoo Finance para {nombre} ({ticker})…")

    try:
        t    = yf.Ticker(ticker)
        info = t.info

        # Precio y variación del día
        precio_actual  = info.get("currentPrice") or info.get("regularMarketPrice") or 0
        precio_cierre  = info.get("previousClose") or precio_actual
        cambio_diario  = round(
            ((precio_actual - precio_cierre) / precio_cierre * 100) if precio_cierre else 0, 2
        )

        # Métricas financieras clave
        market_cap         = info.get("marketCap", 0)
        margen_beneficio   = info.get("profitMargins")        # ej: 0.35 = 35 %
        deuda_capital      = info.get("debtToEquity")         # ej: 150 = 1.5x
        crecimiento_ing    = info.get("revenueGrowth")        # ej: 0.12 = 12 %
        revenue            = info.get("totalRevenue", 0)
        p_e_ratio          = info.get("trailingPE")
        sector             = info.get("sector", empresa.get("categoria", "—"))

        # Historial 5 días para tendencia
        hist = t.history(period="5d")
        precios_5d = []
        if not hist.empty:
            precios_5d = [round(p, 2) for p in hist["Close"].tolist()]

        # Noticias web
        contexto_web = investigar_web(ticker, nombre)

        return {
            "ticker":            ticker,
            "nombre":            nombre,
            "categoria":         empresa.get("categoria", sector),
            "sector":            sector,
            "precio_actual":     round(precio_actual, 2),
            "cambio_diario_pct": cambio_diario,
            "market_cap_B":      round(market_cap / 1e9, 1) if market_cap else None,
            "revenue_B":         round(revenue / 1e9, 1)    if revenue    else None,
            "margen_beneficio_pct": round(margen_beneficio * 100, 1) if margen_beneficio else None,
            "deuda_capital":     round(deuda_capital, 1)    if deuda_capital else None,
            "crecimiento_ing_pct": round(crecimiento_ing * 100, 1) if crecimiento_ing else None,
            "pe_ratio":          round(p_e_ratio, 1)        if p_e_ratio  else None,
            "precios_5d":        precios_5d,
            "contexto_web":      contexto_web,
        }

    except Exception as e:
        print(f"    [ERROR] No se pudo obtener datos de {ticker}: {e}")
        return {
            "ticker":   ticker,
            "nombre":   nombre,
            "categoria": empresa.get("categoria", "—"),
            "error":    str(e),
        }


# =============================================================
# 3. ANÁLISIS CON QWEN 2.5 (LM Studio)
# =============================================================

SYSTEM_PROMPT = f"""
Eres el motor de inteligencia estratégica de SIAH HPE.
Tu misión es analizar métricas financieras reales y noticias de TI para generar
recomendaciones de venta B2B para Hewlett Packard Enterprise.

CATÁLOGO HPE:
{json.dumps(SOLUCIONES_HPE, indent=2, ensure_ascii=False)}

REGLAS DE PRIORIZACIÓN:
- PRIORITY HIGH  : deuda/capital > 150, márgenes < 5%, noticias de fallos de seguridad / outages / ransomware
- PRIORITY MEDIUM: crecimiento de ingresos negativo o estancado, P/E muy alto, competencia con hyperscalers
- PRIORITY LOW   : empresa sólida con métricas positivas sin señales de riesgo TI

INSTRUCCIONES DE SALIDA:
Responde ÚNICAMENTE con un array JSON válido. Sin texto adicional. Sin markdown.
El array debe tener exactamente un objeto por empresa con esta estructura:

[
  {{
    "ticker":           "MSFT",
    "nombre":           "Microsoft",
    "categoria":        "Global Tech",
    "precio_actual":    415.23,
    "cambio_diario_pct": 1.45,
    "market_cap":       "3.1T",
    "revenue":          "245B",
    "tendencia":        "bullish | bearish | neutral",
    "priority":         "HIGH | MEDIUM | LOW",
    "solution":         "Nombre corto del producto HPE más relevante",
    "solution_full":    "Nombre completo + beneficio clave en 10 palabras máx",
    "stat1_label":      "Etiqueta métrica 1 (ej: Margen Neto)",
    "stat1_value":      "Valor métrica 1 (ej: 36.4%)",
    "stat2_label":      "Etiqueta métrica 2 (ej: Deuda/Capital)",
    "stat2_value":      "Valor métrica 2 (ej: 47x)",
    "insight":          "Problema o oportunidad principal en máx 15 palabras",
    "pitch":            "Discurso de venta HPE en máx 25 palabras",
    "tag":              "Dos palabras clave en inglés"
  }}
]
"""

def analizar_con_ia(datos: list) -> list:
    """
    Envía todos los datos de las empresas a Qwen 2.5 y devuelve
    la lista de análisis estructurados.
    """
    print("\n[IA] Enviando datos a Qwen 2.5 (LM Studio)…")

    user_content = (
        "Analiza las siguientes empresas y genera el array JSON de recomendaciones HPE:\n\n"
        + json.dumps(datos, indent=2, ensure_ascii=False)
    )

    try:
        completion = client_ai.chat.completions.create(
            model="qwen2.5-7b-instruct",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_content},
            ],
            temperature=0.1,    # baja temperatura → JSON más predecible
            max_tokens=4096,
        )
        raw = completion.choices[0].message.content.strip()

        # Limpiar posibles backticks que Qwen añade a veces
        raw = raw.replace("```json", "").replace("```", "").strip()

        resultado = json.loads(raw)

        # Asegurar que sea una lista
        if isinstance(resultado, dict):
            resultado = [resultado]

        print(f"[IA] ✓ Análisis generado para {len(resultado)} empresa(s).")
        return resultado

    except json.JSONDecodeError as e:
        print(f"[IA] ERROR parseando JSON de Qwen: {e}\nRaw: {raw[:300]}")
        return []
    except Exception as e:
        print(f"[IA] ERROR conectando con LM Studio: {e}")
        return []


# =============================================================
# 4. PERSISTENCIA EN MONGODB
# =============================================================

def guardar_en_mongo(datos_raw: list, analisis_ia: list) -> str | None:
    """Guarda el análisis completo en MongoDB y devuelve el ID del documento."""
    try:
        client_db  = MongoClient(MONGO_URL, serverSelectionTimeoutMS=3000)
        db         = client_db[DB_NAME]
        collection = db[COLLECTION_NAME]

        documento = {
            "fecha":             datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "fecha_ts":          datetime.now(),
            "empresas_raw":      datos_raw,
            "empresas_analizadas": analisis_ia,
        }
        result = collection.insert_one(documento)
        client_db.close()
        print(f"[DB] ✓ Guardado en MongoDB — ID: {result.inserted_id}")
        return str(result.inserted_id)

    except Exception as e:
        print(f"[DB] ERROR: No se pudo guardar en MongoDB: {e}")
        return None


# =============================================================
# 5. FLUJO PRINCIPAL DE ANÁLISIS
# =============================================================

# Cache en memoria — evita re-consultar MongoDB en cada request
_cache: dict = {"data": None, "ts": None}

def ejecutar_analisis_completo() -> list:
    """
    Pipeline completo:
      yfinance → DuckDuckGo → Qwen 2.5 → MongoDB → cache
    Devuelve la lista de empresas analizadas.
    """
    print(f"\n{'='*55}")
    print(f"  SOVEREIGN AI — Análisis iniciado {datetime.now():%Y-%m-%d %H:%M}")
    print(f"{'='*55}")

    # Paso 1: recopilar datos financieros
    datos_raw = []
    for empresa in EMPRESAS_TARGET:
        metricas = obtener_metricas(empresa)
        datos_raw.append(metricas)
        time.sleep(0.5)   # cortesía hacia Yahoo Finance

    # Paso 2: análisis con IA local
    analisis = analizar_con_ia(datos_raw)

    # Si Qwen no devolvió datos, usar los financieros crudos como fallback
    if not analisis:
        print("[WARN] Usando datos crudos como fallback (sin análisis IA).")
        analisis = datos_raw

    # Paso 3: persistir
    guardar_en_mongo(datos_raw, analisis)

    # Paso 4: actualizar cache
    _cache["data"] = analisis
    _cache["ts"]   = datetime.now()

    print(f"\n[✓] Análisis completo — próximo en {INTERVALO_HORAS}h\n")
    return analisis


def obtener_ultimo_analisis_mongo() -> list | None:
    """Recupera el análisis más reciente de MongoDB (fallback al arrancar)."""
    try:
        client_db  = MongoClient(MONGO_URL, serverSelectionTimeoutMS=2000)
        collection = client_db[DB_NAME][COLLECTION_NAME]
        doc = collection.find_one(sort=[("_id", -1)])
        client_db.close()
        if doc and "empresas_analizadas" in doc:
            return doc["empresas_analizadas"]
    except Exception:
        pass
    return None


def loop_analisis_periodico():
    """Hilo que regenera el análisis cada INTERVALO_HORAS horas."""
    while True:
        ejecutar_analisis_completo()
        time.sleep(INTERVALO_HORAS * 3600)


# =============================================================
# 6. SERVIDOR FLASK — API para el Dashboard
# =============================================================

app = Flask(__name__)
CORS(app)   # permite peticiones desde el frontend (cualquier origen)


@app.route("/api/cards", methods=["GET"])
def get_cards():
    """
    Devuelve la lista de empresas analizadas lista para
    que script.js actualice las cards del dashboard.

    Respuesta:
    {
      "status": "ok",
      "fecha":  "2025-01-15 08:32:00",
      "empresas": [ {...}, {...}, ... ]
    }
    """
    data = _cache.get("data")

    # Si el cache está vacío, intentar con MongoDB
    if not data:
        data = obtener_ultimo_analisis_mongo()
        if data:
            _cache["data"] = data
            _cache["ts"]   = datetime.now()

    if not data:
        return jsonify({"status": "error", "message": "Sin datos disponibles aún. Espera el primer análisis."}), 503

    return jsonify({
        "status":   "ok",
        "fecha":    _cache["ts"].strftime("%Y-%m-%d %H:%M") if _cache["ts"] else "—",
        "empresas": data,
    })


@app.route("/api/status", methods=["GET"])
def get_status():
    """Endpoint de salud — útil para depurar desde el navegador."""
    ultima = _cache["ts"]
    proxima = (ultima + timedelta(hours=INTERVALO_HORAS)).strftime("%Y-%m-%d %H:%M") if ultima else "pendiente"
    return jsonify({
        "status":           "running",
        "cache_poblado":    _cache["data"] is not None,
        "ultimo_analisis":  ultima.strftime("%Y-%m-%d %H:%M") if ultima else "ninguno",
        "proximo_analisis": proxima,
        "empresas":         len(_cache["data"]) if _cache["data"] else 0,
    })


# =============================================================
# 7. ARRANQUE
# =============================================================

if __name__ == "__main__":
    forzar_analisis = "--run" in sys.argv

    # Intentar cargar el último análisis de MongoDB para
    # que el endpoint /api/cards responda inmediatamente
    print("[INIT] Cargando último análisis desde MongoDB…")
    datos_previos = obtener_ultimo_analisis_mongo()
    if datos_previos:
        _cache["data"] = datos_previos
        _cache["ts"]   = datetime.now()
        print(f"[INIT] ✓ Cache cargado con {len(datos_previos)} empresa(s) desde MongoDB.")
    else:
        print("[INIT] Sin datos previos — se ejecutará análisis al inicio.")
        forzar_analisis = True

    # Hilo de análisis periódico
    if forzar_analisis:
        # Primer análisis en hilo separado para no bloquear el arranque del servidor
        hilo = threading.Thread(target=loop_analisis_periodico, daemon=True)
    else:
        # Esperar INTERVALO_HORAS antes del primer ciclo
        def loop_diferido():
            time.sleep(INTERVALO_HORAS * 3600)
            loop_analisis_periodico()
        hilo = threading.Thread(target=loop_diferido, daemon=True)

    hilo.start()

    print("""
╔══════════════════════════════════════════════╗
║   SOVEREIGN AI · SIAH HPE — Servidor listo   ║
╠══════════════════════════════════════════════╣
║  Cards API : http://localhost:5000/api/cards  ║
║  Status    : http://localhost:5000/api/status ║
╚══════════════════════════════════════════════╝
    """)

    app.run(host="0.0.0.0", port=5000, debug=False)