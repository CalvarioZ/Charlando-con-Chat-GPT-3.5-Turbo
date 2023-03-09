const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const btnCall = document.getElementById('btnCall');
const textArea = document.getElementById('textArea');
const textAreaResp = document.getElementById('textAreaResp');
const btnTranscribe = document.getElementById('btnTranscribe');
var div = document.getElementById("loading");
var mic = document.getElementById("microOn");

const recognition = new webkitSpeechRecognition();

const APIKEY1 = 'sk-LByZhUa8QON6jGWsPNXXT3';
const APIKEY2 = 'BlbkFJpG6ayWsdSa99PgekbiyQ'
var texto = "";
var cargando = false;
var primerMensaje = 0;
var isTranscribing = false;
let transcriber = null;

const ObjConversacion = {
    model: 'gpt-3.5-turbo',
    messages: [
        {
            role: 'user', 
            content: texto
        }
    ],
  };

recognition.continuous = true;
recognition.lang = 'es-ES';
recognition.interimResult = false;

actualizarDiv();
actualizarMic();


btnCall.addEventListener('click', () => {
    valor = textArea.value;
    response = llamarApi(valor);  
});

btnTranscribe.addEventListener('mousedown', () => {
  isTranscribing = true;
  actualizarMic();
  recognition.start();
});

btnTranscribe.addEventListener('mouseup', () => {
  isTranscribing = false;
  actualizarMic();
  recognition.stop();
});

recognition.onresult = (event) => {
    texto = event.results[event.results.length - 1][0].transcript;
    textArea.value = texto;
    response = llamarApi(texto);
}

function leerTexto(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.volume = 1;
    speech.rate = 2;
    speech.pitch = 1;
    speech.lang = 'es-ES'
  
    window.speechSynthesis.speak(speech);
}

function actualizarDiv() {
    if (cargando) {
      div.style.display = "block";
    } else {
      div.style.display = "none";
    }
}

function actualizarMic() {
    if (isTranscribing) {
        mic.style.display = "block";
    } else {
        mic.style.display = "none";
    }
}

function llamarApi (texto){
    cargando = true;
    actualizarDiv()
    console.log ( 'text' +texto)
    const ObjLlamada = {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user', 
                content: texto
            }
        ],
      };
    
    if (primerMensaje == 0){
        data = ObjLlamada;
        agregarMensaje('user', texto);
        primerMensaje =1
    } else {
        agregarMensaje('user', texto)
        data = ObjConversacion
    }
    
    const url = 'https://api.openai.com/v1/chat/completions';
    const options = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+ APIKEY1 + APIKEY2,
            'Access-Control-Allow-Origin': 'https://calvarioz.github.io', 
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    };

    fetch(url, options)
        .then(response => {
            if (!response.ok) {
                cargando = false;
                actualizarDiv()
                throw new Error('Error al hacer la petición a la API');
            }
            return response.json();
        })
        .then(data => {
            cargando=false;
            actualizarDiv()
            var mensaje = data.choices[0].message.content;
            console.log(mensaje);
            textAreaResp.value = mensaje;        
            leerTexto(mensaje);
            agregarMensaje('assistant', mensaje);
            
        })
        .catch(error => {
            cargando=false;
            actualizarDiv()
            console.error(error);
        });
}

function agregarMensaje(role, content) { 
    let nuevoMensaje = {"role": role, "content": content};
    ObjConversacion.messages.push (nuevoMensaje) ;

    for (let i = 0; i < ObjConversacion.messages.length; i++) {
        console.log('Mensaje ' + i + ': ' + ObjConversacion.messages[i].role +  ': ' + ObjConversacion.messages[i].content );
      }
}
