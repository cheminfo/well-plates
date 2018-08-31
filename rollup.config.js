import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-babel-minify';

const output = {
  file: 'dist/well-plate.js',
  format: 'umd',
  name: 'wellPlate'
};

const outputMinified = Object.assign({}, output, {
  file: 'dist/well-plate.min.js',
  sourcemap: true
});

const minifyConfig = {
  comments: false
};

const babelConfig = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: [
            'chrome >= 54',
            'last 2 edge versions',
            'last 1 safari version'
          ]
        }
      }
    ]
  ]
};

const inputFile = './lib-es6/index.js';

export default [
  {
    input: inputFile,
    output,
    plugins: [babel(babelConfig)]
  },
  {
    input: inputFile,
    output: outputMinified,
    plugins: [babel(babelConfig), minify(minifyConfig)]
  }
];
