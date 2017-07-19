function createServicePack(execlib){
  'use strict';

  return {
    service: {
      dependencies: ['allex_needservice']
    },
    sinkmap: {
      dependencies: ['allex_needservice']
    }
  };
}

module.exports = createServicePack;
