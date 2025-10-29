# app.py
import os
from flask import Flask, render_template, jsonify, request
import requests

# 1. Inicializa la aplicación Flask
app = Flask(__name__)

# 2. Tu clave secreta de OpenWeatherMap
# ¡NUNCA compartas esta clave!
API_KEY = "d381551tarifa2293951685cd50abada3a7"

# --- RUTA 1: La Página Principal ---
@app.route('/')
def index():
    """
    Esta función se ejecuta cuando alguien visita la raíz (http://.../)
    Busca el archivo 'index.html' en la carpeta 'templates' y lo envía.
    """
    return render_template('index.html')

# --- RUTA 2: La API del Clima ---
@app.route('/api/weather')
def get_weather():
    """
    Esta función es una API interna. El JavaScript la llamará.
    """
    # Usamos 'Caracas' como ciudad por defecto, ya que estás en Venezuela
    city = request.args.get('city', 'Caracas') 

    try:
        # 3. Construye la URL para llamar a OpenWeatherMap
        # 'units=metric' es para Celsius, 'lang=es' para español.
        url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric&lang=es'

        # 4. Llama a la API
        response = requests.get(url)
        response.raise_for_status() # Lanza un error si la llamada falló
        data = response.json()

        # 5. Filtra y devuelve solo los datos que necesitamos
        weather_data = {
            "temp": data['main']['temp'],
            "description": data['weather'][0]['description'].capitalize()
        }
        return jsonify(weather_data)

    except requests.exceptions.HTTPError as err:
        if response.status_code == 404:
            return jsonify({"error": "Ciudad no encontrada"}), 404
        return jsonify({"error": str(err)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 6. El punto de entrada para ejecutar el servidor
if __name__ == '__main__':
    # 'host=0.0.0.0' hace que sea accesible desde otros dispositivos en tu red
    app.run(debug=True, host='0.0.0.0', port=5000)
