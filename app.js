import { saveTask } from './firestore.js';


const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const btnCall = document.getElementById('btnCall');
const btnSpeak = document.getElementById('btnSpeak');
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

const APIKEY1 = 'sk-pTkOASAzsealt92iT5ibT3B';
const APIKEY2 = 'lbkFJEK6r1RTZA2i7ULNAsUVN';
var texto = "";
var cargando = false;
var primerMensaje = 0;
var isTranscribing = false;
let transcriber = null;
let valor = null;
const modelGPT4_0314= 'gpt-4-0314';
const modelGPT4= 'gpt-4';
const modelGPT3_5_0301='gpt-3.5-turbo-0301';
const modelGPT3_5='gpt-3.5-turbo';

const ObjConversacion = {
    model: modelGPT4_0314,
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
btnSpeak.addEventListener('click', () => {
  
    if (mensaje != null){
        leerTexto(mensaje);
    }
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
   // response = llamarApi(texto);
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

function llamarApi (texto){
    
    cargando = true;
    actualizarDiv();
    console.log ( 'text' +texto)
    let data ='';
    const ObjLlamada = {
        model: modelGPT4_0314,
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
        addUserMessage(texto);
        primerMensaje =1
    } else {
        agregarMensaje('user', texto)
        addUserMessage(texto);
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
            mensaje = data.choices[0].message.content;
            // let respuesta = processCodeFormatting(mensaje);
           // document.getElementById('textAreaRespDiv').innerHTML = mensaje;      
           textArea.value = "";   
                    
            addAssistantMessage(mensaje);
           // leerTexto(mensaje);
         //   generateCatalanSpeech(mensaje);
            agregarMensaje('assistant', mensaje);
            saveTask(texto, mensaje, idUnico);          
        })
        .catch(error => {
            cargando=false;
            actualizarDiv()
            console.error(error);
        });
}

// function processCodeFormatting(text) {
//     const codeRegex = /```([\s\S]*?)```/g;
//     return text.replace(codeRegex, '<preT><codeT>$1</codeT></preT>');
// }
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
  function addUserMessage(messageContent) {
    let chatMessage = document.createElement("div");
    chatMessage.className = "userMessage";
    chatMessage.innerHTML = formatMessageAsCode(messageContent, false);
  
    document.getElementById("chatContainer").appendChild(chatMessage);
  }
  
  function addAssistantMessage(messageContent) {
    let chatMessage = document.createElement("div");
    chatMessage.className = "assistantMessage";
    chatMessage.innerHTML = formatMessageAsCode(messageContent, true);
  
    document.getElementById("chatContainer").appendChild(chatMessage);
  }
  
function formatMessageAsCode(messageContent, isAssistant) {
  let bgColor = isAssistant ? "#4caf50" : "#e6e6e6";
  let textColor = isAssistant ? "white" : "black";
  let formattedTime = getFormattedTime();
  let messageParts = messageContent.split("```");
  let formattedMessage = "";
  let isCode = false;

  messageParts.forEach((part, index) => {
    if (index % 2 === 0) {
      // Parte regular, no es código
      let escapedContent = escapeHtml(part);
      let timeDisplay = isCode ? '' : `<sub style="font-size: 10px;">${formattedTime}&nbsp;</sub>`;
      formattedMessage += `
      
        <div style="background-color: ${bgColor}; border-radius: 10px; display: inline-block; padding: 8px 12px; margin-top: 8px;">
        ${timeDisplay}<span style="white-space: pre-wrap;"></br><span style="color: ${textColor};">${escapedContent}</span></span>
        </div>`;
      isCode = false;
    } else {
      // Parte de código
      let rows = part.split('\n').length;
      let timeDisplay = index === 1 && isAssistant ? `<sub style="font-size: 10px;">${formattedTime}&nbsp;</sub>` : '';
      formattedMessage += `
        <div style="display: block; margin-top: 8px;">
          ${timeDisplay}<textarea readonly rows="${rows}" style="width: 100%; height: auto; resize: none; white-space: pre-wrap;">${part}</textarea>
        </div>`;
      isCode = true;
    }
  });

  return formattedMessage;
}
  
  function getFormattedTime() {
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function escapeHtml(unsafeContent) {
    return unsafeContent
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }