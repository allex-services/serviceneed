function createUser(execlib,ParentUser,portjobslib){
  'use strict';
  var lib = execlib.lib,
      q = lib.q;

  if(!ParentUser){
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function User(prophash){
    ParentUser.call(this,prophash);
  }
  ParentUser.inherit(User,require('../methoddescriptors/user'));
  function rejector(defer){
    defer.reject(new lib.Error('ALREADY_SATISFIED'));
  }
  User.prototype.__cleanUp = function(){
    ParentUser.prototype.__cleanUp.call(this);
  };
  User.prototype.canAcceptMoreBids = function(){
    return true;
  };
  User.prototype.produceChallenge = function(offering,bidticket,defer){
    var ipaddress = this.__service.state.get('ipaddress');
    if(!offering){
      defer.resolve();
      offering = null;
      bidticket = null;
      defer = null;
      return;
    }
    if(ipaddress && offering.ipaddress && !lib.cidrMatch(offering.ipaddress, ipaddress)) {
      //console.log('ipaddress mismatch "'+offering.ipaddress+'"<> my ipaddress "'+ipaddress+'"', typeof offering.ipaddress, typeof ipaddress, offering.ipaddress != ipaddress);
      defer.resolve();
    }else{
      //console.log('ipaddress passed', offering, 'my ipaddress', ipaddress);
      //defer.resolve({timeout:this.__service.state.get('timeout')||60});
      defer.resolve(this.__service.state.get('timeout') ? {timeout:this.__service.state.get('timeout')} : true);
    }
    offering = null;
    bidticket = null;
    defer = null;
  };
  User.prototype.checkChallengeResponse = function(bidticket,challenge,response,defer){
    //ping the ports (according to protocol, appropriately)
    ((new portjobslib.AnyTaken([
      {port: response.tcpport, ipaddress: response.ipaddress},
      {port: response.httpport, ipaddress: response.ipaddress},
      {port: response.wsport, ipaddress: response.ipaddress}
    ])).go()).done(function (anytaken) {
      if (anytaken) {
        defer.resolve(null);
      } else {
        defer.reject(new lib.Error('NO_PORTS_REACHABLE'));
      }
      defer = null;
    },function (reason) {
      defer.reject(reason);
      defer = null;
    });
  };

  return User;
}

module.exports = createUser;
