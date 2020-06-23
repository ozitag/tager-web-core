// const commonjs = require('@rollup/plugin-commonjs');
const path = require('path');

/**
 * Source:
 * https://github.com/formik/tsdx/blob/158ee9a69c824b71b62cf987fe943a167f47f936/src/utils.ts#L22-L23
 */
function external(id) {
    const peerDependencies = ['react', 'next']
    const dependencies = ['js-cookie', 'react-ga']

    if (dependencies.includes(id)) return false;
    if (peerDependencies.includes(id)) return true;

    return !id.startsWith('.') && !path.isAbsolute(id);
}

module.exports = {
    rollup(config) {
        // Delete the external config property.
        // This essentially means we're allowing all packages to be bundled.
        /**
         * Sources:
         * https://github.com/formik/tsdx/blob/158ee9a69c824b71b62cf987fe943a167f47f936/src/createRollupConfig.ts#L55-L59
         * https://github.com/formik/tsdx/issues/6#issuecomment-593146533
         */
        // config.external = (id) => {
        //     if ('babel-plugin-transform-async-to-promises/helpers' === id) {
        //         return false;
        //     }
        //     console.log(`ID: "${id}" : ${external(id)}`)
        //     return external(id);
        // }

        // Manually use the commonjs plugin.
        // This is opposed to specifying umd as the format as there's more implications that, again, are unclear.
        // config.plugins.push(commonjs());

        return config;
    },
};