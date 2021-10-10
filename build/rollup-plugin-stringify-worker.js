const fs = require('fs');

const stringifyWorkerPlugin = function (options) {
    return {
        name: 'stringifyWorkerPlugin',
        writeBundle(bundleOpts, bundle) {

            console.log(`Creating stringified worker...`);
            const workerCode = bundle[options.srcBundleName].code;
            const workerStringWrap = `const ${options.exportVarName} = String.raw\`${workerCode}\`; export { ${options.exportVarName} }`;

            fs.writeFile(options.dest, workerStringWrap, function(err) {
                if(err) {
                    throw err;
                }

                console.log(`Stringified worker created: ${options.srcBundleName} -> ${options.dest}`);
            });

        }
    };
};


export default stringifyWorkerPlugin;
