const DebugMetricsPanel = function(_window) {
    var debugPanelElem = null;
    var isVisible = false;

    const objectHtmlDumpDepthFirst = function(_obj, _output, _parentName) {
        if(typeof _parentName === 'undefined') {
            _parentName = "";
        }

        if(_obj instanceof Object) {
            Object.keys(_obj).forEach((_k) => {
                if(_obj[_k] instanceof Object) {
                    objectHtmlDumpDepthFirst(_obj[_k], _output, _k);
                } else {
                    let prefix = "";
                    if(_parentName.length > 0) {
                        prefix = _parentName + ".";
                    }

                    const metricName = `${prefix}${_k}`;
                    _output.push(`<p class="metric">${metricName} = ${_obj[_k]}</p>`);
                }
            });
        }
    };

    this.init = function() {
        debugPanelElem = _window.document.createElement("div");
        debugPanelElem.classList.add("graphpaper-debug-panel");
        debugPanelElem.style.display = "none";
        debugPanelElem.style.position = "fixed";
        debugPanelElem.style.right = "0px";
        debugPanelElem.style.top = "0px";
        debugPanelElem.style.width = "500px";
        debugPanelElem.style.height = "200px";
        debugPanelElem.style.color = "#fff";
        debugPanelElem.style.padding = "15px";
        debugPanelElem.style.backgroundColor = "rgba(0,0,0,0.75)";
        debugPanelElem.style.zIndex = 9999;
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

        const htmlStringsArr = [];
        objectHtmlDumpDepthFirst(_metrics, htmlStringsArr);
        debugPanelElem.innerHTML = htmlStringsArr.join('');
    };

};

export { DebugMetricsPanel };
