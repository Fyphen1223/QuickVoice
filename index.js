const config = require('./config.json');

const fs = require('node:fs');
const http = require('node:http');

const app = require('express')();
const session = require('express-session');
app.use(session({
    secret: config.settings.cookieSecret,
    resave: true,
    saveUninitialized: true,
    name: "session",
    cookie: {
        httpOnly: true,
        secure: true,
        maxAge: 60000,
    },
}));

const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);
io.engine.use(session);

app.get('/', async function (req, res) {
    res.set("Content-Type", "text/html");
    res.send(await fs.readFileSync('./assets/web/index.html'));
});

app.get('/assets/style.css', async function (req, res) {
    res.set("Content-Type", "text/css");
    res.send(await fs.readFileSync('./assets/web/style.css'));
});
app.get('/assets/index.js', async function (req, res) {
    res.set("Content-Type", "text/javascript");
    res.send(await fs.readFileSync('./assets/web/index.js'));
});

server.listen(config.settings.port, function () {
    console.log(`I'm currently listening at ${config.settings.port}`);
});

app.set('trust-proxy', 1);

io.on('connection', (socket) => {
    console.log('A user connected');
});

process.on('uncaughtException', function (err) {
    console.log(err.stack);
});