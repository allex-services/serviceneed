function createServicePack(execlib){
  'use strict';

  return {
    service: {
      dependencies: ['allex_needservice', 'allex:porthandlingjobs:lib']
    },
    sinkmap: {
      dependencies: ['allex_needservice']
    }
  };
}

module.exports = createServicePack;
