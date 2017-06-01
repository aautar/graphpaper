var GraphPaper = { };

GraphPaper.Dimensions = function(_width, _height) {
    this.width = _width;
    this.height = _height;    
};

GraphPaper.Rectangle = function(_left, _top, _right, _bottom)  {    
    this.top = _top;
    this.left = _left;
    this.bottom = _bottom;
    this.right = _right;
};

GraphPaper.Object = function(_id, _x, _y, _width, _height) {
    this.id = _id;
    this.x = _x;
    this.y = _y;
    this.width = _width;
    this.height = _height;           
    this.domElement = null;
};

GraphPaper.Canvas = function (_canvasElement, _initialGridSize, _getViewportWidth, _getViewportHeight, _onObjectTransform, _reqDisableObjectSelection, _reqEnableObjectSelection) {
    
    this.canvasElement = _canvasElement;
    this.gridSize = _initialGridSize;
    this.getViewportWidth = _getViewportWidth;
    this.getViewportHeight = _getViewportHeight;
    this.inGlobalView = false;
    this.scaleFactor = 1.0;
    this.useTranslate3d = false; // better performance w/o it
    this.canvasObjects = [];
    this.objectIdBeingDragged = null;
    this.objectIdBeingResized = null;
    
    this.objectDragX = 0.0;
    this.objectDragY = 0.0;
    this.objectDragStartX = 0.0;
    this.objectDragStartY = 0.0;
    
    this.onObjectTransform = _onObjectTransform;
    this.reqDisableObjectSelection = _reqDisableObjectSelection;
    this.reqEnableObjectSelection = _reqEnableObjectSelection;
    
    this.snapToGrid = function(_pos) {
        var ret = Math.round(_pos/this.gridSize) * this.gridSize;
        return Math.max(0, ret - 1);
    };
    

    this.calcBoundingBox = function() {

        var minTop = null;
        var minLeft = null;
        var maxBottom = null;
        var maxRight = null;

        this.canvasObjects.forEach(function(element, index, array) {

            var left = parseInt(element.x);
            var top = parseInt(element.y);  
            var right = left + parseInt(element.width);
            var bottom = top + parseInt(element.height);  

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

        return new GraphPaper.Rectangle(minLeft, minTop, maxRight, maxBottom);
    };
    
    

    this.zoomToFitAll = function() {
        var canvasElem = this.canvasElement;    
        var canvasWidth = parseInt(canvasElem.width());
        var canvasHeight = parseInt(canvasElem.height());        

        if(canvasWidth > canvasHeight) {
            this.scaleFactor = this.getViewportWidth() / canvasWidth;
        }

        if(canvasWidth < canvasHeight) {
            this.scaleFactor = this.getViewportHeight() / canvasHeight;
        }    

        if(this.scaleFactor < 1.0) {
            this.inGlobalView = true;
        }

        canvasElem.css('transform', 'scale3d(' + this.scaleFactor + ',' + this.scaleFactor + ', 1.0)');    

        // put somewhere else...
        $('.ia-note').addClass('ia-global-view-locked');   
        $('.ia-note-data').css('border-width', parseInt((1.0/this.scaleFactor)*2.0) + 'px' );
        $('.ia-note-data').attr('contenteditable', 'false');
        $('.ia-note-data').css('cursor', 'pointer');

    };
    
    

    this.resize = function() {

        var canvasElem = this.canvasElement;

        var canvasWidth = parseInt(canvasElem.width());
        var canvasHeight = parseInt(canvasElem.height());
        var bbox = this.calcBoundingBox();
        if(bbox.right+250 > canvasWidth) {
            canvasElem.css('width', bbox.right + 500);
        }

        if(bbox.bottom+250 > canvasHeight) {
            canvasElem.css('height', bbox.bottom + 500);
        }             
        
        return new GraphPaper.Dimensions( parseInt(canvasElem.width()), parseInt(canvasElem.height()) );
        
    };    
    
    this.resizeObject = function(_noteId, _width, _height) {
     
        var obj = this.getObjectById(_noteId);        
        if(obj === null) {
            return false;
        }
        
        var objectDomElement = obj.domElement;
        
        obj.width = _width;
        obj.height = _height;        

        objectDomElement.css('width', _width + 'px');
        objectDomElement.css('height', _height + 'px');    
                
        return true;        
    }

    this.translateObject = function(_noteId, _x, _y) {
        
        var obj = this.getObjectById(_noteId);        
        if(obj === null) {
            return false;
        }
        
        var objectDomElement = obj.domElement;
        
        obj.x = _x;
        obj.y = _y;
        
        if(this.useTranslate3d) {
            objectDomElement.css('transform', 'translate3d(' + _x + 'px,' + _y + 'px, 0px)');

            /*var nid = objectElem.data('nid');
            var connectors = PaperPond.vars.view.connectors;
            for(var i=0; i<connectors.length; i++) {

                var id = connectors[i].id;
                var startNoteId = connectors[i].start_note_id;
                var endNoteId = connectors[i].end_note_id;

                if(startNoteId == nid || endNoteId == nid) {

                    noteElem[0].addEventListener( 'transitionend', function(event) { 
                                                        PaperPond.canvas.setConnector(id, startNoteId, endNoteId);
                                                   }, 
                                                  false );


                    break;
                }
            }     */      


        } else {
            objectDomElement.css('top', _y + 'px');
            objectDomElement.css('left', _x + 'px');



            /*var nid = objectElem.data('nid');
            var connectors = PaperPond.vars.view.connectors;
            for(var i=0; i<connectors.length; i++) {

                var id = connectors[i].id;
                var startNoteId = connectors[i].start_note_id;
                var endNoteId = connectors[i].end_note_id;

                if(startNoteId == nid || endNoteId == nid) {


                    PaperPond.canvas.setConnector(id, startNoteId, endNoteId);



                    break;
                }
            }*/


        }
        
        return true;
        
    };
   

    this.getAllObjects = function() {    
        return this.canvasObjects;
    }
       
    this.getObjectById = function(_id) {
        
        var foundObject = null;
        
        this.canvasObjects.forEach(function(element, index, array) {           
            if(foundObject === null && element.id === _id) {
                foundObject = element;
            }            
        });
        
        return foundObject;
    };

    this.addObject = function(_graphPaperObject, _objectCreatorFunction, _isHidden, _domSubObjectSelector) {
        
		var _graphPaperObject = new GraphPaper.Object()
		
        var domElem = _objectCreatorFunction(this.canvasElement, _graphPaperObject, _isHidden);
        
        _graphPaperObject.domElement = domElem;
        $(_graphPaperObject.domElement).data('graphpaper-object-id', _graphPaperObject.id);
        
        $(_graphPaperObject.domElement).find($(_domSubObjectSelector)).each(function() {
            $(this).data('graphpaper-object-id', _graphPaperObject.id);
        });
        
        this.canvasObjects.push(_graphPaperObject);
        
        return domElem;
        
    };


    this.setupMoveResizeElements = function(_objectMoveHandleSelector, _objectResizeHandleSelector) {
        
        var graphPaper = this;
        
        $(document).on('mousedown', _objectMoveHandleSelector, function (e) {
            if (e.which === 1) {

                if(graphPaper.inGlobalView) {
                    return;
                }
                
                var objectId = $(this).data('graphpaper-object-id');

                document.activeElement.blur();

                var mx = graphPaper.snapToGrid(e.pageX);
                var my = graphPaper.snapToGrid(e.pageY);	             

                graphPaper.objectIdBeingDragged = objectId;
                graphPaper.objectDragX = mx;
                graphPaper.objectDragY = my;
                
                graphPaper.objectDragStartX = mx;
                graphPaper.objectDragStartY = my;
                
                
                graphPaper.reqDisableObjectSelection();
         
            }
        });

        $(document).on('mousedown', _objectResizeHandleSelector, function (e) {
            if (e.which === 1) {
                
                if(graphPaper.inGlobalView) {
                    return;
                }                
                
                var objectId = $(this).data('graphpaper-object-id');                
                graphPaper.objectIdBeingResized = objectId;
                graphPaper.reqDisableObjectSelection();
            }
        });		        
        
        

        $(document).on('mousemove', '.ia-canvas, .note-handle, .note-resize-handle', function (e) {

            if (graphPaper.objectIdBeingDragged !== null) {				

                var mx = graphPaper.snapToGrid(e.pageX);
                var my = graphPaper.snapToGrid(e.pageY);

                graphPaper.objectDragX = mx;
                graphPaper.objectDragY = my;		

                graphPaper.translateObject(graphPaper.objectIdBeingDragged, mx, my);

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

                graphPaper.resizeObject(graphPaper.objectIdBeingResized, newWidth, newHeight);

                //resizingNote.css('width',  + 'px');
                //resizingNote.css('height',  + 'px');	

                //PaperPond.canvas.noteElemWithFocus = resizingNote;

                setTimeout(function() {
                    graphPaper.resize();
                }, 300);

                return false;

            }

        });
        

        $(document).on('mouseup', graphPaper.canvasElement + ", " + graphPaper.objectIdBeingResized + ' *', function (e) {
            if (e.which === 1) {

                if(graphPaper.objectIdBeingDragged !== null) {

                    var mx = graphPaper.snapToGrid(e.pageX);
                    var my = graphPaper.snapToGrid(e.pageY);                

                    var mxStart = graphPaper.objectDragStartX;
                    var myStart = graphPaper.objectDragStartY;

                    if(mxStart == mx && myStart == my) {
                        // we didn't drag it anywhere
                    } else {
                        graphPaper.translateObject(graphPaper.objectIdBeingDragged, mx, my);    
                        graphPaper.onObjectTransform(graphPaper.getObjectById(graphPaper.objectIdBeingDragged));               
                    }

                    graphPaper.reqEnableObjectSelection();                    
                    //document.activeElement.blur();
                }            

                if(graphPaper.objectIdBeingResized !== null) {

                    graphPaper.reqEnableObjectSelection();                    
                    graphPaper.onObjectTransform(graphPaper.getObjectById(graphPaper.objectIdBeingResized));
                }

                graphPaper.objectIdBeingDragged = null;
                graphPaper.objectIdBeingResized = null;
            }
        });        
        
        
        
    };

};