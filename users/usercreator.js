function createUser(execlib,ParentUser){
  'use strict';
  var lib = execlib.lib,
      q = lib.q,
      execSuite = execlib.execSuite,
      testPort = execSuite.isPortFree;
      //testPort = require('allex_port_sniffer')(q)

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
    return this.__service.bids.count<1;
  };
  User.prototype.produceChallenge = function(offering,bidticket,defer){
    var ipaddress = this.__service.state.get('ipaddress');
    if(!offering){
      defer.resolve();
      return;
    }
    if(ipaddress && offering.ipaddress !== ipaddress){
      //console.log('ipaddress mismatch "'+offering.ipaddress+'"<> my ipaddress "'+ipaddress+'"', typeof offering.ipaddress, typeof ipaddress, offering.ipaddress != ipaddress);
      defer.resolve();
    }else{
      //console.log('ipaddress passed', offering, 'my ipaddress', ipaddress);
      //defer.resolve({timeout:this.__service.state.get('timeout')||60});
      defer.resolve(this.__service.state.get('timeout') ? {timeout:this.__service.state.get('timeout')} : true);
    }
  };
  User.prototype.checkChallengeResponse = function(bidticket,challenge,response,defer){
    //ping the ports (according to protocol, appropriately)
    var successcount = 0, state = this.__service.state, ipaddress = response.ipaddress;
    function onTestIfFree(portname,portval,isfree){
      if(!isfree){
        successcount++;
        //console.log(portname,portval,'ok');
        state.set(portname,portval);
      }
      return isfree ? null : portval;
    }
    q.allSettled([
      testPort(response.tcpport,ipaddress).then(onTestIfFree.bind(null,'tcpport',response.tcpport)),
      testPort(response.httpport,ipaddress).then(onTestIfFree.bind(null,'httpport',response.httpport)),
      testPort(response.wsport,ipaddress).then(onTestIfFree.bind(null,'wsport',response.wsport))
    ]).done(function(states){
      if(successcount){
        defer.resolve(null);
        state.set('ipaddress',ipaddress);
      }else{
        defer.reject(new lib.Error('NO_PORTS_REACHABLE'));
      }
    });
  };

  return User;
}

module.exports = createUser;
