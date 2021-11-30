import esbuild from 'rollup-plugin-esbuild';
import path from 'path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import * as fs from 'fs-extra';

function external(id) {
  return !id.startsWith('.') && !path.isAbsolute(id);
}

function resolveApp(relativePath) {
  return path.resolve(relativePath);
}

const distPath = resolveApp('dist');
const packageName = 'web-core';

async function cleanDistFolder() {
  await fs.remove(distPath);
}

function resolveOutputPath(outputName) {
  return path.join(distPath, outputName);
}

/**
 * @typedef BuildOptions
 * @property {string} format
 * @property {string} [env]
 * @property {boolean} [minify]
 */

/**
 * @param {BuildOptions} options
 * @returns {string} outputName
 */
function getOutputName(options) {
  return [
    packageName,
    options.format,
    options.env,
    options.minify ? 'min' : '',
    'js',
  ]
    .filter(Boolean)
    .join('.');
}

/**
 * @param {BuildOptions} options
 * @returns {string} outputPath
 */
function getOutputPath(options) {
  return resolveOutputPath(getOutputName(options));
}

/**
 * @type {BuildOptions}
 */
const CJS_DEV_CONFIG = { format: 'cjs', env: 'development' };

/**
 * @type {BuildOptions}
 */
const CJS_PROD_CONFIG = { format: 'cjs', env: 'production', minify: true };

/**
 * @type {BuildOptions}
 */
const ESM_CONFIG = { format: 'esm' };

function writeCjsEntryFile() {
  const contents = `'use strict'
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./${getOutputName(CJS_PROD_CONFIG)}')
} else {
  module.exports = require('./${getOutputName(CJS_DEV_CONFIG)}')
}
`;
  return fs.outputFile(resolveOutputPath('index.js'), contents);
}

/**
 * @param {BuildOptions} options
 * @returns {object} config
 */
function createRollupConfig(options) {
  return {
    input: 'src/main.ts',
    output: {
      file: getOutputPath(options),
      format: options.format,
    },
    plugins: [
      options.format === 'esm'
        ? alias({
            entries: {
              lodash: 'lodash-es',
            },
          })
        : null,
      nodeResolve(),
      options.format === 'cjs' ? commonjs() : null,
      esbuild({ minify: options.minify, target: 'es2015', tsconfig: false }),
    ].filter(Boolean),
    external: (id) => {
      if (['js-cookie'].includes(id)) {
        return false;
      }

      return external(id);
    },
  };
}

export default async function () {
  await cleanDistFolder();
  await writeCjsEntryFile();

  return [
    createRollupConfig(CJS_DEV_CONFIG),
    createRollupConfig(CJS_PROD_CONFIG),
    createRollupConfig(ESM_CONFIG),
  ];
}
