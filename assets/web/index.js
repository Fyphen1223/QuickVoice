/* eslint-disable no-undef */
const socket = io();

var audiostatus = 'stop';
const startBtn = document.querySelector('#start-btn');
const gptResult = document.querySelector('#gpt-result');
const resultDiv = document.querySelector('#result-div');
SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;
recognition.continuous = true;
let count = 0;

recognition.addEventListener('speechstart', function () {
	count = 0;
});

recognition.addEventListener('speechend', function () {
	count = 0;
	try {
		recognition.start();
	} catch (err) {
		return;
	}
});

recognition.onresult = (event) => {
	const result = event.results[count][0].transcript;
	count++;
	resultDiv.innerHTML = result;
	if (!result) return;
	socket.emit('result', result);
	return;
};

startBtn.onclick = async () => {
	if (audiostatus === 'stop') {
		audiostatus = 'start';
		try {
			recognition.start();
		} catch (err) {
			return;
		}
	} else {
		recognition.stop();
		audiostatus = 'stop';
	}
	count = 0;
};

socket.on('result', (result) => {
	if ('speechSynthesis' in window) {
		const uttr = new SpeechSynthesisUtterance();
		uttr.text = result;
		uttr.lang = 'ja-JP';
		uttr.rate = 1;
		uttr.pitch = 1;
		uttr.volume = 1;
		window.speechSynthesis.speak(uttr);
	}
	gptResult.innerHTML = result;
});