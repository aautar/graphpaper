// rollup.config.js
export default [
  {
    input: 'src/GraphPaper.js',
    output: {
      format: 'iife',
      file: 'dist/graphpaper.js',
      name: 'GraphPaper'
    }
  },
  {
    input: 'src/ConnectorRoutingWorker.js',
    output: {
      format: 'iife',
      file: 'dist/connector-routing-worker.js',
      name: 'ConnectorRoutingWorker'
    }
  }  
];
