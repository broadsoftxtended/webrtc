module.exports = TimerView;

var Utils = require('../Utils');

function TimerView(debug, eventbus, configuration, sipstack, videobarView) {
  var self = {};

  self.callTimer = null;
  self.startTime = null;

  self.elements = ['text'];

  self.init = function() {
    self.updateText();
  };

  self.listeners = function() {
    eventbus.on("started", function(e) {
      if (e.data && !e.data.isReconnect) {
        self.start();
      }
    });
  };

  self.start = function() {
    if (self.callTimer) {
      debug('timer ' + self.callTimer + ' already running');
      return;
    }

    var timer = self.runningTimer();
    self.callTimer = setInterval(timer, 1000);
    debug("started timer interval");
  };

  self.stop = function() {
    self.startTime = null;
    clearInterval(self.callTimer);
    debug("cleared timer interval");
    self.callTimer = null;
    self.updateText();
  };

  self.getSeconds = function() {
    return Math.round((new Date().getTime() - (self.startTime || new Date().getTime())) / 1000);
  };

  self.updateText = function() {
    var secs = self.getSeconds();
    self.text.text(Utils.format(secs));
  };

  // Display the timer on the screen
  self.runningTimer = function() {
    self.startTime = new Date().getTime();
    return function() {
      var secs = self.getSeconds();
      if (configuration.maxCallLength && secs >= configuration.maxCallLength) {
        sipstack.terminateSessions();
        videobarView.endCall();
        return;
      }
      self.updateText();
    };
  }

  return self;
}