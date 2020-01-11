const ConnectorRoutingWorker = `(function () {
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

  function LineSet(a){var b=this,c=[];this.push=function(a){var b=!1;return (c.forEach(function(c){a.isEqual(c)&&(b=!0);}),!b)&&(c.push(a),!0)},this.toArray=function(){return c},this.count=function(){return c.length},this.toFloat64Array=function(){for(var a=new Float64Array(4*c.length),b=0;b<c.length;b++)a[0+4*b]=c[b].getStartPoint().getX(),a[1+4*b]=c[b].getStartPoint().getY(),a[2+4*b]=c[b].getEndPoint().getX(),a[3+4*b]=c[b].getEndPoint().getY();return a};var d=function fromFloat64Array(a){c.length=0;for(var b=0;b<a.length;b+=4)c.push(new Line(new Point(a[b],a[b+1]),new Point(a[b+2],a[b+3])));};a&&Array.isArray(a)?a.forEach(b.push):a&&"[object Float64Array]"===Object.prototype.toString.call(a)&&d(a);}

  function PointVisibilityMap(a,b){var c=this,d=b.toArray(),e=a.toArray(),f=Array(a.count()),g=function doesLineIntersectAnyBoundaryLines(a){for(var c,e=0;e<d.length;e++)if(c=d[e].computeIntersectionType(a),c===LINE_INTERSECTION_TYPE.LINESEG)return !0;return !1},h=function computePointsVisibility(){for(var a=0;a<e.length;a++)f[a]=[];for(var b=0;b<e.length;b++)for(var c,d=b+1;d<e.length;d++)c=new Line(e[b],e[d]),g(c)||(f[b].push(e[d]),f[d].push(e[b]));},i=function getVisiblePointsFrom(a){for(var b=0;b<e.length;b++)if(e[b].isEqual(a)){var c=f[b];return c}return []},j=function routeToEndpoint(a,b,c,d){var e=i(c),f=Number.MAX_SAFE_INTEGER,g=null;return e.forEach(function(e){for(var k=0;k<b.length;k++)if(e.isEqual(b[k]))return;var h=new Line(c,e).getLength()+a,j=new Line(e,d).getLength();h+j<f&&(f=h+j,g=e);}),f===Number.MAX_SAFE_INTEGER?null:{cost:f,point:g}},k=function optimizeRoute(a){for(var b=0;!(b+2>=a.length);){var c=new Line(a[b],a[b+2]);g(c)?b++:a.splice(b+1,1);}};this.findPointClosestTo=function(a){var b=null,c=Number.MAX_SAFE_INTEGER;return e.forEach(function(d){var e=new Line(a,d);e.getLength()<c&&(b=d,c=e.getLength());}),b},this.findVisiblePointClosestTo=function(a){var b=null,c=Number.MAX_SAFE_INTEGER;return e.forEach(function(d){var e=new Line(a,d),f=e.getLength();f<c&&!g(e)&&(b=d,c=f);}),b},this.computeRoute=function(a,b){if(null===a||null===b)return new PointSet;var d=c.findVisiblePointClosestTo(a);if(null===d)return new PointSet;for(var e,f=0,h=[d],i=d;!0;){if(e=j(f,h,i,b),null===e){var l=new Line(h[h.length-1],b);if(g(l))return new PointSet;break}if(f+=new Line(i,e.point).getLength(),h.push(e.point),i=e.point,1>new Line(i,b).getLength())break}return k(h),new PointSet(h)},h();}

  var SvgPathBuilder={pointToLineTo:function pointToLineTo(a,b){return 0===b?"M"+a.getX()+" "+a.getY():"L"+a.getX()+" "+a.getY()},pointTripletToTesselatedCurvePoints:function pointTripletToTesselatedCurvePoints(a,b){if(3!==a.length)throw new Error("_points must be array of exactly 3 points");var c=a[1],d=new Line(a[0],a[1]),e=new Line(a[1],a[2]),f=d.createShortenedLine(0,.5*b),g=e.createShortenedLine(.5*b,0);return [f.getStartPoint(),f.getEndPoint(),g.getStartPoint(),g.getEndPoint()]},pointsToPath:function pointsToPath(a,b){b=b||0;var c=[];if(0<b){for(var h=0;3<=a.length;){var d=a.shift(),e=a.shift(),f=a.shift(),g=SvgPathBuilder.pointTripletToTesselatedCurvePoints([d,e,f],b);a.unshift(g[3]),a.unshift(g[2]);for(var k=0;k<g.length-2;k++)c.push(SvgPathBuilder.pointToLineTo(g[k],h++));}for(;0<a.length;){var j=a.shift();c.push(SvgPathBuilder.pointToLineTo(j,ptIdx++));}}else for(var l,m=0;m<a.length;m++)l=a[m],c.push(SvgPathBuilder.pointToLineTo(l,m));return c.join(" ")}};

  var computeConnectorPath=function computeConnectorPath(a,b,c){var d=Point.fromArray(a.anchor_start_centroid_arr),e=Point.fromArray(a.anchor_end_centroid_arr),f=a.marker_start_size,g=a.marker_end_size,h=a.curvature_px,i=b.findDistanceToPointClosestTo(d),j=b.findPointsCloseTo(d,i).findPointClosestTo(e),k=b.findPointsCloseTo(e,i).findPointClosestTo(d),l=c.computeRoute(j,k),m=l.toArray(),n=d,o=e;if(0<f&&1<=m.length){var q=new Line(m[0],d).createShortenedLine(0,f);n=q.getEndPoint();}if(0<g&&1<=m.length){var r=new Line(m[m.length-1],e).createShortenedLine(0,g);o=r.getEndPoint();}var p=[n].concat(_toConsumableArray(m),[o]);return {svgPath:SvgPathBuilder.pointsToPath(p,h),pointsInPath:p}},convertArrayBufferToFloat64Array=function convertArrayBufferToFloat64Array(a){return new Float64Array(a)};onmessage=function onmessage(a){var b={overallTime:null},c=new Date,d=a.data.gridSize,e=a.data.connectorDescriptors,f=new Date,g=new PointSet(convertArrayBufferToFloat64Array(a.data.routingPoints)),h=new LineSet(convertArrayBufferToFloat64Array(a.data.boundaryLines)),i=new PointSet(convertArrayBufferToFloat64Array(a.data.routingPointsAroundAnchor));b.msgDecodeTime=new Date-f;var j=new Date,k=new PointVisibilityMap(g,h);b.pointVisibilityMapCreationTime=new Date-j,e.forEach(function(a){var b=computeConnectorPath(a,i,k),c=new PointSet(b.pointsInPath);a.svgPath=b.svgPath,a.pointsInPath=c.toFloat64Array().buffer;}),b.numRoutingPoints=g.count(),b.numBoundaryLines=h.count(),b.overallTime=new Date-c,postMessage({connectorDescriptors:e,metrics:b});};

}());
`; export { ConnectorRoutingWorker }