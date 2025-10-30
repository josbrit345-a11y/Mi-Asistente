// static/script.js

// --- 1. Referencias a los elementos HTML ---
// Usamos 'const' porque estas variables no cambiarán

const responseArea = document.getElementById('response-area');
const btnHora = document.getElementById('btnHora');
const btnClima = document.getElementById('btnClima');
const btnAlarma = document.getElementById('btnAlarma');
const alarmSound = document.getElementById('alarm-sound');
const avatar = document.getElementById('avatar-img');

function speak(message) {
    // 1. Pone el texto en la burbuja
    responseArea.textContent = message;

    // 2. Inicia las animaciones
    avatar.classList.add('speaking');
    responseArea.classList.add('visible');

    // 3. Prepara la voz
    try {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'es-ES';
            
            // 4. (LO MÁS IMPORTANTE)
            // Qué hacer cuando la voz TERMINE de hablar:
            utterance.onend = function() {
                // Quita las animaciones
                avatar.classList.remove('speaking');
                responseArea.classList.remove('visible');
            }
            
            // 5. Habla
            window.speechSynthesis.speak(utterance);
        } else {
            // Si el navegador no soporta voz, al menos muestra el texto
            // y quita las animaciones después de 5 segundos.
            setTimeout(() => {
                avatar.classList.remove('speaking');
                responseArea.classList.remove('visible');
            }, 5000);
        }
    } catch (e) {
        console.error("Error al usar la síntesis de voz:", e);
        // Asegúrate de apagar las animaciones si hay un error
        avatar.classList.remove('speaking');
        responseArea.classList.remove('visible');
    }
}

// --- 3. Lógica para cada botón ---

function tellTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('es-VE', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true // Formato de 12 horas
    });
    speak(`Son las ${time}.`);
}

// Usamos 'async' porque 'fetch' tarda un tiempo (es asíncrono)
async function tellWeather() {
    const city = "Caracas"; // Puedes cambiar esto
    speak(`Consultando el clima en ${city}...`);

    try {
        // Llama a NUESTRA API de Flask (que a su vez llama a OpenWeatherMap)
        const response = await fetch('/api/weather?city=' + city);

        if (!response.ok) {
            // Si el servidor de Flask devolvió un error (ej. 404)
            const errorData = await response.json();
            throw new Error(errorData.error || "Error de servidor");
        }

        const data = await response.json();

        // Construye la respuesta
        const message = `En ${city}, la temperatura es de ${data.temp}°C. El cielo está ${data.description}.`;
        speak(message);

    } catch (error) {
        console.error("Error al obtener el clima:", error);
        speak(`Lo siento, no pude obtener el clima. Error: ${error.message}`);
    }
}

function setAlarm() {
    speak("Alarma programada en 10 segundos. No cierres esta pestaña.");

    // setTimeout ejecuta una función después de X milisegundos
    setTimeout(() => {
        speak("¡ALARMA! ¡Despierta!");
        alarmSound.play(); // Reproduce el sonido
    }, 10000); // 10000 ms = 10 segundos
}

// --- 4. Conectar los botones a las funciones ---
// 'click' es el evento, 'tellTime' es la función que se ejecuta
btnHora.addEventListener('click', tellTime);
btnClima.addEventListener('click', tellWeather);
btnAlarma.addEventListener('click', setAlarm);
