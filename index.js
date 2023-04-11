const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
const fs = require('fs')

var config = require('./config.json');

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(cors())

app.get('/', (req, res) => {
  res.render("home", {
    SOCKET_URL: 'http://' + config.SERVER_URL + ':' + config.SOCKET_PORT
  });
});

app.listen(config.SERVER_PORT, () => {
  console.log(`Listening on port ${config.SERVER_PORT}`)
});

const socketServer = require('http').createServer();

const io = require('socket.io')(socketServer, {
  cors: {
    origin: 'http://' + config.SERVER_URL + ":" + config.SERVER_PORT,
    methods:["GET","POST"],
    credentials: true
  }
});

let imageNames = require('./imagenames.json').imageNames;

const readConfig = function() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, '/config.json'), 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(JSON.parse(data));
    });
  })
}

const readImage = function(name) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, '/public/' + name), (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  })
  
}

let configData = null, imageData = null;

io.on('connection', client => {
  client.emit('message', {
    IMAGE_NAMES: imageNames,
    IMAGE_WIDTH: config.IMAGE_WIDTH,
    IMAGE_HEIGHT: config.IAMGE_HEIGHT,
    RECT_X1: config.RECT_X1,
    RECT_Y1: config.RECT_Y1,
    RECT_WIDTH: (config.RECT_X2-config.RECT_X1),
    RECT_HEIGHT: (config.RECT_Y2-config.RECT_Y1),
  });
});

function randomString(length) {
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

setInterval(() => {
  readConfig()
    .then(data => {
      readImage(data.IMAGE_NAME)
        .then(_data => {
          if (JSON.stringify(_data) !== JSON.stringify(imageData)) {
            const newImage = randomString(12);
            fs.writeFile(path.join(__dirname, '/public/' + newImage), _data, (err, res) => {              
            });
            imageNames.unshift(newImage);
            if (imageNames.length > 3) imageNames.pop();
            fs.writeFile(path.join(__dirname, '/imagenames.json'), JSON.stringify({imageNames}), (err, res) => {
            });
          }
          if (JSON.stringify(data) !== JSON.stringify(configData) || JSON.stringify(_data) !== JSON.stringify(imageData)) {
            configData = data;
            imageData = _data;
            io.emit('message', {
              IMAGE_NAMES: imageNames,
              IMAGE_WIDTH: config.IMAGE_WIDTH,
              IMAGE_HEIGHT: config.IAMGE_HEIGHT,
              RECT_X1: configData.RECT_X1,
              RECT_Y1: configData.RECT_Y1,
              RECT_WIDTH: (configData.RECT_X2-configData.RECT_X1),
              RECT_HEIGHT: (configData.RECT_Y2-configData.RECT_Y1),
            });
          }
        })
        .catch(() => {
          configData = data;
          imageData = null;
          io.emit('message', {
            IMAGE_NAMES: imageNames,
            IMAGE_WIDTH: config.IMAGE_WIDTH,
            IMAGE_HEIGHT: config.IAMGE_HEIGHT,
            RECT_X1: configData.RECT_X1,
            RECT_Y1: configData.RECT_Y1,
            RECT_WIDTH: (configData.RECT_X2-configData.RECT_X1),
            RECT_HEIGHT: (configData.RECT_Y2-configData.RECT_Y1),
          });
        })
  })
}, 500);

socketServer.listen(config.SOCKET_PORT);