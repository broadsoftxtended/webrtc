module.exports = require('webrtc-core').bdsft.View(AuthenticationView);

var $ = require('jquery');
var Utils = require('webrtc-core').utils;
var PopupView = require('./popup');

function AuthenticationView(eventbus, authentication) {
  var self = {};

  self.model = authentication;
  
  Utils.extend(self, PopupView(eventbus));

  self.elements = ['ok', 'userid', 'authUserid', 'password', 'alert'];

  self.init = function() {
  };

  self.listeners = function() {
    eventbus.on('authenticationFailed', function(e) {
      self.setVisible(true);
    });
    eventbus.on('authenticate', function(e) {
      self.setVisible(false);
    });

    self.ok.bind('click', function() {
      authentication.authenticate();
    });

    self.view.bind('keypress', function(e) {
      if (e.which === 13) {
        self.ok.click();
      }
    });
  };

  return self;
}