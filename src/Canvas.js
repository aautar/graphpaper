import  {Object} from './Object';
import  {Rectangle} from './Rectangle';

/**
 * 
 * @param {Element} _canvasDomElement 
 */
function Canvas(_canvasDomElement) {

    var self = this;
    
    var gridSize = 12.0;

    /**
     * @returns {Number}
     */
    this.getGridSize = function() {
        return gridSize;
    }

    var scaleFactor = 1.0;
    var useTranslate3d = false; // better performance w/o it
    var canvasObjects = [];

    this.objectIdBeingDragged = null;
    this.objectIdBeingResized = null;
    
    this.objectDragX = 0.0;
    this.objectDragY = 0.0;
    this.objectDragStartX = 0.0;
    this.objectDragStartY = 0.0;

    this.highlightMask = null;
    this.highlightedObjects = [];
    
    this.onObjectTransform = _onObjectTransform;
    this.reqDisableObjectSelection = _reqDisableObjectSelection;
    this.reqEnableObjectSelection = _reqEnableObjectSelection;

    /**
     * @param {Number} _p 
     * @returns {Number}
     */
    var snap = function(_p) {
        var ret = Math.round(_pos/self.getGridSize()) * self.getGridSize();
        return Math.max(0, ret - 1);
    }

    /**
     * @param {Object} _obj
     */
    this.snapObjectToGrid = function(_obj) {
        var newX = self.snap(_obj.getX());
        var newY = self.snap(_obj.getY());
        _obj.setX(newX);
        _obj.setY(newY);
    };

    /**
     * @param {Number} _x
     * @param {Number} _y
     * @returns {Object[]}
     */
    this.getObjectsAroundPoint = function(_x, _y) {
        var result = [];

        var ptRect = new Rectangle(_x, _y, _x+1, _y+1);

        self.canvasObjects.forEach(function(_obj) {
            if(!_obj.getIsDeleted() && ptRect.checkIntersect(_obj.getBoundingRectange())) {
                result.push(_obj);
            }
        });

        return result;
    };
    
    /**
     * @returns {Rectangle}
     */
    this.calcBoundingBox = function() {

        var minTop = null;
        var minLeft = null;
        var maxBottom = null;
        var maxRight = null;

        self.canvasObjects.forEach(function(element, index, array) {

            var left = parseInt(element.getX());
            var top = parseInt(element.getY());  
            var right = left + parseInt(element.getWidth());
            var bottom = top + parseInt(element.getHeight());  

            if(minLeft === null || left < minLeft) {
                minLeft = left;
            }

            if(minTop === null || top < minTop) {
                minTop = top;
            }

            if(maxBottom === null || bottom > maxBottom) {
                maxBottom = bottom;
            }        

            if(maxRight === null || right > maxRight) {
                maxRight = right;
            }              

        }); 

        return new Rectangle(minLeft, minTop, maxRight, maxBottom);
    };

    /**
     * @returns {Dimensions} new dimensions of canvas
     */
    this.resize = function() {

        var canvasElem = $(this.canvasElementSelector);

        var canvasWidth = parseInt(canvasElem.width());
        var canvasHeight = parseInt(canvasElem.height());
        var bbox = self.calcBoundingBox();
        if(bbox.getRight()+250 > canvasWidth) {
            canvasElem.css('width', bbox.getRight() + 500);
        }

        if(bbox.getBottom()+250 > canvasHeight) {
            canvasElem.css('height', bbox.getBottom() + 500);
        }             
        
        return new Dimensions( parseInt(canvasElem.width()), parseInt(canvasElem.height()) );
        
    };    
  
    /**
     * @returns {Object[]}
     */
    this.getAllObjects = function() {    
        return self.canvasObjects;
    };

    /**
     * @param {String} _id
     * @returns {Object|null}
     */   
    this.getObjectById = function(_id) {
        
        var foundObject = null;
        
        self.canvasObjects.forEach(function(element, index, array) {
            if(foundObject === null && element.id === _id) {
                foundObject = element;
            }            
        });
        
        return foundObject;
    };

    this.addObject = function(_graphPaperObject) {
        self.canvasObjects.push(_graphPaperObject);
        return true;
    };

    this.initInteractionHandlers = function(_dblTapSpeed, _dblTapRadius, _onDoubleClickOrDoubleTap, _onClickOrTap) {
        var canvasElem = $(this.canvasElementSelector);

        function dblClickTapHandler(posX, posY) {
            var objectsAroundPoint = self.getObjectsAroundPoint(posX, posY);
            if (objectsAroundPoint.length === 0) {
                _onDoubleClickOrDoubleTap(posX, posY);
            }
        };

        canvasElem.on('dblclick', function (e) {
            dblClickTapHandler(e.pageX, e.pageY);
        });


        canvasElem.on('click', function (e) {

            if(e.target === canvasElem[0]) {
                self.unhighlightObjects();
                _onClickOrTap({'canvasObjectClicked': false});
            } else {
                _onClickOrTap({'canvasObjectClicked': true});
            }
        });

        canvasElem.on('touchend', function(e) {

            if(e.originalEvent.changedTouches.length <= 0) {
                return false; // we have nothing to work with
            }

            var dblTapDetected = false;  // flag specifying if we detected a double-tap
            var areaElem = $(this); // element in which this touchend event has occured

            // Position of the touch
            var x = e.originalEvent.changedTouches[0].pageX;
            var y = e.originalEvent.changedTouches[0].pageY;

            var now = new Date().getTime();

            // Check if we have stored data for a previous touch (indicating we should test for a double-tap)
            if(areaElem.data('last-touch-time')) {

                var lastTouchTime = areaElem.data('last-touch-time');

                // Compute time since the previous touch
                var timeSinceLastTouch = now - lastTouchTime;

                // Get the position of the last touch on the element
                var lastX = areaElem.data('last-touch-x');
                var lastY = areaElem.data('last-touch-y');

                // Compute the distance from the last touch on the element
                var distFromLastTouch = Math.sqrt( Math.pow(x-lastX,2) + Math.pow(y-lastY,2) );

                if(timeSinceLastTouch <= _dblTapSpeed && distFromLastTouch <= _dblTapRadius) {

                    // Flag that we detected a double tap
                    dblTapDetected = true;

                    // Call handler
                    dblClickTapHandler(x, y);

                    // Remove last touch info from element
                    areaElem.data('last-touch-time', '');
                    areaElem.data('last-touch-x', '');
                    areaElem.data('last-touch-y', '');
                }

            }

            if(!dblTapDetected) {
                areaElem.data('last-touch-time', now);
                areaElem.data('last-touch-x', x);
                areaElem.data('last-touch-y', y);
            }

        });
    };

    this.initTransformationHandlers = function() {
        
        var graphPaper = this;
        var canvasElem = $(this.canvasElementSelector);

        function handleMove(_x, _y) {
            var obj = graphPaper.getObjectById(graphPaper.objectIdBeingDragged);

            if(obj.touchInternalContactPt) {
                // Move relative to point of contact
                _x -= obj.touchInternalContactPt.x;
                _y -= obj.touchInternalContactPt.y;
            }

            var mx = graphPaper.snapToGrid(_x);
            var my = graphPaper.snapToGrid(_y - obj.height*0.5);
            
            graphPaper.objectDragX = mx;
            graphPaper.objectDragY = my;		

            obj.translate(mx, my);
        
        };

        canvasElem.on('touchmove', function (e) {
            if (graphPaper.objectIdBeingDragged !== null) {
                handleMove(e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY);

                setTimeout(function() {
                    graphPaper.resize();
                }, 300);
                
                e.preventDefault();
                e.stopPropagation();
            }
        });

        canvasElem.on('mousemove', function (e) {

            if (graphPaper.objectIdBeingDragged !== null) {				

                handleMove(e.pageX, e.pageY);

                setTimeout(function() {
                    graphPaper.resize();
                }, 300);

                return false;
            }

            if(graphPaper.objectIdBeingResized !== null) {

                var mx = graphPaper.snapToGrid(e.pageX);
                var my = graphPaper.snapToGrid(e.pageY);

                var obj = graphPaper.getObjectById(graphPaper.objectIdBeingResized);

                var top = obj.y;
                var left = obj.x;
                var newWidth = ((mx - left)+1);
                var newHeight = ((my - top)+1);

                obj.resize(newWidth, newHeight);

                setTimeout(function() {
                    graphPaper.resize();
                }, 300);

                return false;

            }

        });


        function handleMoveEnd(_x, _y) {
            var obj = graphPaper.getObjectById(graphPaper.objectIdBeingDragged);
            
            var mx = graphPaper.snapToGrid(_x);
            var my = graphPaper.snapToGrid(_y - obj.height*0.5);

            var mxStart = graphPaper.objectDragStartX;
            var myStart = graphPaper.objectDragStartY;

            if(mxStart == mx && myStart == my) {
                // we didn't drag it anywhere
            } else {
                obj.translate(mx, my);
                graphPaper.onObjectTransform(obj);
            }

            graphPaper.reqEnableObjectSelection();                    
            //document.activeElement.blur();
        };     



        canvasElem.on('touchend', function (e) {
            if(graphPaper.objectIdBeingDragged !== null) {

                var obj = graphPaper.getObjectById(graphPaper.objectIdBeingDragged);

                obj.touchInternalContactPt = null;

                graphPaper.objectIdBeingDragged = null;
                graphPaper.objectIdBeingResized = null;

                graphPaper.onObjectTransform(obj);
                graphPaper.reqEnableObjectSelection();  
            }            
        });

        canvasElem.on('mouseup', function (e) {
            if (e.which === 1) {

                if(graphPaper.objectIdBeingDragged !== null) {
                    handleMoveEnd(e.pageX, e.pageY);
                }            

                if(graphPaper.objectIdBeingResized !== null) {
                    var obj = graphPaper.getObjectById(graphPaper.objectIdBeingResized);
                    graphPaper.reqEnableObjectSelection();                    
                    graphPaper.onObjectTransform(obj);
                }

                graphPaper.objectIdBeingDragged = null;
                graphPaper.objectIdBeingResized = null;
            }
        });        
        
        
        
    };

    this.bindSelectionChangeInteractionHandler = function() {

        var handleSelectionChange = function() {
            var selection = window.getSelection();

            if(selection && selection.rangeCount > 0 && selection.isCollapsed === false) {

                var range = selection.getRangeAt(0);
                var boundingRect = range.getBoundingClientRect();

                var selectionRect = new GraphPaper.Rectangle(
                        boundingRect.left+$(window).scrollLeft(),
                        boundingRect.top+$(window).scrollTop(),
                        boundingRect.right+$(window).scrollLeft(),
                        boundingRect.bottom+$(window).scrollTop());

                var selectionIsLink = false;
                var selectionLink = null;
                if(selection.anchorNode.parentNode.nodeName === 'A') {
                    selectionIsLink = true;
                    selectionLink = selection.anchorNode.parentNode.href;
                } else if(typeof selection.anchorNode.nextSibling !== 'undefined' && selection.anchorNode.nextSibling !== null && selection.anchorNode.nextSibling.nodeName === 'A') {
                    // Firefox weirdness
                    selectionIsLink = true;
                    selectionLink = selection.anchorNode.nextSibling.href;
                } else {
                    //
                }

                var selectionIsUnorderedList = false;
                var selectionIsTaskList = false;
                if(document.queryCommandState("insertUnorderedList")) {
                    if($(selection.anchorNode).closest('ul').hasClass('task-list')) {
                        selectionIsTaskList = true;
                    } else {
                        selectionIsUnorderedList = true;
                    }
                }

                var selectionStateDetails = {
                    "selection": selection,
                    "range": range,
                    "selectionRect": selectionRect,
                    "selectionIsBold": document.queryCommandState("bold"),
                    "selectionIsItalic": document.queryCommandState("italic"),
                    "selectionIsUnderline": document.queryCommandState("underline"),
                    "selectionIsStrikeThrough": document.queryCommandState("strikeThrough"),
                    "selectionIsAlignLeft": document.queryCommandState("justifyLeft"),
                    "selectionIsAlignCenter": document.queryCommandState("justifyCenter"),
                    "selectionIsAlignRight": document.queryCommandState("justifyRight"),
                    "selectionIsUnorderedList": selectionIsUnorderedList,
                    "selectionIsTaskList": selectionIsTaskList,
                    "selectionIsLink": selectionIsLink,
                    "selectionLink": selectionLink
                };

                self.canvasObjects.forEach(function(element, index, array) {
                    element.handleSiblingObjectChange('text-selection', selectionStateDetails);
                });

            } else if (selection && selection.rangeCount > 0 && selection.isCollapsed === true) {
                // collapsed and caret moved

                var range = selection.getRangeAt(0);
                var boundingRect = range.getBoundingClientRect();

                var selectionRect = new GraphPaper.Rectangle(
                        boundingRect.left+$(window).scrollLeft(),
                        boundingRect.top+$(window).scrollTop(),
                        boundingRect.right+$(window).scrollLeft(),
                        boundingRect.bottom+$(window).scrollTop());

                var selectionIsLink = false;
                var selectionLink = null;
                if(selection.anchorNode.parentNode.nodeName === 'A') {
                    selectionIsLink = true;
                    selectionLink = selection.anchorNode.parentNode.href;
                }

                var selectionIsUnorderedList = false;
                var selectionIsTaskList = false;
                if(document.queryCommandState("insertUnorderedList")) {
                    if($(selection.anchorNode).closest('ul').hasClass('task-list')) {
                        selectionIsTaskList = true;
                    } else {
                        selectionIsUnorderedList = true;
                    }
                }

                var selectionStateDetails = {
                    "selection": selection,
                    "range": range,
                    "selectionRect": selectionRect,
                    "selectionIsBold": document.queryCommandState("bold"),
                    "selectionIsItalic": document.queryCommandState("italic"),
                    "selectionIsUnderline": document.queryCommandState("underline"),
                    "selectionIsStrikeThrough": document.queryCommandState("strikeThrough"),
                    "selectionIsAlignLeft": document.queryCommandState("justifyLeft"),
                    "selectionIsAlignCenter": document.queryCommandState("justifyCenter"),
                    "selectionIsAlignRight": document.queryCommandState("justifyRight"),                    
                    "selectionIsUnorderedList": selectionIsUnorderedList,
                    "selectionIsTaskList": selectionIsTaskList,
                    "selectionIsLink": selectionIsLink,
                    "selectionLink": selectionLink
                };

                self.canvasObjects.forEach(function(element, index, array) {
                    element.handleSiblingObjectChange('text-selection-collapsed', selectionStateDetails);
                });
            }
            else {

                self.canvasObjects.forEach(function(element, index, array) {
                    element.handleSiblingObjectChange('text-selection-collapsed', {});
                });
            }
        };

        if ("onselectionchange" in document) {

            document.addEventListener("selectionchange", function(e) {
                handleSelectionChange();
            }, false);
        } else {
            // selectionchange event not supported

            setInterval(function() {
                handleSelectionChange(); // hmm, running all text selection logic again
            }, 500);

        }

    };

    this.bindSelectionChangeInteractionHandler();
};

export { Canvas };
