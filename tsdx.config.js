const commonjs = require('@rollup/plugin-commonjs');
const path = require('path');

/**
 * Source:
 * https://github.com/formik/tsdx/blob/158ee9a69c824b71b62cf987fe943a167f47f936/src/utils.ts#L22-L23
 */
function external(id) {
    const peerDependencies = ['react', 'next']
    const externalDependencies = ['cookie'];
    const dependencies = ['js-cookie', 'react-ga', 'lodash/round', 'lodash-es/round']

    if (dependencies.includes(id)) return false;
    if (peerDependencies.includes(id) || externalDependencies.includes(id)) return true;

    return !id.startsWith('.') && !path.isAbsolute(id);
}

module.exports = {
    rollup(config) {
        /**
         * Sources:
         * https://github.com/formik/tsdx/blob/158ee9a69c824b71b62cf987fe943a167f47f936/src/createRollupConfig.ts#L55-L59
         * https://github.com/formik/tsdx/issues/6#issuecomment-593146533
         */
        config.external = (id) => {
            if ('babel-plugin-transform-async-to-promises/helpers' === id) {
                return false;
            }
            return external(id);
        }

        /**
         * Manually use the commonjs plugin.
         * This is opposed to specifying umd as the format as there's more implications that, again, are unclear.
         */
        config.plugins.push(commonjs());

        return config;
    },
};