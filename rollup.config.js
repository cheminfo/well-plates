import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-babel-minify';

const isProd = process.env.NODE_ENV === 'production';

const plugins = [];
if (isProd) {
  plugins.push(
    minify({
      comments: false
    })
  );
}

const output = {
  file: 'dist/well-plate.js',
  format: 'umd',
  name: 'wellPlate'
};

if (isProd) {
  output.file = 'dist/well-plate.min.js';
  output.sourcemap = true;
}
plugins.push(
  babel({
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
  })
);

export default {
  input: './lib-es6/index.js',
  output,
  plugins
};
