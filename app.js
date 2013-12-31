
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , boggle = require('./boggle')
  , _ = require('lodash');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
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
  socket.on('word', function(word) {
    word = word.toLowerCase()
    if(_.contains(GAME.solutions, word) && !_.contains(player.words, word)) {
      player.words.push(word)
      player.score+=boggle.score(word)
      socket.emit('word', word, player.score)
      io.sockets.emit('players', GAME.players)
    }
  })
  socket.on('name', function(name) {
    player.name = name.substr(0,19)
    io.sockets.emit('players', GAME.players)
  })
  socket.on('disconnect', function() {
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
  solutions: []
}

var twoMins = 100000000 //1000*5; //1000 * 60 * 2; // in ms
var twentySeconds = 1000*5;
(function newGame() {
  setTimeout(function(){
    setTimeout(newGame, twentySeconds)
    if(!GAME.players.length) return
    GAME.won = GAME.players.reduce(function(best, player) {
      return best.score >= player.score ? best : player
    }).words
    //debug
    //GAME.won = ['abc', 'dedfasdf', 'adsfcvc', 'adfdxcdfdsf', 'aaadsf','abc', 'dedfasdf', 'adsfcvc', 'adfdxcdfdsf', 'aaadsf','abc', 'dedfasdf', 'adsfcvc', 'adfdxcdfdsf', 'aaadsf','abc', 'dedfasdf', 'adsfcvc', 'adfdxcdfdsf', 'aaadsf','abc', 'dedfasdf', 'adsfcvc', 'adfdxcdfdsf', 'aaadsf','abc', 'dedfasdf', 'adsfcvc', 'adfdxcdfdsf', 'aaadsf','abc', 'dedfasdf', 'adsfcvc', 'adfdxcdfdsf', 'aaadsf']
    io.sockets.emit('won', GAME.won)
  }, twoMins)
  
  GAME.won = []
  GAME.board = boggle.generate()
  GAME.timeStart = Date.now()
  GAME.timeEnd = Date.now() + twoMins
  GAME.time = Date.now()
  GAME.timeNext = GAME.timeEnd + twentySeconds
  GAME.solutions = boggle.solve(GAME.board)
  _.each(GAME.players, function(player){
    player.words = []
    player.score = 0
  })
  io.sockets.emit('game', GAME)
})()
