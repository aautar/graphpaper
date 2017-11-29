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
    input: 'src/GraphPaperWorker.js',
    output: {
      format: 'iife',
      file: 'dist/graphpaper-worker.js',
      name: 'GraphPaperWorker'
    }
  }  
];
