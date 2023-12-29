const config = require('./config.json');

const fs = require('node:fs');
const http = require('node:http');

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
    name: "session",
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

const server = http.createServer(app);
const io = new socketio.Server(server);
io.engine.use(sessions);

server.listen(config.settings.port, () => {
    console.log(`Server started on ${config.settings.port}`);
    return;
});

app.get('/', async function (req, res) {
    res.set('Content-Type', 'text/html');
    res.send(await fs.readFileSync('./assets/web/index.html'));
});
app.get('/assets/style.css', async function (req, res) {
    res.set('Content-Type', 'text/css');
    res.send(await fs.readFileSync('./assets/web/style.css'));
});
app.get('/assets/index.js', async function (req, res) {
    res.set('Content-Type', 'text/javascript');
    res.send(await fs.readFileSync('./assets/web/index.js'));
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('result', function (data) {
        console.log(data);
    });
});

process.on('uncaughtException', function (err) {
    console.log(err.stack);
});