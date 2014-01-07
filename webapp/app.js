
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , boggle = require('boggle')
  , _ = require('lodash');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.disable('x-powered-by');
app.use(express.compress());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res) {
  res.redirect('/')
})

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/index.html')
});
app.get('/manifest.webapp', function(req, res) {
  res.header('Content-Type', 'application/x-web-app-manifest+json')
  res.sendfile(__dirname + '/public/manifest.webapp')
})

app.get('/users', user.list);

var server = http.createServer(app)
var io = require('socket.io').listen(server);
io.set('log level', 1)
io.configure('production', function() {
  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file
  io.set('transports', [
      'websocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
  ]);
})

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
  var player = new Player()
  GAME.players.push(player)
  GAME.time = Date.now()
  socket.emit('game', GAME)
  socket.emit('name', player.name)
  socket.broadcast.emit('player-add', player)
  socket.emit('players', GAME.players)
  socket.on('word', function(word) {
    word = word.toLowerCase()
    if(!GAME.gameOver && _.contains(GAME.solutions, word) && !_.contains(player.words, word)) {
      player.words.push(word)
      player.score+=boggle.score(word)
      socket.emit('word', null, word, player.score)
      io.sockets.emit('player-update', GAME.players.indexOf(player), player)
    } /*else if (!GAME.gameOver && _.contains(GAME.solutions, word)){
      socket.emit('word', 'used')
    } else {
      socket.emit('word', 'fail')
    }*/
  })
  socket.on('name', function(name) {
    var exists = !_.every(GAME.players, function(p) {
      if(player === p) return true
      return p.name !== name
    })
    if(exists) return socket.emit('nameUsed', true)
    
    player.name = name.substr(0,18)
    socket.emit('nameUsed', false)
    io.sockets.emit('player-update', GAME.players.indexOf(player), player)
  })
  socket.on('disconnect', function() {
    io.sockets.emit('player-remove', GAME.players.indexOf(player))
    GAME.players.splice(GAME.players.indexOf(player), 1)
  })
});

var randomName = (function() {
  var names = require('fs').readFileSync('names','ascii').trim().split('\n').map(function(s){return s.trim()})
  return function() {
    return _.sample(names)
  }
})()

function Player() {
  this.name = randomName()
  this.words = []
  this.score = 0
}

// game loop
var GAME = {
  board: [],
  timeStart: 0,
  timeEnd: 0,
  time: 0,
  players: [],
  won: [],
  gameOver: false
}

var timeInGame = 1000 * 60 * 2; // 2 min
var timeBetweenGames = 1000 * 15; // 15s

if(process.env.NODE_ENV !== 'production') {
  timeInGame = 50000
  timeBetweenGames = 5000
}

function goodBoard() {
  do {
    var board = boggle.generate()
    var solutions = boggle(board)
  } while(solutions.length < 100)
  return {board: board, solutions: solutions}
}

var boardQueue = []
boardQueue.push(goodBoard());

(function newGame() {
  setTimeout(function(){
    if(!GAME.players.length) return newGame()
    setTimeout(newGame, timeBetweenGames)
    GAME.gameOver = true
    GAME.won = GAME.players.reduce(function(best, player) {
      return best.score >= player.score ? best : player
    }).words
    //debug
    if(process.env.NODE_ENV !== 'production') {
      GAME.won = ['abc', 'def', 'asdf', 'asdfasdg', 'zxcvxzcv', 'utuytuyu', 'xxqweqe', 'piuouio', 'tyuiyuix', 'asdfasdfb', 'asdfqerewt', 'fdggjjku', 'asdfacxvsd', 'urtyuyuhjghj', 'zxczxczxcvxzcv', 'tyuiytuiyu', 'vxzcvxc']
    }
    io.sockets.emit('won', GAME.won)
  }, timeInGame)
  GAME.timeStart = Date.now()
  GAME.timeEnd = Date.now() + timeInGame
  GAME.time = Date.now()
  GAME.timeNext = GAME.timeEnd + timeBetweenGames
  GAME.won = []
  var nextBoard = boardQueue.pop()
  GAME.board = nextBoard.board
  GAME.solutions = nextBoard.solutions
  GAME.gameOver = false
  _.each(GAME.players, function(player){
    player.words = []
    player.score = 0
  })
  io.sockets.emit('game', GAME)
  boardQueue.push(goodBoard())
})()
