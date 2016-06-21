function createServicePack(execlib){
  'use strict';

  return {
    service: {
      dependencies: ['allex:need']
    },
    sinkmap: {
      dependencies: ['allex:need']
    }
  };
}

module.exports = createServicePack;
