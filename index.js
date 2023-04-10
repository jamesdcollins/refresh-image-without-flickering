const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const port = 3000
const path = require('path')
const cors = require('cors')

var config = require('./config.js');

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(cors())

io.on('connection', (socket) => {
    console.log('a user connected');
});

app.get('/', (req, res) => {
    res.render("home", {
        title: "Home",
        name: config.name,
        start_x: config.start_x,
        start_y:config.start_y,
        width: (config.end_x-config.start_x),
        height: (config.end_y-config.start_y),
        rect_start_x: config.rect_start_x,
        rect_start_y:config.rect_start_y,
        rect_width: (config.rect_end_x-config.rect_start_x),
        rect_height: (config.rect_end_y-config.rect_start_y),
    });
});

app.get('/name', (req, res) => {
    res.send({
        title: "Home",
        name: config.name,
        start_x: config.start_x,
        start_y:config.start_y,
        width: (config.end_x-config.start_x),
        height: (config.end_y-config.start_y),
        rect_start_x: config.rect_start_x,
        rect_start_y:config.rect_start_y,
        rect_width: (config.rect_end_x-config.rect_start_x),
        rect_height: (config.rect_end_y-config.rect_start_y),
    });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})