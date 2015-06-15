function createServiceNeedUserTester(execlib,Tester){
  'use strict';
  var lib = execlib.lib,
      q = lib.q;

  function ServiceNeedUserTester(prophash,client){
    Tester.call(this,prophash,client);
    console.log('runNext finish');
    lib.runNext(this.finish.bind(this,0));
  }
  lib.inherit(ServiceNeedUserTester,Tester);

  return ServiceNeedUserTester;
}

module.exports = createServiceNeedUserTester;
