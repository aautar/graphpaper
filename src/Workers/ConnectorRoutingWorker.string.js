const ConnectorRoutingWorkerJsString = `(function () {
  'use strict';

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  function Point(a,b){this.__x=a,this.__y=b;}Point.prototype.getX=function(){return this.__x},Point.prototype.getY=function(){return this.__y},Point.prototype.isEqual=function(a){return !(this.__x!==a.getX()||this.__y!==a.getY())},Point.prototype.getCartesianPoint=function(a,b){return new Point(this.__x-.5*a,-this.__y+.5*b)},Point.prototype.toString=function(){return this.__x+" "+this.__y},Point.prototype.toArray=function(){return [this.__x,this.__y]},Point.fromArray=function(a){return new Point(a[0],a[1])};

  var LINE_INTERSECTION_TYPE=Object.freeze({PARALLEL:"parallel",COINCIDENT:"coincident",LINE:"line",LINESEG:"lineseg"});function LineIntersection(a,b){this.__type=a,this.__intersectionPoint=b;}LineIntersection.prototype.getType=function(){return this.__type},LineIntersection.prototype.getIntersectionPoint=function(){return this.__intersectionPoint};

  function Line(a,b){if("undefined"==typeof a||null===a)throw "Line missing _startPoint";if("undefined"==typeof b||null===b)throw "Line missing _endPoint";this.__startPoint=a,this.__endPoint=b;}Line.prototype.getStartPoint=function(){return this.__startPoint},Line.prototype.getEndPoint=function(){return this.__endPoint},Line.prototype.isEqual=function(a){return !!(this.getStartPoint().isEqual(a.getStartPoint())&&this.getEndPoint().isEqual(a.getEndPoint()))},Line.prototype.getLength=function(){return Math.sqrt(Math.pow(this.__endPoint.getX()-this.__startPoint.getX(),2)+Math.pow(this.__endPoint.getY()-this.__startPoint.getY(),2))},Line.prototype.getDirection=function(){var a=this.__endPoint.getX()-this.__startPoint.getX(),b=this.__endPoint.getY()-this.__startPoint.getY(),c=Math.sqrt(a*a+b*b);return new Point(a/c,b/c)},Line.prototype.createShortenedLine=function(a,b){var c=this.__endPoint.getX()-this.__startPoint.getX(),d=this.__endPoint.getY()-this.__startPoint.getY(),e=this.getDirection();return new Line(new Point(this.__startPoint.getX()+a*e.getX(),this.__startPoint.getY()+a*e.getY()),new Point(this.__startPoint.getX()+c-b*e.getX(),this.__startPoint.getY()+d-b*e.getY()))},Line.prototype.computeIntersectionType=function(a){var b=this.__startPoint.getX(),c=this.__startPoint.getY(),d=this.__endPoint.getX(),e=this.__endPoint.getY(),f=a.getStartPoint().getX(),g=a.getStartPoint().getY(),h=a.getEndPoint().getX(),i=a.getEndPoint().getY(),j=(i-g)*(d-b)-(h-f)*(e-c),k=(h-f)*(c-g)-(i-g)*(b-f),l=(d-b)*(c-g)-(e-c)*(b-f);if(0==j)return 0==j&&0==k&&0==l?LINE_INTERSECTION_TYPE.COINCIDENT:LINE_INTERSECTION_TYPE.PARALLEL;var m=k/j,n=l/j;return 1<m||0>m||1<n||0>n?LINE_INTERSECTION_TYPE.LINE:LINE_INTERSECTION_TYPE.LINESEG},Line.prototype.computeIntersection=function(a){var b=this.__startPoint.getX(),c=this.__startPoint.getY(),d=this.__endPoint.getX(),e=this.__endPoint.getY(),f=a.getStartPoint().getX(),g=a.getStartPoint().getY(),h=a.getEndPoint().getX(),i=a.getEndPoint().getY(),j=(i-g)*(d-b)-(h-f)*(e-c),k=(h-f)*(c-g)-(i-g)*(b-f),l=(d-b)*(c-g)-(e-c)*(b-f);if(0==j)return 0==j&&0==k&&0==l?new LineIntersection(LINE_INTERSECTION_TYPE.COINCIDENT,null):new LineIntersection(LINE_INTERSECTION_TYPE.PARALLEL,null);var m=k/j,n=l/j,o=this.__startPoint.getX()+m*(this.__endPoint.getX()-this.__startPoint.getX()),p=this.__startPoint.getY()+m*(this.__endPoint.getY()-this.__startPoint.getY());return 1<m||0>m||1<n||0>n?new LineIntersection(LINE_INTERSECTION_TYPE.LINE,new Point(o,p)):new LineIntersection(LINE_INTERSECTION_TYPE.LINESEG,new Point(o,p))};

  function PointSet(a){var b=this,c=[];this.push=function(a){for(var b=0;b<c.length;b++)if(a.isEqual(c[b]))return !1;return c.push(a),!0},this.pushPointSet=function(a){for(var c=a.toArray(),d=0;d<c.length;d++)b.push(c[d]);},this.findPointClosestTo=function(a){var b=null,d=Number.MAX_SAFE_INTEGER;return c.forEach(function(c){var e=new Line(a,c);e.getLength()<d&&(b=c,d=e.getLength());}),b},this.findDistanceToPointClosestTo=function(a){var b=Number.MAX_SAFE_INTEGER;return c.forEach(function(c){var d=new Line(a,c);d.getLength()<b&&(b=d.getLength());}),b},this.findPointsCloseTo=function(a,b){var d=new PointSet;return c.forEach(function(c){var e=new Line(a,c);e.getLength()<=b&&d.push(c);}),d},this.toArray=function(){return c},this.toFloat64Array=function(){for(var a=new Float64Array(2*c.length),b=0;b<c.length;b++)a[0+2*b]=c[b].getX(),a[1+2*b]=c[b].getY();return a};var d=function fromFloat64Array(a){c.length=0;for(var b=0;b<a.length;b+=2)c.push(new Point(a[b],a[b+1]));};this.count=function(){return c.length},a&&Array.isArray(a)?a.forEach(b.push):a&&"[object Float64Array]"===Object.prototype.toString.call(a)&&d(a);}

  function Rectangle(a,b,c,d){this.__left=a,this.__top=b,this.__right=c,this.__bottom=d;}Rectangle.prototype.getLeft=function(){return this.__left},Rectangle.prototype.getTop=function(){return this.__top},Rectangle.prototype.getRight=function(){return this.__right},Rectangle.prototype.getBottom=function(){return this.__bottom},Rectangle.prototype.getWidth=function(){return this.__right-this.__left},Rectangle.prototype.getHeight=function(){return this.__bottom-this.__top},Rectangle.prototype.getPoints=function(){return [new Point(this.__left,this.__top),new Point(this.__right,this.__top),new Point(this.__right,this.__bottom),new Point(this.__left,this.__bottom)]},Rectangle.prototype.getLines=function(){return [new Line(new Point(this.__left,this.__top),new Point(this.__right,this.__top)),new Line(new Point(this.__right,this.__top),new Point(this.__right,this.__bottom)),new Line(new Point(this.__right,this.__bottom),new Point(this.__left,this.__bottom)),new Line(new Point(this.__left,this.__bottom),new Point(this.__left,this.__top))]},Rectangle.prototype.getUniformlyResizedCopy=function(a){return new Rectangle(this.__left-a,this.__top-a,this.__right+a,this.__bottom+a)},Rectangle.prototype.getPointsScaledToGrid=function(a){var b=new Point(this.__left+.5*(this.__right-this.__left),this.__top+.5*(this.__bottom-this.__top)),c=(this.__right-b.getX()+a)/(this.__right-b.getX()),d=(this.__bottom-b.getY()+a)/(this.__bottom-b.getY()),e=[new Point((this.__left-b.getX())*c+b.getX(),(this.__top-b.getY())*d+b.getY()),new Point((this.__right-b.getX())*c+b.getX(),(this.__top-b.getY())*d+b.getY()),new Point((this.__right-b.getX())*c+b.getX(),(this.__bottom-b.getY())*d+b.getY()),new Point((this.__left-b.getX())*c+b.getX(),(this.__bottom-b.getY())*d+b.getY())];return e},Rectangle.prototype.checkIntersect=function(a){return !(this.__bottom<a.getTop())&&!(this.__top>a.getBottom())&&!(this.__right<a.getLeft())&&!(this.__left>a.getRight())},Rectangle.prototype.checkIsPointWithin=function(a){return !!(a.getX()>=this.__left&&a.getX()<=this.__right&&a.getY()>=this.__top&&a.getY()<=this.__bottom)},Rectangle.prototype.checkIsWithin=function(a){return !!(this.__bottom<=a.getBottom()&&this.__top>=a.getTop()&&this.__right<=a.getRight()&&this.__left>=a.getLeft())};

  var AccessibleRoutingPointsFinder={find:function find(a,b,c){var d=new Map,e=[],f=new PointSet;return a.forEach(function(a){var b=a.connectorAnchors;b.forEach(function(a){{var c=new PointSet(a.routingPointsFloat64Arr).toArray();c.forEach(function(b){e.push({routingPoint:b,parentAnchorId:a.id});}),d.set(a.id,c.length);}});}),e.forEach(function(a){for(var c=!1,e=0;e<b.length;e++){var g=b[e],h=new Rectangle(g.x,g.y,g.x+g.width,g.y+g.height);if(h.checkIsPointWithin(a.routingPoint)){c=!0;var j=d.get(a.parentAnchorId)||0;d.set(a.parentAnchorId,j-1);}}c||f.push(a.routingPoint);}),{connectorAnchorToNumValidRoutingPoints:d,accessibleRoutingPoints:f}}};

  function LineSet(a){var b=this,c=[];this.push=function(a){for(var b=0;b<c.length;b++)if(a.isEqual(c[b]))return !1;return c.push(a),!0},this.toArray=function(){return c},this.count=function(){return c.length},this.toFloat64Array=function(){for(var a=new Float64Array(4*c.length),b=0;b<c.length;b++)a[0+4*b]=c[b].getStartPoint().getX(),a[1+4*b]=c[b].getStartPoint().getY(),a[2+4*b]=c[b].getEndPoint().getX(),a[3+4*b]=c[b].getEndPoint().getY();return a};var d=function fromFloat64Array(a){c.length=0;for(var b=0;b<a.length;b+=4)c.push(new Line(new Point(a[b],a[b+1]),new Point(a[b+2],a[b+3])));};a&&Array.isArray(a)?a.forEach(b.push):a&&"[object Float64Array]"===Object.prototype.toString.call(a)&&d(a);}

  var PointVisibilityMapRouteOptimizer={optimize:function optimize(a,b){for(var c=0,d=a.length-1;!(1>=d-c&&(c++,d=a.length-1,c>=a.length-2));)b(a[c],a[d])?(a.splice(c+1,d-c-1),d=a.length-1):d--;}};

  var PointInfo={point:null,visiblePoints:null};function PointVisibilityMap(){var a=this,b=new Map,c=new Map,d=new Map,g=function doesLineIntersectAnyBoundaryLines(a){var b=!0,d=!1,e=void 0;try{for(var f,g=c[Symbol.iterator]();!(b=(f=g.next()).done);b=!0)for(var h,j=_slicedToArray(f.value,2),k=j[0],l=j[1],m=l.toArray(),n=0;n<m.length;n++)if(h=m[n].computeIntersectionType(a),h===LINE_INTERSECTION_TYPE.LINESEG)return !0}catch(a){d=!0,e=a;}finally{try{b||null==g.return||g.return();}finally{if(d)throw e}}return !1},h=function computePointsVisibilityForPoint(a){a.visiblePoints.points.length=0;var c=!0,d=!1,e=void 0;try{for(var f,h=b[Symbol.iterator]();!(c=(f=h.next()).done);c=!0){var i=_slicedToArray(f.value,2),j=i[0],k=i[1],l=!0,m=!1,n=void 0;try{for(var o,p=k[Symbol.iterator]();!(l=(o=p.next()).done);l=!0){var q=_slicedToArray(o.value,2),r=q[0],s=q[1],t=new Line(a.point,r);0<t.getLength()&&!g(t)&&a.visiblePoints.points.push(r);}}catch(a){m=!0,n=a;}finally{try{l||null==p.return||p.return();}finally{if(m)throw n}}}}catch(a){d=!0,e=a;}finally{try{c||null==h.return||h.return();}finally{if(d)throw e}}a.visiblePoints.isValid=!0;},i=function arePointsVisibleToEachOther(a,b){for(var c=p(a),d=j(c),e=0;e<d.length;e++)if(d[e].isEqual(b))return !0;return !1},j=function getVisiblePointsRelativeTo(a){return a.visiblePoints.isValid||h(a),a.visiblePoints.points},k=function isPointInArray(a,b){for(var c=0;c<b.length;c++)if(a.isEqual(b[c]))return !0;return !1},l=function routeToEndpoint(a,b,c,d){for(var e,f=c.point,g=j(c),h=Number.MAX_SAFE_INTEGER,l=null,m=0;m<g.length;m++)if(e=g[m],!k(e,b)){var n=new Line(f,e).getLength()+a,o=new Line(e,d).getLength();n+o<h&&(h=n+o,l=e);}return h===Number.MAX_SAFE_INTEGER?null:{cost:h,point:l}},m=function getBoundaryLinesFromEntityDescriptor(a){var b=new LineSet,c=new Rectangle(a.x,a.y,a.x+a.width,a.y+a.height),d=c.getLines();d.forEach(function(a){b.push(a);});var e=a.connectorAnchors;return e.forEach(function(a){var c=new Rectangle(a.x,a.y,a.x+a.width,a.y+a.height),d=c.getLines();d.forEach(function(a){b.push(a);});}),b},n=function hasEntityMutated(a,b){return !(a.x===b.x&&a.y===b.y&&a.width===b.width&&a.height===b.height)};this.updateRoutingPointsAndBoundaryLinesFromEntityDescriptors=function(a,e){for(var f,g=0,h=[],j=0;j<a.length;j++){f=a[j].id,h.push(f);var k=c.get(f),l=d.get(f);(!k||n(l,a[j]))&&(c.set(f,m(a[j])),d.set(f,a[j]),g++);}for(var o=function _loop(c){var d=a[c].id,f=new Rectangle(a[c].x,a[c].y,a[c].x+a[c].width,a[c].y+a[c].height),g=b.get(d);!g||n(g,a[c]);for(var h=AccessibleRoutingPointsFinder.find([a[c]],a,e),i=h.accessibleRoutingPoints.toArray(),k=new Map,l=0;l<i.length;l++)k.set(i[l],{isValid:!1,points:[]});var m=f.getPointsScaledToGrid(e);m.forEach(function(a){k.set(a,{isValid:!1,points:[]});}),b.set(d,k);},p=0;p<a.length;p++)o(p);var q=!0,r=!1,s=void 0;try{for(var t,u=d[Symbol.iterator]();!(q=(t=u.next()).done);q=!0){var v=_slicedToArray(t.value,2),w=v[0],x=v[1];h.includes(w)||(d.delete(w),c.delete(w),b.delete(w),g++);}}catch(a){r=!0,s=a;}finally{try{q||null==u.return||u.return();}finally{if(r)throw s}}return g};var o=function buildPointInfo(a,b){var c=Object.create(PointInfo);return c.point=a,c.visiblePoints=b,c};this.findVisiblePointInfoClosestTo=function(a){var c=null,d=Number.MAX_SAFE_INTEGER,e=!0,f=!1,h=void 0;try{for(var i,j=b[Symbol.iterator]();!(e=(i=j.next()).done);e=!0){var k=_slicedToArray(i.value,2),l=k[0],m=k[1],n=!0,p=!1,q=void 0;try{for(var r,s=m[Symbol.iterator]();!(n=(r=s.next()).done);n=!0){var t=_slicedToArray(r.value,2),u=t[0],v=t[1],w=new Line(a,u),x=w.getLength();x<d&&!g(w)&&(c=o(u,v),d=x);;}}catch(a){p=!0,q=a;}finally{try{n||null==s.return||s.return();}finally{if(p)throw q}}}}catch(a){f=!0,h=a;}finally{try{e||null==j.return||j.return();}finally{if(f)throw h}}return c};var p=function fetchPointInfoForPoint(a){var c=!0,d=!1,e=void 0;try{for(var f,g=b[Symbol.iterator]();!(c=(f=g.next()).done);c=!0){var h=_slicedToArray(f.value,2),i=h[0],j=h[1],k=!0,l=!1,m=void 0;try{for(var n,p=j[Symbol.iterator]();!(k=(n=p.next()).done);k=!0){var q=_slicedToArray(n.value,2),r=q[0],s=q[1];if(r===a)return o(r,s)}}catch(a){l=!0,m=a;}finally{try{k||null==p.return||p.return();}finally{if(l)throw m}}}}catch(a){d=!0,e=a;}finally{try{c||null==g.return||g.return();}finally{if(d)throw e}}return null};this.computeRoute=function(b,c,d){if(null===b||null===c)return new PointSet;var e=a.findVisiblePointInfoClosestTo(b);if(null===e)return new PointSet;for(var f,h=0,j=[e.point],k=e;!0;){if(f=l(h,j,k,c),null===f){var m=new Line(j[j.length-1],c);if(g(m))return new PointSet;break}if(h+=new Line(k.point,f.point).getLength(),j.push(f.point),k=p(f.point),1>new Line(k.point,c).getLength())break}return d&&PointVisibilityMapRouteOptimizer.optimize(j,i),new PointSet(j)};}

  var SvgPathBuilder={pointToLineTo:function pointToLineTo(a,b){return 0===b?"M"+a.getX()+" "+a.getY():"L"+a.getX()+" "+a.getY()},pointTripletToTesselatedCurvePoints:function pointTripletToTesselatedCurvePoints(a,b){if(3!==a.length)throw new Error("_points must be array of exactly 3 points");var c=a[1],d=new Line(a[0],a[1]),e=new Line(a[1],a[2]),f=d.createShortenedLine(0,.5*b),g=e.createShortenedLine(.5*b,0);return [f.getStartPoint(),f.getEndPoint(),g.getStartPoint(),g.getEndPoint()]},pointsToPath:function pointsToPath(a,b){b=b||0;var c=[],d=0;if(0<b){for(;3<=a.length;){var e=a.shift(),f=a.shift(),g=a.shift(),h=SvgPathBuilder.pointTripletToTesselatedCurvePoints([e,f,g],b);a.unshift(h[3]),a.unshift(h[2]);for(var k=0;k<h.length-2;k++)c.push(SvgPathBuilder.pointToLineTo(h[k],d++));}for(;0<a.length;){var j=a.shift();c.push(SvgPathBuilder.pointToLineTo(j,d++));}}else for(var l,m=0;m<a.length;m++)l=a[m],c.push(SvgPathBuilder.pointToLineTo(l,m));return c.join(" ")}};

  var ConnectorRoutingAlgorithm=Object.freeze({STRAIGHT_LINE:0,STRAIGHT_LINE_BETWEEN_ANCHORS:1,STRAIGHT_LINE_BETWEEN_ANCHORS_AVOID_SELF_INTERSECTION:2,ASTAR:3,ASTAR_WITH_ROUTE_OPTIMIZATION:4});

  var workerData={pointVisibilityMap:new PointVisibilityMap,requestQueue:[]},computeConnectorPath=function computeConnectorPath(a,b,c){var d=Point.fromArray(a.anchor_start_centroid_arr),e=Point.fromArray(a.anchor_end_centroid_arr),f=a.marker_start_size,g=a.marker_end_size,h=a.curvature_px,i=a.routing_algorithm,j=b.findDistanceToPointClosestTo(d),k=b.findPointsCloseTo(d,j).findPointClosestTo(e),l=b.findPointsCloseTo(e,j).findPointClosestTo(d),m=new PointSet;if(i==ConnectorRoutingAlgorithm.STRAIGHT_LINE_BETWEEN_ANCHORS)m=new PointSet([k,l]);else if(i===ConnectorRoutingAlgorithm.ASTAR||i===ConnectorRoutingAlgorithm.ASTAR_WITH_ROUTE_OPTIMIZATION){var r=!(i!==ConnectorRoutingAlgorithm.ASTAR_WITH_ROUTE_OPTIMIZATION);m=c.computeRoute(k,l,r);}else throw "Invalid routing algorithm";var n=m.toArray(),o=d,p=e;if(0<f&&1<=n.length){var s=new Line(n[0],d).createShortenedLine(0,f);o=s.getEndPoint();}if(0<g&&1<=n.length){var t=new Line(n[n.length-1],e).createShortenedLine(0,g);p=t.getEndPoint();}var q=[o].concat(_toConsumableArray(n),[p]);return {svgPath:SvgPathBuilder.pointsToPath(q,h),pointsInPath:q}},getConnectorRoutingPointsAroundAnchor=function getConnectorRoutingPointsAroundAnchor(a,b){var c=AccessibleRoutingPointsFinder.find(a,a,b);return c.accessibleRoutingPoints},processRequestQueue=function processRequestQueue(){if(0!==workerData.requestQueue.length){var a=workerData.requestQueue.pop();workerData.requestQueue.length=0;var b={overallTime:null},c=new Date,d=a.gridSize,e=a.connectorDescriptors,f=a.entityDescriptors,g=new Date,h=getConnectorRoutingPointsAroundAnchor(f,d);b.msgDecodeTime=new Date-g;var i=new Date;workerData.pointVisibilityMap.updateRoutingPointsAndBoundaryLinesFromEntityDescriptors(f,d),b.pointVisibilityMapCreationTime=new Date-i;var j=new Date;e.forEach(function(a){var b=computeConnectorPath(a,h,workerData.pointVisibilityMap),c=new PointSet(b.pointsInPath);a.svgPath=b.svgPath,a.pointsInPath=c.toFloat64Array().buffer;}),b.allPathsComputationTime=new Date-j,b.numRoutingPoints=-1,b.numBoundaryLines=-1,b.overallTime=new Date-c,postMessage({connectorDescriptors:e,metrics:b});}};setInterval(processRequestQueue,6),onmessage=function onmessage(a){workerData.requestQueue.push(a.data);};

}());
`; export { ConnectorRoutingWorkerJsString }