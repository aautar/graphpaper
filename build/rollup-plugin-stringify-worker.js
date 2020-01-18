const fs = require('fs');

const stringifyWorkerPlugin = function (options) {
    return {
        name: 'stringifyWorkerPlugin',
        writeBundle(bundle) {

            console.log(`Creating stringified worker...`);
            const workerCode = bundle[options.srcBundleName].code;
            const workerStringWrap = `const ConnectorRoutingWorkerJsString = \`${workerCode}\`; export { ConnectorRoutingWorkerJsString }`;

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
