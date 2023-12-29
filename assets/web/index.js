const socket = io();

const startBtn = document.querySelector('#start-btn');
const stopBtn = document.querySelector('#stop-btn');
const resultDiv = document.querySelector('#result-div');
SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;
recognition.continuous = true;
let count = 0;
recognition.onresult = (event) => {
    if (event.results[count].isFinal) {
        const result = event.results[count][0].transcript;
        count++;
        resultDiv.innerHTML = result;
    } else {
        count++;
        return;
    }
}

startBtn.onclick = () => {
    recognition.start();
    count = 0;
}
stopBtn.onclick = () => {
    recognition.stop();
    count = 0;
}
