const config = require('./config.json');
var users = require('./db/user.json');
const { gpts } = require('./utils/gpt-client');
const queue = new gpts();
const fs = require('node:fs');
const https = require('node:https');
const http = require('node:http');
const process = require('node:process');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const socketio = require('socket.io');
const RateLimit = require('express-rate-limit');

const app = express();
const sessions = session({
	secret: config.settings.cookieSecret,
	resave: true,
	saveUninitialized: true,
	name: 'session',
	cookie: {
		httpOnly: true,
		secure: true,
		maxAge: 60000,
	},
});
app.use(sessions);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const limiter = RateLimit({
	windowMs: 1 * 60 * 1000,
	max: 100,
});
app.use(limiter);
app.use(express.json());
app.set('trust proxy', 1);

var server;
if (config.settings.secure) {
	server = https.createServer(
		{
			key: fs.readFileSync('./ssl/privatekey.pem'),
			cert: fs.readFileSync('./ssl/cert.pem'),
			ca: fs.readFileSync('./ssl/chain.pem'),
		},
		app
	);
} else {
	server = http.createServer(app);
}
const io = new socketio.Server(server);
io.engine.use(sessions);

server.listen(config.settings.port, () => {
	console.log(`Server started on ${config.settings.port}`);
	return;
});

app.get('/', async function (req, res) {
	if (!req.session.username) {
		res.redirect('/login');
	} else {
		res.set('Content-Type', 'text/html');
		res.send(fs.readFileSync('./assets/web/index.html'));
	}
});
app.get('/login', async function (req, res) {
	res.set('Content-Type', 'text/html');
	res.send(fs.readFileSync('./assets/web/login.html'));
});

app.get('/logout', async function (req, res) {
	req.session.destroy();
	res.redirect('/login');
});

app.post('/login', (req, res) => {
	const { username, password } = req.body;
	if (users[username].password === password) {
		req.session.regenerate(() => {
			req.session.username = username;
			res.redirect('/');
		});
	} else {
		res.redirect('/login');
	}
});
app.get('/assets/style.css', async function (req, res) {
	res.set('Content-Type', 'text/css');
	res.send(fs.readFileSync('./assets/web/style.css'));
});
app.get('/assets/index.js', async function (req, res) {
	res.set('Content-Type', 'text/javascript');
	res.send(fs.readFileSync('./assets/web/index.js'));
});

io.on('connection', (socket) => {
	console.log('A user connected');
	socket.on('disconnect', () => {
		console.log('A user disconnected');
	});
	socket.on('result', async (data) => {
		const username = socket.request.session.username;
		if (!queue.users[username]) queue.add(username, 1);
		const res = await queue.users[username].generate(data);
		socket.emit('result', res);
	});
});

process.on('uncaughtException', function (err) {
	console.log(err.stack);
});