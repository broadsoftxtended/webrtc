module( "Configuration", {
  setup: function() {
    TestWebrtc.Helpers.mockSound();
    TestWebrtc.Helpers.mockLocation();
    WebRTC.Utils.getSearchVariable = function(name){ return false;}
    $.cookie("settingResolutionDisplay", "");
    $.cookie("settingResolutionEncoding", "");
    ClientConfig.enableCallStats = false;
  }, teardown: function() {
  }
});
test('websocketsServers', function() {
  ClientConfig.websocketsServers = [
    {'ws_uri':'ws://webrtc-gw1.broadsoft.com:8060', 'weight':0},
    {'ws_uri':'ws://webrtc-gw2.broadsoft.com:8060', 'weight':0},
    {'ws_uri':'ws://webrtc-gw.broadsoft.com:8060', 'weight':0}]
  client = new WebRTC.Client();
  strictEqual(client.sipStack.ua.configuration.ws_servers.length, 3);
});
test('userid', function() {
  client = new WebRTC.Client();
  ok("chooses random userid", client.configuration.userid !== undefined);
});
test('destination', function() {
  ClientConfig.enableConnectLocalMedia = true;
  ClientConfig.domainTo = "domain.to";
  ClientConfig.allowOutside = true;
  WebRTC.Utils.getSearchVariable = function(name){ return name === "destination" ? "8323303810" : false;}
  client = new WebRTC.Client();
  var calledDestination = '';
  client.sipStack.call = function(destination){calledDestination = destination;};
  client.sipStack.ua.getUserMedia = function(options, success, failure, force){success();};

  TestWebrtc.Helpers.connect();
  strictEqual(calledDestination, "sip:8323303810@domain.to");
});
test('WEBRTC-35 : destination with dtmf tones', function() {
  ClientConfig.enableConnectLocalMedia = true;
  ClientConfig.domainTo = "domain.to";
  ClientConfig.allowOutside = true;
  WebRTC.Utils.getSearchVariable = function(name){ return name === "destination" ? "8323303810,,123132" : false;}
  client = new WebRTC.Client();
  var calledDestination = '', sentTones = '';
  client.sipStack.call = function(destination){calledDestination = destination;};
  client.sipStack.sendDTMF = function(tones){sentTones = tones;};
  client.sipStack.ua.getUserMedia = function(options, success, failure, force){success();};

  TestWebrtc.Helpers.connect();
  strictEqual(calledDestination, "sip:8323303810@domain.to");

  TestWebrtc.Helpers.startCall();
  strictEqual(sentTones, ",,123132");
});
test('WEBRTC-35 : destination with dtmf tones and #', function() {
  ClientConfig.enableConnectLocalMedia = true;
  ClientConfig.domainTo = "domain.to";
  ClientConfig.allowOutside = true;
  WebRTC.Utils.getSearchVariable = function(name){ return name === "destination" ? "8323303810,,123132#" : false;}
  client = new WebRTC.Client();
  var calledDestination = '', sentTones = '';
  client.sipStack.call = function(destination){calledDestination = destination;};
  client.sipStack.sendDTMF = function(tones){sentTones = tones;};
  client.sipStack.ua.getUserMedia = function(options, success, failure, force){success();};

  TestWebrtc.Helpers.connect();
  strictEqual(calledDestination, "sip:8323303810@domain.to");

  TestWebrtc.Helpers.startCall();
  strictEqual(sentTones, ",,123132#");
});
test('WEBRTC-35 : destination with dtmf tones and domain', function() {
  ClientConfig.enableConnectLocalMedia = true;
  ClientConfig.domainTo = "domain.to";
  ClientConfig.allowOutside = true;
  WebRTC.Utils.getSearchVariable = function(name){ return name === "destination" ? "8323303810,,123132@some.domain" : false;}
  client = new WebRTC.Client();
  var calledDestination = '', sentTones = '';
  client.sipStack.call = function(destination){calledDestination = destination;};
  client.sipStack.sendDTMF = function(tones){sentTones = tones;};
  client.sipStack.ua.getUserMedia = function(options, success, failure, force){success();};

  TestWebrtc.Helpers.connect();
  strictEqual(calledDestination, "sip:8323303810@some.domain");

  TestWebrtc.Helpers.startCall();
  strictEqual(sentTones, ",,123132");
});
test('register', function() {
  client = new WebRTC.Client();
  strictEqual(client.sipStack.configuration.getRegister(), false);
});
test('register after persist', function() {
  client = new WebRTC.Client();
  strictEqual(client.sipStack.configuration.getRegister(), false);
  client.settings.save.trigger("click");
  client.timer.stop();
  client = new WebRTC.Client();
  strictEqual(client.sipStack.configuration.getRegister(), false);
});
test('getExSIPOptions', function() {
  client = new WebRTC.Client();
  strictEqual(client.settings.audioOnly, undefined);

  var options = {
    mediaConstraints: { audio: true, video: { mandatory: { maxWidth: 640, maxHeight: 480 }}},
    RTCConstraints: {'optional': [],'mandatory': {}},
    createOfferConstraints: {mandatory:{OfferToReceiveAudio:true,OfferToReceiveVideo:true}}
  };
  deepEqual(client.configuration.getExSIPOptions(), options);
});
test('getExSIPOptions with resolution', function() {
  client = new WebRTC.Client();
  strictEqual(client.configuration.audioOnly, false);
  strictEqual(client.configuration.hd, "false");
  client.settings.setResolutionEncoding('320x240');
  var options = {
    mediaConstraints: { audio: true, video: { mandatory: { maxWidth: 320, maxHeight: 240 }}},
    RTCConstraints: {'optional': [],'mandatory': {}},
    createOfferConstraints: {mandatory:{OfferToReceiveAudio:true,OfferToReceiveVideo:true}}
  };
  deepEqual(client.configuration.getExSIPOptions(), options);
});
test('getExSIPOptions with resolution 960x720', function() {
  client = new WebRTC.Client();
  strictEqual(client.configuration.audioOnly, false);
  strictEqual(client.configuration.hd, "false");
  client.settings.setResolutionEncoding('960x720');
  var options = {
    mediaConstraints: { audio: true, video: { mandatory: { minWidth: 960, minHeight: 720 }}},
    RTCConstraints: {'optional': [],'mandatory': {}},
    createOfferConstraints: {mandatory:{OfferToReceiveAudio:true,OfferToReceiveVideo:true}}
  };
  deepEqual(client.configuration.getExSIPOptions(), options);
});
test('getExSIPOptions with hd=true', function() {
  WebRTC.Utils.getSearchVariable = function(name){ return name === "hd" ? "true" : false;}
  client = new WebRTC.Client();
  strictEqual(client.configuration.audioOnly, false);
  strictEqual(client.configuration.hd, true);
  client.settings.setResolutionEncoding('960x720');
  var options = {
    mediaConstraints: { audio: true, video: { mandatory: { minWidth: 1280, minHeight: 720 }}},
    RTCConstraints: {'optional': [],'mandatory': {}},
    createOfferConstraints: {mandatory:{OfferToReceiveAudio:true,OfferToReceiveVideo:true}}
  };
  deepEqual(client.configuration.getExSIPOptions(), options);
});
