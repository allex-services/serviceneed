function createUser(execlib,ParentUser){
  var lib = execlib.lib,
      q = lib.q,
      testPort = require('allex_port_sniffer')(q);

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
    console.log('process offering',offering,'my ipaddress',ipaddress);
    if(ipaddress && offering.ipaddress!==ipaddress){
      defer.resolve();
    }else{
      defer.resolve({timeout:this.__service.state.get('timeout')||60});
    }
  };
  User.prototype.checkChallengeResponse = function(bidticket,challenge,response,defer){
    //ping the ports (according to protocol, appropriately)
    var successcount = 0, state = this.__service.state, ipaddress = response.ipaddress;
    function successProc(portname,portval){
      console.log(portname,'succeeded at',portval);
      successcount++;
      state.set(portname,portval);
      return portval;
    }
    q.allSettled([
      testPort(ipaddress,response.tcpport).then(successProc.bind(null,'tcpport')),
      testPort(ipaddress,response.httpport).then(successProc.bind(null,'httpport')),
      testPort(ipaddress,response.wsport).then(successProc.bind(null,'wsport'))
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
