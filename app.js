import { saveTask } from './firestore.js';


const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const btnCall = document.getElementById('btnCall');
const btnBorrar = document.getElementById('btnBorrar');
const btnSilence = document.getElementById('btnSilence');
const btnRepeat = document.getElementById('btnRepeat');
const btnCopiar= document.getElementById('btnCopiar');
const textArea = document.getElementById('textArea');
const textConversa = document.getElementById('conversa');
const textAreaResp = document.getElementById('textAreaResp');
const btnTranscribe = document.getElementById('btnTranscribe');
var div = document.getElementById("loading");
var mic = document.getElementById("microOn");
let response = '';
var mensaje = null;

const recognition = new webkitSpeechRecognition();

const APIKEY1 = 'sk-D8QzP2JTjBVwy2zFe4u7T3B';
const APIKEY2 = 'lbkFJWHovouKW3fdUaxnfoMcD';
var texto = "";
var cargando = false;
var primerMensaje = 0;
var isTranscribing = false;
let transcriber = null;
let valor = null;

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

const idUnico = generarIDUnico()
actualizarDiv();
actualizarMic();

btnCall.addEventListener('click', () => {
    valor = textArea.value;
    response = llamarApi(valor);  
    
});

btnSilence.addEventListener('click', () => {
    paraLectura();
});
btnBorrar.addEventListener('click', () => {
    textArea.value="";
});

btnRepeat.addEventListener('click', () => {
    if (mensaje != null){
        leerTexto(mensaje);
    }
});

btnCopiar.addEventListener('click', () => {
    if (mensaje != null){
        navigator.clipboard.writeText(mensaje)
    .then(() => {
      console.log('Texto copiado al portapapeles');
    })
    .catch((error) => {
      console.error('Error al copiar el texto: ', error);
    });
    }
});
if (window.innerWidth <= 768) {

    btnTranscribe.addEventListener('touchstart', () => {
        isTranscribing = true;
        actualizarMic();
        recognition.start();
      });
      
      btnTranscribe.addEventListener('touchend', () => {
        isTranscribing = false;
        actualizarMic();
        recognition.stop();
      });

  } else {
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
  }

recognition.onresult = (event) => {
    texto = event.results[event.results.length - 1][0].transcript;
    textArea.value = texto;
    response = llamarApi(texto);
}

function leerTexto(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.volume = 1;
    speech.rate = 1.3;
    speech.pitch = 1;
    speech.lang = 'es-ES'
  
    window.speechSynthesis.speak(speech);
    
}

function paraLectura(){
    speechSynthesis.cancel();
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

function llamarApi(texto) {
    cargando = true;
    actualizarDiv();
    console.log('text' + texto);
    let data = '';
  
    const ObjLlamada = 
      {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user', 
                content: texto
            }
        ],
      };
    
  
    if (primerMensaje == 0) {
      data = ObjLlamada;
      agregarMensaje('user', texto);
      primerMensaje = 1;
    } else {
      agregarMensaje('user', texto);
      data = ObjConversacion;
    }
  
    const url = 'https://back-sw8akuejn-calvarioz.vercel.app/';
    const options = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  
    fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          cargando = false;
          actualizarDiv();
          throw new Error('Error al hacer la petición a la API');
        }
        return response.json();
      })
      .then((data) => {
        cargando = false;
        actualizarDiv();
        mensaje = data.choices[0].message.content;
        console.log(mensaje);
        textAreaResp.value = mensaje;
        leerTexto(mensaje);
        // generateCatalanSpeech(mensaje);
        agregarMensaje('assistant', mensaje);
        saveTask(texto, mensaje, idUnico);
      })
      .catch((error) => {
        cargando = false;
        actualizarDiv();
        console.error(error);
      });
  }

function agregarMensaje(role, content) { 
    let nuevoMensaje = {"role": role, "content": content};
    ObjConversacion.messages.push (nuevoMensaje) ;


    textConversa.value = textConversa.value + nuevoMensaje.role + ': `' + nuevoMensaje.content + '` .\n' ;
    for (let i = 0; i < ObjConversacion.messages.length; i++) {
        console.log('Mensaje ' + i + ': ' + ObjConversacion.messages[i].role +  ': ' + ObjConversacion.messages[i].content );
      }
}

async function generateCatalanSpeech(text) {
  // Importa el paquete de Google Cloud Text-to-Speech
  const textToSpeech = require('@google-cloud/text-to-speech');

  // Crea un cliente de Google Cloud Text-to-Speech
  const client = new textToSpeech.TextToSpeechClient();

  // Crea un objeto de solicitud de síntesis de voz en catalán
  const request = {
    input: { text },
    voice: { languageCode: 'es-ES', name: 'es-ES-Wavenet-C' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  // Síntesis de voz en catalán
  const [response] = await client.synthesizeSpeech(request);

  // Convertir el audio a un objeto Blob y reproducirlo en el navegador
  let audio = new Audio(URL.createObjectURL(new Blob([response.audioContent], { type: 'audio/mp3' })));
  audio.play();

  // Crear instancia de SpeechSynthesisUtterance
  let message = new SpeechSynthesisUtterance(text);

  // Reproducir el audio de Google al completarse la síntesis de voz
  message.onend = function() {
    audio.play();
  };

  // Sintetizar y reproducir voz
  window.speechSynthesis.speak(message);
}

function generarIDUnico() {
    const fechaActual = new Date();
    const numeroAleatorio = Math.floor(Math.random() * 1000); // Genera un número aleatorio entre 0 y 999
    const identificador = fechaActual.getTime().toString() + numeroAleatorio.toString();
    return identificador;
  }