var boggle = require('boggle'),
    _ = require('lodash');

// warm up the solver byy loading the dictionary
boggle(Array.apply([],Array(4*4)).map(function(){return 'Z'}).join(''))
console.log(boggle('abcd abcd abcd piqz'))
var dice = ["AAEEGN", "ELRTTY", "AOOTTW", "ABBJOO", "EHRTVW", "CIMOTU",
"DISTTY", "EIOSST", "DELRVY", "ACHOPS", "HIMNQU", "EEINSU", "EEGHNW",
"AFFKPS", "HLNNRZ", "DEILRX"]

module.exports = {
  score: function (word) {
    var len = word.length
    if (len <= 2) return 0
    else if (len <= 4) return 1
    else if (len <= 5) return 2
    else if (len <= 6) return 3
    else if (len <= 7) return 5
    else return 11
  },
  solve: function (board) {
    return boggle(board.join(''))
  },
  generate: function () {
    return _.map(_.shuffle(dice), function(die) {
      var letter = _.sample(die)
      return letter
      //return letter == 'Q' ? 'Qu' : letter
    })
  }
}
