function createUser(execlib,ParentUser){
  var lib = execlib.lib,
      q = lib.q;

  function testPort(ipaddress,port){
    var d = q.defer();
    if(!(ipaddress&&port)){
      d.reject('no can do, ipaddress: '+ipaddress+', port: '+port);
    }else{
      var c = new require('net').Socket();
      console.log('testing',ipaddress,':',port);
      c.on('error',d.reject.bind(d));
      c.connect(port,ipaddress,d.resolve.bind(d,port));
    }
    return d.promise;
  }

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
    defer.resolve({timeout:60});
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
      testPort(ipaddress,response.httpport).then(successProc.bind(null,'httpport'))
    ]).done(function(states){
      console.log('allSettled',states);
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
