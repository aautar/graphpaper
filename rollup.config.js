import babel from 'rollup-plugin-babel';
import stringifyWorkersPlugin from './build/StringifyWorkersPlugin';

const babelConfig = {
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
};

// rollup.config.js
export default [
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
      sourcemap: false,
    },
    plugins: [
      babel(babelConfig),
      stringifyWorkersPlugin()
    ],        
  },  
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
      babel(babelConfig),
    ],        
  }
];
