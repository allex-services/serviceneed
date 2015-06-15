function createServicePack(execlib){
  'use strict';
  var execSuite = execlib.execSuite,
      NeedServicePack = execSuite.registry.register('allex_needservice'),
      ParentServicePack = NeedServicePack;

  return {
    Service: require('./servicecreator')(execlib,ParentServicePack),
    SinkMap: require('./sinkmapcreator')(execlib,ParentServicePack)
  };
}

module.exports = createServicePack;
