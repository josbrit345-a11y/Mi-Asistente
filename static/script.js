// static/script.js

document.addEventListener('DOMContentLoaded', () => {

    const avatar = document.getElementById('avatar-img');
    const responseArea = document.getElementById('response-area');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const alarmSound = document.getElementById('alarm-sound');

    function processQuestion(question) {
        
        const q = question.toLowerCase();

        if (q.includes('hora') || q.includes('reloj')) {
            tellTime();
        } 
        else if (q.includes('fecha') || q.includes('día es hoy')) {
            tellDate();
        }
        else if (q.includes('clima') || q.includes('temperatura')) {
            tellWeather(q); 
        }
        else if (q.includes('alarma') || q.includes('despiértame')) {
            setAlarm();
        }
        else if (q.includes('hola') || q.includes('saludos')) {
            speak("¡Hola! Es un gusto ayudarte.");
        }
        else {
            askAI(question); 
        }
    }
    
    async function askAI(question) {
        speak("Pensando...");

        try {
            const response = await fetch('/api/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question: question })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.answer || "Error del servidor de IA");
            }

            const data = await response.json();
            speak(data.answer); 

        } catch (error) {
            console.error("Error al llamar a la IA:", error);
            speak("Lo sentimos, aún no podremos responder esa pregunta.");
        }
    }


    function speak(message) {
        responseArea.textContent = message;
        avatar.classList.add('speaking');
        responseArea.classList.add('visible');

        try {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(message);
                utterance.lang = 'es-ES';
                
                utterance.onend = function() {
                    avatar.classList.remove('speaking');
                    responseArea.classList.remove('visible');
                }
                window.speechSynthesis.speak(utterance);
            } else {
                setTimeout(() => {
                    avatar.classList.remove('speaking');
                    responseArea.classList.remove('visible');
                }, 5000);
            }
        } catch (e) {
            console.error("Error al usar la síntesis de voz:", e);
            avatar.classList.remove('speaking');
            responseArea.classList.remove('visible');
        }
    }

    function tellTime() {
        const now = new Date();
        const time = now.toLocaleTimeString('es-VE', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        speak(`Son las ${time}.`);
    }

    function tellDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const date = now.toLocaleDateString('es-VE', options);
        speak(`Hoy es ${date}.`);
    }

    async function tellWeather(question) {
        // En el futuro, podrías extraer la ciudad de la 'question'
        const city = "Caracas"; 
        speak(`Consultando el clima en ${city}...`);

        try {
            // Hacemos la llamada a NUESTRO backend (no a OpenWeatherMap)
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
            speak(`Lo siento, no pude obtener el clima.`);
        }
    }

    function setAlarm() {
        speak("Alarma programada en 10 segundos. No cierres esta pestaña.");
        
        setTimeout(() => {
            speak("¡ALARMA! ¡Despierta!");
            alarmSound.play();
        }, 10000); // 10000 milisegundos = 10 segundos
    }

    chatForm.addEventListener('submit', (event) => {
        event.preventDefault(); 
        const question = userInput.value; 
        if (question.trim() === "") return;
        userInput.value = ""; 
        processQuestion(question); 
    });

});