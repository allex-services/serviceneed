function createUser(execlib,ParentUser){
  var lib = execlib.lib;

  if(!ParentUser){
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function User(prophash){
    ParentUser.call(this,prophash);
    this.pendingDefer = null;
    this.satisfied = false;
  }
  ParentUser.inherit(User,require('../methoddescriptors/user'));
  function rejector(defer){
    defer.reject(new lib.Error('ALREADY_SATISFIED'));
  }
  User.prototype.__cleanUp = function(){
    this.satisfied = null;
    if(this.pendingDefer){
      this.pendingDefer.resolve('ok');
    }
    this.pendingDefer = null;
    ParentUser.prototype.__cleanUp.call(this);
  };
  User.prototype.canAcceptMoreBids = function(){
    return this.__service.bids.count<1;
  };
  User.prototype.produceChallenge = function(offering,bidticket,defer){
    defer.resolve({timeout:60});
  };
  User.prototype.checkChallengeResponse = function(bidticket,challenge,response,defer){
    console.log(this.get('name'),'checkChallengeResponse','pendingDefer',this.pendingDefer,'satisfied',this.satisfied);
    if(this.pendingDefer){
      defer.reject(new lib.Error('ALREADY_HAVE_PENDING_RESPONSE'));
      return;
    }
    if(this.satisfied){
      defer.resolve('ok');
    }else{
      this.pendingDefer = defer;
    }
  };
  function setter(u,item,itemname){
    u.set(itemname,item);
  }
  User.prototype.registerRunning = function(runningservicerecord,defer){
    lib.traverse(runningservicerecord,setter.bind(null,this.__service.state));
    this.__service.state.set('ipaddress',this.get('name'));
    console.log(this.get('name'),this.role,'registerRunning',runningservicerecord,this.pendingDefer ? 'with' : 'without', 'pendingDefer');
    this.__service.state.data.dumpToConsole();
    defer.resolve('ok');
    if(this.pendingDefer){
      this.pendingDefer.resolve('ok');
      this.pendingDefer = null;
    }
    this.satisfied = true;
  };

  return User;
}

module.exports = createUser;
