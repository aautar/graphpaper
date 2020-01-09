import babel from 'rollup-plugin-babel';

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
    input: 'src/GraphPaper.js',
    output: {
      format: 'iife',
      file: 'dist/graphpaper.min.js',
      name: 'GraphPaper',
      sourcemap: true  
    },
    plugins: [
      babel({
        babelrc: false,
        presets: [
          [
            '@babel/env', 
            {
              targets: {
                "chrome": "41"
              },       
              "corejs": "2",
              useBuiltIns: "usage"     
            }
          ],          
          ['minify', {
            builtIns: false,
            deadcode: false,
          }], 
        ],
        comments: false,
        
        exclude: 'node_modules/**',
      }),
    ],        
  },  
  {
    input: 'src/Workers/ConnectorRoutingWorker.js',
    output: {
      format: 'iife',
      file: 'dist/workers/connector-routing-worker.js',
      name: 'ConnectorRoutingWorker'
    }
  },
  {
    input: 'src/Workers/ConnectorRoutingWorker.js',
    output: {
      format: 'iife',
      file: 'dist/workers/connector-routing-worker.min.js',
      name: 'ConnectorRoutingWorker',
      sourcemap: true  
    },
    plugins: [
      babel({
        babelrc: false,
        presets: [
          [
            '@babel/env', 
            {
              targets: {
                "chrome": "41"
              },       
              "corejs": "2",
              useBuiltIns: "usage"     
            }
          ],          
          ['minify', {
            builtIns: false,
            deadcode: false,
          }], 
        ],
        comments: false,
        
        exclude: 'node_modules/**',
      }),
    ],        
  },    
];
