const ConnectorRoutingWorkerJsString = `(function () {
  'use strict';

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function Point(a,b){this.__x=a,this.__y=b;}Point.prototype.getX=function(){return this.__x},Point.prototype.getY=function(){return this.__y},Point.prototype.isEqual=function(a){return !(this.__x!==a.getX()||this.__y!==a.getY())},Point.prototype.getCartesianPoint=function(a,b){return new Point(this.__x-.5*a,-this.__y+.5*b)},Point.prototype.toString=function(){return this.__x+" "+this.__y},Point.prototype.toArray=function(){return [this.__x,this.__y]},Point.fromArray=function(a){return new Point(a[0],a[1])};

  var LINE_INTERSECTION_TYPE=Object.freeze({PARALLEL:"parallel",COINCIDENT:"coincident",LINE:"line",LINESEG:"lineseg"});function LineIntersection(a,b){this.getType=function(){return a},this.getIntersectionPoint=function(){return b};}

  function Line(a,b){if("undefined"==typeof a||null===a)throw "Line missing _startPoint";if("undefined"==typeof b||null===b)throw "Line missing _endPoint";this.__startPoint=a,this.__endPoint=b;}Line.prototype.getStartPoint=function(){return this.__startPoint},Line.prototype.getEndPoint=function(){return this.__endPoint},Line.prototype.isEqual=function(a){return !!(this.getStartPoint().isEqual(a.getStartPoint())&&this.getEndPoint().isEqual(a.getEndPoint()))},Line.prototype.getLength=function(){return Math.sqrt(Math.pow(this.__endPoint.getX()-this.__startPoint.getX(),2)+Math.pow(this.__endPoint.getY()-this.__startPoint.getY(),2))},Line.prototype.getDirection=function(){var a=this.__endPoint.getX()-this.__startPoint.getX(),b=this.__endPoint.getY()-this.__startPoint.getY(),c=Math.sqrt(a*a+b*b);return new Point(a/c,b/c)},Line.prototype.createShortenedLine=function(a,b){var c=this.__endPoint.getX()-this.__startPoint.getX(),d=this.__endPoint.getY()-this.__startPoint.getY(),e=this.getDirection();return new Line(new Point(this.__startPoint.getX()+a*e.getX(),this.__startPoint.getY()+a*e.getY()),new Point(this.__startPoint.getX()+c-b*e.getX(),this.__startPoint.getY()+d-b*e.getY()))},Line.prototype.computeIntersectionType=function(a){var b=this.__startPoint.getX(),c=this.__startPoint.getY(),d=this.__endPoint.getX(),e=this.__endPoint.getY(),f=a.getStartPoint().getX(),g=a.getStartPoint().getY(),h=a.getEndPoint().getX(),i=a.getEndPoint().getY(),j=(i-g)*(d-b)-(h-f)*(e-c),k=(h-f)*(c-g)-(i-g)*(b-f),l=(d-b)*(c-g)-(e-c)*(b-f);if(0==j)return 0==j&&0==k&&0==l?LINE_INTERSECTION_TYPE.COINCIDENT:LINE_INTERSECTION_TYPE.PARALLEL;var m=k/j,n=l/j;return 1<m||0>m||1<n||0>n?LINE_INTERSECTION_TYPE.LINE:LINE_INTERSECTION_TYPE.LINESEG},Line.prototype.computeIntersection=function(a){var b=this.__startPoint.getX(),c=this.__startPoint.getY(),d=this.__endPoint.getX(),e=this.__endPoint.getY(),f=a.getStartPoint().getX(),g=a.getStartPoint().getY(),h=a.getEndPoint().getX(),i=a.getEndPoint().getY(),j=(i-g)*(d-b)-(h-f)*(e-c),k=(h-f)*(c-g)-(i-g)*(b-f),l=(d-b)*(c-g)-(e-c)*(b-f);if(0==j)return 0==j&&0==k&&0==l?new LineIntersection(LINE_INTERSECTION_TYPE.COINCIDENT,null):new LineIntersection(LINE_INTERSECTION_TYPE.PARALLEL,null);var m=k/j,n=l/j,o=this.__startPoint.getX()+m*(this.__endPoint.getX()-this.__startPoint.getX()),p=this.__startPoint.getY()+m*(this.__endPoint.getY()-this.__startPoint.getY());return 1<m||0>m||1<n||0>n?new LineIntersection(LINE_INTERSECTION_TYPE.LINE,new Point(o,p)):new LineIntersection(LINE_INTERSECTION_TYPE.LINESEG,new Point(o,p))};

  function PointSet(a){var b=this,c=[];this.push=function(a){for(var b=0;b<c.length;b++)if(a.isEqual(c[b]))return !1;return c.push(a),!0},this.pushPointSet=function(a){for(var c=a.toArray(),d=0;d<c.length;d++)b.push(c[d]);},this.findPointClosestTo=function(a){var b=null,d=Number.MAX_SAFE_INTEGER;return c.forEach(function(c){var e=new Line(a,c);e.getLength()<d&&(b=c,d=e.getLength());}),b},this.findDistanceToPointClosestTo=function(a){var b=Number.MAX_SAFE_INTEGER;return c.forEach(function(c){var d=new Line(a,c);d.getLength()<b&&(b=d.getLength());}),b},this.findPointsCloseTo=function(a,b){var d=new PointSet;return c.forEach(function(c){var e=new Line(a,c);e.getLength()<=b&&d.push(c);}),d},this.toArray=function(){return c},this.toFloat64Array=function(){for(var a=new Float64Array(2*c.length),b=0;b<c.length;b++)a[0+2*b]=c[b].getX(),a[1+2*b]=c[b].getY();return a};var d=function fromFloat64Array(a){c.length=0;for(var b=0;b<a.length;b+=2)c.push(new Point(a[b],a[b+1]));};this.count=function(){return c.length},a&&Array.isArray(a)?a.forEach(b.push):a&&"[object Float64Array]"===Object.prototype.toString.call(a)&&d(a);}

  function LineSet(a){var b=this,c=[];this.push=function(a){for(var b=0;b<c.length;b++)if(a.isEqual(c[b]))return !1;return c.push(a),!0},this.toArray=function(){return c},this.count=function(){return c.length},this.toFloat64Array=function(){for(var a=new Float64Array(4*c.length),b=0;b<c.length;b++)a[0+4*b]=c[b].getStartPoint().getX(),a[1+4*b]=c[b].getStartPoint().getY(),a[2+4*b]=c[b].getEndPoint().getX(),a[3+4*b]=c[b].getEndPoint().getY();return a};var d=function fromFloat64Array(a){c.length=0;for(var b=0;b<a.length;b+=4)c.push(new Line(new Point(a[b],a[b+1]),new Point(a[b+2],a[b+3])));};a&&Array.isArray(a)?a.forEach(b.push):a&&"[object Float64Array]"===Object.prototype.toString.call(a)&&d(a);}

  var PointVisibilityMapRouteOptimizer={optimize:function optimize(a,b){for(var c=0,d=a.length-1;!(1>=d-c&&(c++,d=a.length-1,c>=a.length-2));)b(a[c],a[d])?(a.splice(c+1,d-c-1),d=a.length-1):d--;}};

  function PointVisibilityMap(a,b,c){var d=this,e=b.toArray(),f=a.toArray(),g=null,h=function doesLineIntersectAnyBoundaryLines(a){for(var c,d=0;d<e.length;d++)if(c=e[d].computeIntersectionType(a),c===LINE_INTERSECTION_TYPE.LINESEG)return !0;return !1},i=function computePointsVisibility(){for(var a=0;a<f.length;a++)g[a]=[];for(var b=0;b<f.length;b++)for(var c,d=b+1;d<f.length;d++)c=new Line(f[b],f[d]),h(c)||(g[b].push(d),g[d].push(b));},j=function arePointsVisibleToEachOther(a,b){for(var e=0;e<f.length;e++)if(f[e].isEqual(a))for(var c=g[e],d=0;d<c.length;d++)if(f[c[d]].isEqual(b))return !0;return !1},k=function getVisiblePointsRelativeTo(a){return g[a]||[]},l=function isPointInArray(a,b){for(var c=0;c<b.length;c++)if(a.isEqual(b[c]))return !0;return !1},m=function routeToEndpoint(a,b,c,d){for(var e,g=f[c],h=k(c),j=Number.MAX_SAFE_INTEGER,m=null,n=null,o=0;o<h.length;o++)if(e=f[h[o]],!l(e,b)){var p=new Line(g,e).getLength()+a,q=new Line(e,d).getLength();p+q<j&&(j=p+q,m=e,n=h[o]);}return j===Number.MAX_SAFE_INTEGER?null:{cost:j,point:m,pointIndex:n}};this.getPointToVisibleSetData=function(){return g},this.findPointClosestTo=function(a){var b=null,c=Number.MAX_SAFE_INTEGER;return f.forEach(function(d){var e=new Line(a,d);e.getLength()<c&&(b=d,c=e.getLength());}),b},this.findVisiblePointClosestTo=function(a){var b=null,c=Number.MAX_SAFE_INTEGER;return f.forEach(function(d){var e=new Line(a,d),f=e.getLength();f<c&&!h(e)&&(b=d,c=f);}),b},this.findVisiblePointIndexClosestTo=function(a){for(var b=null,c=Number.MAX_SAFE_INTEGER,d=0;d<f.length;d++){var e=f[d],g=new Line(a,e),j=g.getLength();j<c&&!h(g)&&(b=d,c=j);}return b},this.computeRoute=function(a,b,c){if(null===a||null===b)return new PointSet;var e=d.findVisiblePointIndexClosestTo(a);if(null===e)return new PointSet;for(var g,i=0,k=f[e],l=[k],n=e;!0;){if(g=m(i,l,n,b),null===g){var o=new Line(l[l.length-1],b);if(h(o))return new PointSet;break}if(i+=new Line(f[n],g.point).getLength(),l.push(g.point),n=g.pointIndex,1>new Line(f[n],b).getLength())break}return c&&PointVisibilityMapRouteOptimizer.optimize(l,j),new PointSet(l)},c?g=c:(g=Array(a.count()),i());}

  var SvgPathBuilder={pointToLineTo:function pointToLineTo(a,b){return 0===b?"M"+a.getX()+" "+a.getY():"L"+a.getX()+" "+a.getY()},pointTripletToTesselatedCurvePoints:function pointTripletToTesselatedCurvePoints(a,b){if(3!==a.length)throw new Error("_points must be array of exactly 3 points");var c=a[1],d=new Line(a[0],a[1]),e=new Line(a[1],a[2]),f=d.createShortenedLine(0,.5*b),g=e.createShortenedLine(.5*b,0);return [f.getStartPoint(),f.getEndPoint(),g.getStartPoint(),g.getEndPoint()]},pointsToPath:function pointsToPath(a,b){b=b||0;var c=[];if(0<b){for(var h=0;3<=a.length;){var d=a.shift(),e=a.shift(),f=a.shift(),g=SvgPathBuilder.pointTripletToTesselatedCurvePoints([d,e,f],b);a.unshift(g[3]),a.unshift(g[2]);for(var k=0;k<g.length-2;k++)c.push(SvgPathBuilder.pointToLineTo(g[k],h++));}for(;0<a.length;){var j=a.shift();c.push(SvgPathBuilder.pointToLineTo(j,ptIdx++));}}else for(var l,m=0;m<a.length;m++)l=a[m],c.push(SvgPathBuilder.pointToLineTo(l,m));return c.join(" ")}};

  var ConnectorRoutingAlgorithm=Object.freeze({STRAIGHT_LINE:0,ASTAR:1,ASTAR_WITH_ROUTE_OPTIMIZATION:2});

  var computeConnectorPath=function computeConnectorPath(a,b,c){var d=Point.fromArray(a.anchor_start_centroid_arr),e=Point.fromArray(a.anchor_end_centroid_arr),f=a.marker_start_size,g=a.marker_end_size,h=a.curvature_px,i=a.routing_algorithm,j=b.findDistanceToPointClosestTo(d),k=b.findPointsCloseTo(d,j).findPointClosestTo(e),l=b.findPointsCloseTo(e,j).findPointClosestTo(d),m=new PointSet;if(i===ConnectorRoutingAlgorithm.ASTAR||i===ConnectorRoutingAlgorithm.ASTAR_WITH_ROUTE_OPTIMIZATION){var r=!(i!==ConnectorRoutingAlgorithm.ASTAR_WITH_ROUTE_OPTIMIZATION);m=c.computeRoute(k,l,r);}var n=m.toArray(),o=d,p=e;if(0<f&&1<=n.length){var s=new Line(n[0],d).createShortenedLine(0,f);o=s.getEndPoint();}if(0<g&&1<=n.length){var t=new Line(n[n.length-1],e).createShortenedLine(0,g);p=t.getEndPoint();}var q=[o].concat(_toConsumableArray(n),[p]);return {svgPath:SvgPathBuilder.pointsToPath(q,h),pointsInPath:q}},convertArrayBufferToFloat64Array=function convertArrayBufferToFloat64Array(a){return new Float64Array(a)},requestQueue=[],processRequestQueue=function processRequestQueue(){if(0!==requestQueue.length){var a=requestQueue.pop();requestQueue.length=0;var b={overallTime:null},c=new Date,d=a.gridSize,e=a.connectorDescriptors,f=new Date,g=new PointSet(convertArrayBufferToFloat64Array(a.routingPoints)),h=new LineSet(convertArrayBufferToFloat64Array(a.boundaryLines)),i=new PointSet(convertArrayBufferToFloat64Array(a.routingPointsAroundAnchor));b.msgDecodeTime=new Date-f;var j=new Date,k=new PointVisibilityMap(g,h);b.pointVisibilityMapCreationTime=new Date-j;var l=new Date;e.forEach(function(a){var b=computeConnectorPath(a,i,k),c=new PointSet(b.pointsInPath);a.svgPath=b.svgPath,a.pointsInPath=c.toFloat64Array().buffer;}),b.allPathsComputationTime=new Date-l,b.numRoutingPoints=g.count(),b.numBoundaryLines=h.count(),b.overallTime=new Date-c,postMessage({routingPoints:a.routingPoints,boundaryLines:a.boundaryLines,connectorDescriptors:e,pointVisibilityMapData:k.getPointToVisibleSetData(),metrics:b});}};setInterval(processRequestQueue,6),onmessage=function onmessage(a){requestQueue.push(a.data);};

}());
`; export { ConnectorRoutingWorkerJsString }