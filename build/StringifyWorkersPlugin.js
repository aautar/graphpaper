const fs = require('fs');

const stringifyConnectorRoutingWorker = function(workerCode) {
    const workerStringWrap = `const ConnectorRoutingWorker = \`${workerCode}\`; export { ConnectorRoutingWorker }`;
    fs.writeFile('src/Workers/ConnectorRoutingWorker.string.js', workerStringWrap, function(err) {
        if (err) throw err;
        console.log(`UPDATED src/Workers/ConnectorRoutingWorker.string.js`);
    });
};

const stringifyWorkersPlugin = function (options) {
    return {
        writeBundle(bundle) {
            console.log(`Creating stringified workers...`);
            stringifyConnectorRoutingWorker(bundle['connector-routing-worker.min.js'].code);
        }
    };
};


export default stringifyWorkersPlugin;
