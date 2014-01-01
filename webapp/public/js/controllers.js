'use strict';

/* Controllers */

angular.module('zoggle.controllers', []).
controller('MainCtrl', ['$scope', 'checkMobile', '$timeout',

  function ($scope, checkMobile, $timeout) {
    $scope.words = []
    $scope.board = []
    $scope.timeStart = 0
    $scope.timeEnd = 0
    $scope.timeNext = 0
    $scope.time = 0
    $scope.timeDelta = 0
    $scope.players = []
    $scope.won = []
    $scope.input = {
      word: ''
    }
    $scope.gameOver = false
    $scope.score = 0
    $scope.setName = false
    $scope.isSelecting = {mouse: false}
    $scope.isMobile = checkMobile()
    $scope.selected = []
    $scope.select = function(arr) {
      angular.copy(arr, $scope.selected)
      if(arr.length) {
        $scope.input.word = _.map(arr, function(i){return $scope.board[i]}).join('').toLowerCase()
      }
    }

    var socket = io.connect();
    socket.on('game', function (GAME) {
      //console.log('game', GAME)
      $scope.gameOver = false
      for (var key in GAME) {
        $scope[key] = GAME[key]
      }
      
      // time difference between me and the server, with 50ms buffer
      $scope.timeDelta = Date.now() - $scope.time + 50
      $scope.words = []
      $scope.$apply()
    })
    socket.on('name', function (name) {
      if (!$scope.name) {
        $scope.name = name
      }
    })
    socket.on('won', function (winningWords) {
      //console.log('words', winningWords)
      $scope.won = winningWords
    })
    socket.on('players', function (players) {
      //console.log('players', players)
      angular.copy(players, $scope.players)
    })
    socket.on('player-add', function(player) {
      $scope.players.push(player)
      $scope.$apply()
    })
    socket.on('player-remove', function(index) {
      $scope.players.splice(index, 1)
      $scope.$apply()
    })
    socket.on('player-update', function(index, player) {
      $scope.players[index] = player
      $scope.$apply()
    })
    socket.on('word', function (err, word, score) {
      if(!err) {
        $scope.words.unshift(word)
        $scope.score = score
        $scope.wordSuccess = true
      } else {
        $scope.wordSuccess = err
      }
      
      $timeout(function() {
        $scope.wordSuccess = null
      }, 500)
    })
    socket.on('nameUsed', function (used) {
      $scope.nameUsed = used
      $scope.setName = used
      $scope.$apply()
    })
    $scope.name = localStorage.name
    if ($scope.name) {
      socket.emit('name', $scope.name)
    }
    $scope.guess = function () {
      if(!$scope.input.word) return
      //console.log('word', $scope.input.word)
      socket.emit('word', $scope.input.word)
      $scope.input.word = ''
    }
    $scope.editName = function () {
      $scope.setName = true
    }
    $scope.commitName = function () {
      $scope.name = $scope.name.substr(0, 18)
      localStorage.name = $scope.name
      socket.emit('name', $scope.name)
    }
    function depthFirstSearch(grid, word, pos, index, past) {
      index = index || 0
      past = past || []
      if(!word[index]) return past
      var currentLetter = grid[pos] === 'Qu' ? 'Q' : grid[pos]
      if(pos < 0 || pos > grid.length || _.contains(past, pos) || word[index] !== currentLetter) return []
      
      var dirs = _.filter([-5, -4, -3, -1, 1, 3, 4, 5], function(dir) {
        var col = pos%4
        if (col === 0 && (dir === -1 || dir === 3 || dir === -5)) return false
        if (col === 3 && (dir === -3 || dir === 1 || dir === 5)) return false
        return true
      })
      return _.map(dirs, function(dir) {
        return depthFirstSearch(grid, word, pos+dir, index+1, past.concat(pos))
      })
    }
    $scope.$watch('input.word', function() {
      if($scope.isSelecting.mouse) return
      if(!$scope.board.length || !$scope.input.word.length) return $scope.selected = []
      
      // only run on Q if u is present
      if($scope.input.word.length < 2 && $scope.input.word[0].toUpperCase() === 'Q') return

      var res = []
      for(var pos=0, l=$scope.board.length; pos<l; pos++) {
        res = res.concat(depthFirstSearch($scope.board, $scope.input.word.toUpperCase().replace('QU', 'Q'), pos))
      }
      $scope.selected = _.uniq(_.flatten(res))
    })

    function zeroPad(number) {
      return number < 10 ? '0' + number : number
    }

    function timer() {
      setTimeout(timer, 53)
      console.log($scope.timeDelta)      
      $scope.$apply(function () {
        var now = Date.now() - $scope.timeDelta
        var time = $scope.timeEnd - now
        if (time < 0) {
          time = $scope.timeNext - now
          $scope.gameOver = true
        } else {
          $scope.gameOVer = false
        }
        time = Math.max(time, 0)
        $scope.timeLeft = Math.floor(time/1000)
        var ms = zeroPad(Math.floor(time % 1000 / 10))
        time /= 1000
        var sec = zeroPad(Math.floor(time % 60))
        time /= 60
        var min = zeroPad(Math.floor(time % 60))
        $scope.timer = min + ':' + sec + ':' + ms
      })
    }
    setTimeout(timer, 53)
  }])