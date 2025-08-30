import babel from '@rollup/plugin-babel';
import stringifyWorker from './build/rollup-plugin-stringify-worker';

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
    [
      'minify', {
        builtIns: false,
        deadcode: false,
      }
    ], 
  ],
  comments: false,
  exclude: 'node_modules/**',
};

// rollup.config.js
export default [
  {
    input: 'src/Workers/ConnectorRoutingWorker.mjs',
    output: {
      format: 'iife',
      file: 'dist/workers/connector-routing-worker.js',
      name: 'ConnectorRoutingWorker'
    }
  },
  {
    input: 'src/Workers/ConnectorRoutingWorker.mjs',
    output: {
      format: 'iife',
      file: 'dist/workers/connector-routing-worker.min.js',
      name: 'ConnectorRoutingWorker',
      sourcemap: false,
    },
    plugins: [
      babel(babelConfig),
      stringifyWorker(
        {
          "exportVarName": "ConnectorRoutingWorkerJsString",
          "srcBundleName": "connector-routing-worker.min.js",
          "dest": "src/Workers/ConnectorRoutingWorker.string.mjs"
        }
      )
    ],
  },
  {
    input: 'src/Workers/ClusterDetectionWorker.mjs',
    output: {
      format: 'iife',
      file: 'dist/workers/cluster-detection-worker.min.js',
      name: 'ClusterDetectionWorker',
      sourcemap: false,
    },
    plugins: [
      babel(babelConfig),
      stringifyWorker(
        {
          "exportVarName": "ClusterDetectionWorkerJsString",
          "srcBundleName": "cluster-detection-worker.min.js",
          "dest": "src/Workers/ClusterDetectionWorker.string.mjs"
        }
      )
    ],
  },
  // ESM dist files
  {
    input: 'src/GraphPaperWrappedExport.mjs',
    output: {
      format: 'es',
      file: 'dist/graphpaper.esm.js',
    }
  },
  // CJS dist files
  {
    input: 'src/GraphPaper.mjs',
    output: {
      format: 'cjs',
      file: 'dist/graphpaper.cjs.js',
    }
  },
  // IIFE dist files
  {
    input: 'src/GraphPaper.mjs',
    output: {
      format: 'iife',
      file: 'dist/graphpaper.js',
      name: 'GraphPaper'
    }
  },
  // IIFE minifed dist files 
  {
    input: 'src/GraphPaper.mjs',
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
