function createServiceNeedServiceTester(execlib,Tester){
  var lib = execlib.lib,
      q = lib.q;

  function ServiceNeedServiceTester(prophash,client){
    Tester.call(this,prophash,client);
    console.log('runNext finish');
    lib.runNext(this.finish.bind(this,0));
  }
  lib.inherit(ServiceNeedServiceTester,Tester);

  return ServiceNeedServiceTester;
}

module.exports = createServiceNeedServiceTester;
