# app.py
import os
from flask import Flask, render_template, jsonify, request
import requests

# --- NUEVAS IMPORTACIONES DE IA ---
import google.generativeai as genai

app = Flask(__name__)

# --- CONFIGURACIÓN DE LAS API KEYS ---
# (Cargadas desde las variables de entorno de Render)

# Clave de OpenWeatherMap (ya la tienes)
WEATHER_API_KEY = os.getenv('API_KEY') 

# NUEVA CLAVE: Clave de Google AI
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=GOOGLE_API_KEY)

# --- INICIALIZACIÓN DEL MODELO DE IA ---
# (Lo preparamos para que esté listo para responder)
try:
    model = genai.GenerativeModel('gemini-1.5-pro-latest')
except Exception as e:
    print(f"Error al inicializar el modelo de IA: {e}")
    model = None

# --- RUTA 1: La Página Principal (Sin cambios) ---
@app.route('/')
def index():
    return render_template('index.html')

# --- RUTA 2: La API del Clima (Con un pequeño ajuste) ---
@app.route('/api/weather')
def get_weather():
    city = request.args.get('city', 'Caracas')
    
    if not WEATHER_API_KEY:
        return jsonify({"error": "Clave API del clima no configurada"}), 500
        
    try:
        url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric&lang=es'
        response = requests.get(url)
        data = response.json()
        
        if response.status_code == 200:
            weather_data = {
                "temp": data['main']['temp'],
                "description": data['weather'][0]['description'].capitalize()
            }
            return jsonify(weather_data)
        else:
            return jsonify({"error": "Ciudad no encontrada"}), 404
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- RUTA 3: ¡NUEVA RUTA DE IA! ---
@app.route('/api/ask', methods=['POST'])
def ask_ai():
    """
    Recibe una pregunta del frontend, la envía a Gemini
    y devuelve la respuesta.
    """
    if not model:
        return jsonify({"answer": "Lo siento, mi cerebro de IA no está conectado."}), 500
    
    try:
        # Obtiene la pregunta del JSON enviado por el frontend
        data = request.json
        question = data.get('question')

        if not question:
            return jsonify({"answer": "No recibí ninguna pregunta."}), 400

        # Envía la pregunta a Gemini
        response = model.generate_content(question)
        
        # Devuelve solo el texto de la respuesta
        return jsonify({"answer": response.text})

    except Exception as e:
        print(f"Error al generar respuesta de IA: {e}")
        return jsonify({"answer": "Tuve un problema al pensar la respuesta."}), 500

# --- Punto de entrada (Sin cambios) ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)