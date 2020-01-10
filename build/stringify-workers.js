const fs = require('fs');

const stringifyConnectorRoutingWorker = function() {
    fs.readFile('dist/workers/connector-routing-worker.min.js', 'utf8', function(err, workerCode) {
        if (err) throw err;

        const workerStringWrap = `
            const ConnectorRoutingWorker = \`${workerCode}\`; 
            export { ConnectorRoutingWorker }
        `;


        fs.writeFile('src/Workers/ConnectorRoutingWorker.string.js', workerStringWrap, function(err) {
            if (err) throw err;
            console.log(`UPDATED src/Workers/ConnectorRoutingWorker.string.js`);
        });        
    });
};

console.log(`Creating stringified workers...`);
stringifyConnectorRoutingWorker();
