
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
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/index.html')
});
app.get('/users', user.list);

var server = http.createServer(app)
var io = require('socket.io').listen(server);
io.set('log level', 1)

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
    if(!GAME.gameOver && _.contains(GAME.__proto__.solutions, word) && !_.contains(player.words, word)) {
      player.words.push(word)
      player.score+=boggle.score(word)
      socket.emit('word', null, word, player.score)
      io.sockets.emit('player-update', GAME.players.indexOf(player), player)
    } else if (!GAME.gameOver && _.contains(GAME.__proto__.solutions, word)){
      socket.emit('word', 'used')
    } else {
      socket.emit('word', 'fail')
    }
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

var twoMins = 1000 * 60 * 2; // in ms
var twentySeconds = 1000 * 20;
var boardQueue = []
function goodBoard() {
  do {
    var board = boggle.generate()
    var solutions = boggle(board)
  } while(solutions.length < 100)
  return {board: board, solutions: solutions}
}
for(var i=0;i<3;i++) {
  boardQueue.push(goodBoard())
}
(function newGame() {
  setTimeout(function(){
    if(!GAME.players.length) return newGame()
    setTimeout(newGame, twentySeconds)
    GAME.gameOver = true
    GAME.won = GAME.players.reduce(function(best, player) {
      return best.score >= player.score ? best : player
    }).words
    //debug
    //GAME.won = ['abc', 'dedfasdf', 'adsfcvc', 'adfdxcdfdsf', 'aaadsf','abc', 'dedfasdf', 'adsfcvc', 'adfdxcdfdsf', 'aaadsf','abc', 'dedfasdf', 'adsfcvc', 'adfdxcdfdsf', 'aaadsf','abc', 'dedfasdf', 'adsfcvc', 'adfdxcdfdsf', 'aaadsf','abc', 'dedfasdf', 'adsfcvc', 'adfdxcdfdsf', 'aaadsf','abc', 'dedfasdf', 'adsfcvc', 'adfdxcdfdsf', 'aaadsf','abc', 'dedfasdf', 'adsfcvc', 'adfdxcdfdsf', 'aaadsf']
    io.sockets.emit('won', GAME.won)
  }, twoMins)
  GAME.timeStart = Date.now()
  GAME.timeEnd = Date.now() + twoMins
  GAME.time = Date.now()
  GAME.timeNext = GAME.timeEnd + twentySeconds
  GAME.won = []
  var nextBoard = boardQueue.pop()
  GAME.board = nextBoard.board
  GAME.__proto__.solutions = nextBoard.solutions
  GAME.gameOver = false
  _.each(GAME.players, function(player){
    player.words = []
    player.score = 0
  })
  io.sockets.emit('game', GAME)
  setTimeout(function(){
    boardQueue.push(goodBoard())
  }, 1000 * 30)
})()
