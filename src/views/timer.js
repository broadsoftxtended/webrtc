module.exports = require('../factory')(TimerView);

var Utils = require('../Utils');

function TimerView(options, debug, statsView, configuration) {
  var self = {};

  self.callTimer = null;
  self.startTime = null;

  self.start = function() {
    if (self.callTimer) {
      debug('timer ' + self.callTimer + ' already running');
      return;
    }

    var timer = self.runningTimer();
    self.callTimer = setInterval(timer, 1000);
    debug("started timer interval : " + self.callTimer);
  },

  self.stop = function() {
    self.startTime = null;
    clearInterval(self.callTimer);
    debug("cleared timer interval : " + self.callTimer);
    self.callTimer = null;
    self.updateText();
  },

  self.getSeconds = function() {
    return Math.round((new Date().getTime() - (self.startTime || new Date().getTime())) / 1000);
  },

  self.updateText = function() {
    var secs = self.getSeconds();
    self.text.text(Utils.format(secs));
  },

  // Display the timer on the screen
  self.runningTimer = function() {
    self.startTime = new Date().getTime();
    return function() {
      var secs = self.getSeconds();
      if (self.configuration.maxCallLength && secs >= self.configuration.maxCallLength) {
        self.client.terminateSessions();
        self.client.endCall();
        return;
      }
      self.updateText();
      if (self.configuration.enableCallStats && Utils.isChrome()) {
        self.statsView.processStats();
      }
    };
  }

  self.updateText();

  return self;
}