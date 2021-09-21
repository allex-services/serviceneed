function createServiceNeedService(execlib,ParentService,portjobslib){
  'use strict';

  function factoryCreator(parentFactory){
    return {
      'service': require('./users/serviceusercreator')(execlib,parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib,parentFactory.get('user'),portjobslib) 
    };
  }

  function ServiceNeedService(prophash){
    ParentService.call(this,prophash);
  }
  ParentService.inherit(ServiceNeedService,factoryCreator);
  ServiceNeedService.prototype.__cleanUp = function(){
    ParentService.prototype.__cleanUp.call(this);
  };
  ServiceNeedService.prototype.needFields = ParentService.prototype.needFields.concat(['pid','ipaddress','tcpport','httpport','wsport']);
  
  return ServiceNeedService;
}

module.exports = createServiceNeedService;
