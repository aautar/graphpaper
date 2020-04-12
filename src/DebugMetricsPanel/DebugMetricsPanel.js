const DebugMetricsPanel = function(_window) {
    var debugPanelElem = null;
    var isVisible = false;

    this.init = function() {
        debugPanelElem = _window.document.createElement("div");
        debugPanelElem.classList.add("graphpaper-debug-panel");
        debugPanelElem.style.display = "none";
        debugPanelElem.style.position = "fixed";
        debugPanelElem.style.right = "0px";
        debugPanelElem.style.top = "0px";
        debugPanelElem.style.width = "450px";
        debugPanelElem.style.height = "200px";
        debugPanelElem.style.color = "#fff";
        debugPanelElem.style.padding = "15px";
        debugPanelElem.style.backgroundColor = "rgba(0,0,0,0.75)";
        _window.document.body.appendChild(debugPanelElem);
    };

    this.show = function() {
        isVisible = true;
        debugPanelElem.style.display = "block";
    };

    this.hide = function() {
        isVisible = false;
        debugPanelElem.style.display = "none";
    };

    this.refresh = function(_metrics) {
        if(isVisible === false) {
            return;
        }

        debugPanelElem.innerHTML = `
            <p>refreshAllConnectorsInternal.executionTime = ${_metrics.refreshAllConnectorsInternal.executionTime}</p>
            <p>connectorRoutingWorker.executionTime = ${_metrics.connectorRoutingWorker.executionTime}</p>            
            <p>-- connectorRoutingWorker.msgDecodeTime = ${_metrics.connectorRoutingWorker.msgDecodeTime}</p>
            <p>-- connectorRoutingWorker.pointVisibilityMapCreationTime = ${_metrics.connectorRoutingWorker.pointVisibilityMapCreationTime}</p>
            <p>-- connectorRoutingWorker.numRoutingPoints = ${_metrics.connectorRoutingWorker.numRoutingPoints}</p>
            <p>-- connectorRoutingWorker.numBoundaryLines = ${_metrics.connectorRoutingWorker.numBoundaryLines}</p>
            <p>connectorsRefreshTime = ${_metrics.connectorsRefreshTime}</p>
        `;
    };

};

export { DebugMetricsPanel };
