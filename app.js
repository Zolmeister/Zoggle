
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , boggle = require('./boggle')

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


var GAME = {
  board: boggle.generate(),
  timeStart: Date.now(),
  timeEnd: Date.now() + 1000 * 60 * 2 // 2 mins in the future
}
io.sockets.on('connection', function (socket) {
  
});

// game loop
(function newGame() {
  
})
