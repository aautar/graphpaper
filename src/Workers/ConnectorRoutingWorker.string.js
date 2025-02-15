const ConnectorRoutingWorkerJsString = String.raw`(function () {
  'use strict';

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
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
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        var F = function () {};
        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true,
      didErr = false,
      err;
    return {
      s: function () {
        it = it.call(o);
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  function Point(a,b){this.__x=a,this.__y=b;}Point.prototype.getX=function(){return this.__x},Point.prototype.getY=function(){return this.__y},Point.prototype.isEqual=function(a){return !(this.__x!==a.getX()||this.__y!==a.getY())},Point.prototype.getCartesianPoint=function(a,b){return new Point(this.__x-.5*a,-this.__y+.5*b)},Point.prototype.toString=function(){return this.__x+" "+this.__y},Point.prototype.toArray=function(){return [this.__x,this.__y]},Point.fromArray=function(a){return new Point(a[0],a[1])};

  var LINE_INTERSECTION_TYPE=Object.freeze({PARALLEL:"parallel",COINCIDENT:"coincident",LINE:"line",LINESEG:"lineseg"});function LineIntersection(a,b){this.__type=a,this.__intersectionPoint=b;}LineIntersection.prototype.getType=function(){return this.__type},LineIntersection.prototype.getIntersectionPoint=function(){return this.__intersectionPoint};

  function Line(a,b){if("undefined"==typeof a||null===a)throw "Line missing _startPoint";if("undefined"==typeof b||null===b)throw "Line missing _endPoint";this.__startPoint=a,this.__endPoint=b;}Line.prototype.getStartPoint=function(){return this.__startPoint},Line.prototype.getEndPoint=function(){return this.__endPoint},Line.prototype.isEqual=function(a){return !!(this.getStartPoint().isEqual(a.getStartPoint())&&this.getEndPoint().isEqual(a.getEndPoint()))},Line.prototype.getLength=function(){return Math.sqrt(Math.pow(this.__endPoint.getX()-this.__startPoint.getX(),2)+Math.pow(this.__endPoint.getY()-this.__startPoint.getY(),2))},Line.prototype.getMinX=function(){return Math.min(this.getStartPoint().getX(),this.getEndPoint().getX())},Line.prototype.getMaxX=function(){return Math.max(this.getStartPoint().getX(),this.getEndPoint().getX())},Line.prototype.getMinY=function(){return Math.min(this.getStartPoint().getY(),this.getEndPoint().getY())},Line.prototype.getMaxY=function(){return Math.max(this.getStartPoint().getY(),this.getEndPoint().getY())},Line.prototype.getDirection=function(){var a=this.__endPoint.getX()-this.__startPoint.getX(),b=this.__endPoint.getY()-this.__startPoint.getY(),c=Math.sqrt(a*a+b*b);return new Point(a/c,b/c)},Line.prototype.createShortenedLine=function(a,b){var c=this.__endPoint.getX()-this.__startPoint.getX(),d=this.__endPoint.getY()-this.__startPoint.getY(),e=this.getDirection();return new Line(new Point(this.__startPoint.getX()+a*e.getX(),this.__startPoint.getY()+a*e.getY()),new Point(this.__startPoint.getX()+c-b*e.getX(),this.__startPoint.getY()+d-b*e.getY()))},Line.prototype.computeIntersectionType=function(a){var b=this.__startPoint.getX(),c=this.__startPoint.getY(),d=this.__endPoint.getX(),e=this.__endPoint.getY(),f=a.getStartPoint().getX(),g=a.getStartPoint().getY(),h=a.getEndPoint().getX(),i=a.getEndPoint().getY(),j=(i-g)*(d-b)-(h-f)*(e-c),k=(h-f)*(c-g)-(i-g)*(b-f),l=(d-b)*(c-g)-(e-c)*(b-f);if(0==j)return 0==j&&0==k&&0==l?LINE_INTERSECTION_TYPE.COINCIDENT:LINE_INTERSECTION_TYPE.PARALLEL;var m=k/j,n=l/j;return 1<m||0>m||1<n||0>n?LINE_INTERSECTION_TYPE.LINE:LINE_INTERSECTION_TYPE.LINESEG},Line.prototype.computeIntersection=function(a){var b=this.__startPoint.getX(),c=this.__startPoint.getY(),d=this.__endPoint.getX(),e=this.__endPoint.getY(),f=a.getStartPoint().getX(),g=a.getStartPoint().getY(),h=a.getEndPoint().getX(),i=a.getEndPoint().getY(),j=(i-g)*(d-b)-(h-f)*(e-c),k=(h-f)*(c-g)-(i-g)*(b-f),l=(d-b)*(c-g)-(e-c)*(b-f);if(0==j)return 0==j&&0==k&&0==l?new LineIntersection(LINE_INTERSECTION_TYPE.COINCIDENT,null):new LineIntersection(LINE_INTERSECTION_TYPE.PARALLEL,null);var m=k/j,n=l/j,o=this.__startPoint.getX()+m*(this.__endPoint.getX()-this.__startPoint.getX()),p=this.__startPoint.getY()+m*(this.__endPoint.getY()-this.__startPoint.getY());return 1<m||0>m||1<n||0>n?new LineIntersection(LINE_INTERSECTION_TYPE.LINE,new Point(o,p)):new LineIntersection(LINE_INTERSECTION_TYPE.LINESEG,new Point(o,p))};

  function PointSet(a){var b=this,c=[];this.push=function(a){for(var b=0;b<c.length;b++)if(a.isEqual(c[b]))return !1;return c.push(a),!0},this.pushPointSet=function(a){for(var c=a.toArray(),d=0;d<c.length;d++)b.push(c[d]);},this.findPointClosestTo=function(a){var b=null,d=Number.MAX_SAFE_INTEGER;return c.forEach(function(c){var e=new Line(a,c);e.getLength()<d&&(b=c,d=e.getLength());}),b},this.findDistanceToPointClosestTo=function(a){var b=Number.MAX_SAFE_INTEGER;return c.forEach(function(c){var d=new Line(a,c);d.getLength()<b&&(b=d.getLength());}),b},this.findPointsCloseTo=function(a,b){var d=new PointSet;return c.forEach(function(c){var e=new Line(a,c);e.getLength()<=b&&d.push(c);}),d},this.toArray=function(){return c},this.toFloat64Array=function(){for(var a=new Float64Array(2*c.length),b=0;b<c.length;b++)a[0+2*b]=c[b].getX(),a[1+2*b]=c[b].getY();return a};var d=function fromFloat64Array(a){c.length=0;for(var b=0;b<a.length;b+=2)c.push(new Point(a[b],a[b+1]));};this.count=function(){return c.length},a&&Array.isArray(a)?a.forEach(b.push):a&&"[object Float64Array]"===Object.prototype.toString.call(a)&&d(a);}

  function Rectangle(a,b,c,d){this.__left=a,this.__top=b,this.__right=c,this.__bottom=d;}Rectangle.prototype.getLeft=function(){return this.__left},Rectangle.prototype.getTop=function(){return this.__top},Rectangle.prototype.getRight=function(){return this.__right},Rectangle.prototype.getBottom=function(){return this.__bottom},Rectangle.prototype.getWidth=function(){return this.__right-this.__left},Rectangle.prototype.getHeight=function(){return this.__bottom-this.__top},Rectangle.prototype.getPoints=function(){return [new Point(this.__left,this.__top),new Point(this.__right,this.__top),new Point(this.__right,this.__bottom),new Point(this.__left,this.__bottom)]},Rectangle.prototype.getLines=function(){return [new Line(new Point(this.__left,this.__top),new Point(this.__right,this.__top)),new Line(new Point(this.__right,this.__top),new Point(this.__right,this.__bottom)),new Line(new Point(this.__right,this.__bottom),new Point(this.__left,this.__bottom)),new Line(new Point(this.__left,this.__bottom),new Point(this.__left,this.__top))]},Rectangle.prototype.getUniformlyResizedCopy=function(a){return new Rectangle(this.__left-a,this.__top-a,this.__right+a,this.__bottom+a)},Rectangle.prototype.getPointsScaledToGrid=function(a){var b=new Point(this.__left+.5*(this.__right-this.__left),this.__top+.5*(this.__bottom-this.__top)),c=(this.__right-b.getX()+a)/(this.__right-b.getX()),d=(this.__bottom-b.getY()+a)/(this.__bottom-b.getY()),e=[new Point((this.__left-b.getX())*c+b.getX(),(this.__top-b.getY())*d+b.getY()),new Point((this.__right-b.getX())*c+b.getX(),(this.__top-b.getY())*d+b.getY()),new Point((this.__right-b.getX())*c+b.getX(),(this.__bottom-b.getY())*d+b.getY()),new Point((this.__left-b.getX())*c+b.getX(),(this.__bottom-b.getY())*d+b.getY())];return e},Rectangle.prototype.checkIntersect=function(a){return !(this.__bottom<a.getTop())&&!(this.__top>a.getBottom())&&!(this.__right<a.getLeft())&&!(this.__left>a.getRight())},Rectangle.prototype.checkIsPointWithin=function(a){return !!(a.getX()>=this.__left&&a.getX()<=this.__right&&a.getY()>=this.__top&&a.getY()<=this.__bottom)},Rectangle.prototype.checkIsWithin=function(a){return !!(this.__bottom<=a.getBottom()&&this.__top>=a.getTop()&&this.__right<=a.getRight()&&this.__left>=a.getLeft())};

  var AccessibleRoutingPointsFinder={find:function find(a,b,c){var d=new Map,e=[],f=new PointSet;return a.forEach(function(a){var b=a.connectorAnchors;b.forEach(function(a){{var c=new PointSet(a.routingPointsFloat64Arr).toArray();c.forEach(function(b){e.push({routingPoint:b,parentAnchorId:a.id});}),d.set(a.id,c.length);}});}),e.forEach(function(a){for(var c=!1,e=0;e<b.length;e++){var g=b[e],h=new Rectangle(g.x,g.y,g.x+g.width,g.y+g.height);if(h.checkIsPointWithin(a.routingPoint)){c=!0;var j=d.get(a.parentAnchorId)||0;d.set(a.parentAnchorId,Math.max(0,j-1));}}c||f.push(a.routingPoint);}),{connectorAnchorToNumValidRoutingPoints:d,accessibleRoutingPoints:f}}};

  function LineSet(a){var b=this,c=[];this.push=function(a){for(var b=0;b<c.length;b++)if(a.isEqual(c[b]))return !1;return c.push(a),!0},this.toArray=function(){return c},this.count=function(){return c.length},this.toFloat64Array=function(){for(var a=new Float64Array(4*c.length),b=0;b<c.length;b++)a[0+4*b]=c[b].getStartPoint().getX(),a[1+4*b]=c[b].getStartPoint().getY(),a[2+4*b]=c[b].getEndPoint().getX(),a[3+4*b]=c[b].getEndPoint().getY();return a};var d=function fromFloat64Array(a){c.length=0;for(var b=0;b<a.length;b+=4)c.push(new Line(new Point(a[b],a[b+1]),new Point(a[b+2],a[b+3])));};a&&Array.isArray(a)?a.forEach(b.push):a&&"[object Float64Array]"===Object.prototype.toString.call(a)&&d(a);}

  var PointVisibilityMapRouteOptimizer={optimize:function optimize(a,b){for(var c=0,d=a.length-1;!(1>=d-c&&(c++,d=a.length-1,c>=a.length-2));)b(a[c],a[d])?(a.splice(c+1,d-c-1),d=a.length-1):d--;}};

  function Vec2(a,b){this.__x=a,this.__y=b;}Vec2.prototype=Object.create(Point.prototype,{}),Vec2.prototype.normalize=function(){var a=Math.sqrt(this.__x*this.__x+this.__y*this.__y);return 0===a?this:(this.__x/=a,this.__y/=a,this)},Vec2.prototype.dot=function(a){return this.__x*a.getX()+this.__y*a.getY()};

  var ConnectorRoutingAlgorithm=Object.freeze({STRAIGHT_LINE:0,STRAIGHT_LINE_BETWEEN_ANCHORS:1,STRAIGHT_LINE_BETWEEN_ANCHORS_AVOID_SELF_INTERSECTION:2,ASTAR:3,ASTAR_WITH_ROUTE_OPTIMIZATION:4,ASTAR_THETA_WITH_ROUTE_OPTIMIZATION:5});

  var PointInfo={point:null,visiblePoints:null};function PointVisibilityMap(){var a=this,b=new Map,c=new Map,d=new Map,e=0,f=0,g=function doesLineIntersectAnyBoundaryLines(a){var b,e=_createForOfIteratorHelper(c);try{for(e.s();!(b=e.n()).done;){var f=_slicedToArray(b.value,2),g=f[0],h=f[1],j=d.get(g);if(!(a.getMinX()>j.outerBoundingRect.maxX)&&!(a.getMaxX()<j.outerBoundingRect.minX)&&!(a.getMinY()>j.outerBoundingRect.maxY)&&!(a.getMaxY()<j.outerBoundingRect.minY))for(var k,l=h.toArray(),m=0;m<l.length;m++)if(k=l[m].computeIntersectionType(a),k===LINE_INTERSECTION_TYPE.LINESEG)return !0}}catch(a){e.e(a);}finally{e.f();}return !1},h=function computePointsVisibilityForPoint(a){a.visiblePoints.points.length=0;var c,d=_createForOfIteratorHelper(b);try{for(d.s();!(c=d.n()).done;){var e,f=_slicedToArray(c.value,2),h=f[0],i=f[1],j=_createForOfIteratorHelper(i);try{for(j.s();!(e=j.n()).done;){var k=_slicedToArray(e.value,2),l=k[0],m=k[1],n=new Line(a.point,l);0<n.getLength()&&!g(n)&&a.visiblePoints.points.push(l);}}catch(a){j.e(a);}finally{j.f();}}}catch(a){d.e(a);}finally{d.f();}a.visiblePoints.isValid=!0;},i=function arePointsVisibleToEachOther(a,b){for(var c=o(a),d=j(c),e=0;e<d.length;e++)if(d[e].isEqual(b))return !0;return !1},j=function getVisiblePointsRelativeTo(a){return a.visiblePoints.isValid||h(a),a.visiblePoints.points},k=function isPointInArray(a,b){for(var c=0;c<b.length;c++)if(a.isEqual(b[c]))return !0;return !1},l=function routeToEndpoint(a,b,c,d,e,f,g){for(var h,l=c.point,m=j(c),n=Number.MAX_SAFE_INTEGER,o=null,p=new Vec2(e.getX()-l.getX(),e.getY()-l.getY()).normalize(),q=0;q<m.length;q++)if(h=m[q],!k(h,b)){var r=new Line(l,h).getLength(),s=r+a,t=new Line(h,e).getLength(),u=0;if(g===ConnectorRoutingAlgorithm.ASTAR_THETA_WITH_ROUTE_OPTIMIZATION){var v=new Vec2(h.getX()-l.getX(),h.getY()-l.getY()).normalize();u=p.dot(v)*r,e.getX()>l.getX()&&h.getX()>e.getX()&&(u=0),e.getX()<l.getX()&&h.getX()<e.getX()&&(u=0),e.getY()>l.getY()&&h.getY()>e.getY()&&(u=0),e.getY()<l.getY()&&h.getY()<e.getY()&&(u=0);}s+t-u<n&&(n=s+t-u,o=h);}return n===Number.MAX_SAFE_INTEGER?null:{cost:n,point:o}},m=function getBoundaryLinesFromEntityDescriptor(a){var b=new LineSet,c=new Rectangle(a.x,a.y,a.x+a.width,a.y+a.height),d=c.getLines();d.forEach(function(a){b.push(a);});var e=a.connectorAnchors;return e.forEach(function(a){var c=new Rectangle(a.x,a.y,a.x+a.width,a.y+a.height),d=c.getLines();d.forEach(function(a){b.push(a);});}),b},n=function hasEntityMutated(a,b){return !(a.x===b.x&&a.y===b.y&&a.width===b.width&&a.height===b.height)},o=function fetchPointInfoForPoint(a){var c,d=_createForOfIteratorHelper(b);try{for(d.s();!(c=d.n()).done;){var e,f=_slicedToArray(c.value,2),g=f[0],h=f[1],i=_createForOfIteratorHelper(h);try{for(i.s();!(e=i.n()).done;){var j=_slicedToArray(e.value,2),k=j[0],l=j[1];if(k===a)return p(k,l)}}catch(a){i.e(a);}finally{i.f();}}}catch(a){d.e(a);}finally{d.f();}return null},p=function buildPointInfo(a,b){var c=Object.create(PointInfo);return c.point=a,c.visiblePoints=b,c},q=function buildEmptyRoutingPointToVisibleSetMap(a,b,c,d){for(var e=new Rectangle(a.x,a.y,a.x+a.width,a.y+a.height),f=AccessibleRoutingPointsFinder.find([a],b,c),g=f.accessibleRoutingPoints.toArray(),h=new Map,i=0;i<g.length;i++)h.set(g[i],{isValid:!1,points:[]});var k=e.getPointsScaledToGrid(c*d);return k.forEach(function(a){h.set(a,{isValid:!1,points:[]});}),h},s=function doesRoutingAlgorithmRequireOptimization(a){return !(a!==ConnectorRoutingAlgorithm.ASTAR_WITH_ROUTE_OPTIMIZATION&&a!==ConnectorRoutingAlgorithm.ASTAR_THETA_WITH_ROUTE_OPTIMIZATION)};this.updateRoutingPointsAndBoundaryLinesFromEntityDescriptors=function(a,g,h){"undefined"==typeof h&&(h=1),e=0,f=0;for(var j,k=[],l=[],o=[],p=0;p<a.length;p++){j=a[p].id,k.push(j);var r=c.get(j),s=d.get(j);if(r&&!n(s,a[p])){f+=r.count();continue}var A=m(a[p]);c.set(j,A),f+=A.count();}for(var B=0;B<a.length;B++){var t=a[B].id,u=d.get(t);!u||n(u,a[B]);var C=q(a[B],a,g,h);b.set(t,C),d.set(t,a[B]),l.push(t),e+=C.size;}var v,w=_createForOfIteratorHelper(d);try{for(w.s();!(v=w.n()).done;){var x=_slicedToArray(v.value,2),y=x[0],z=x[1];k.includes(y)||(l.push(y),o.push(y));}}catch(a){w.e(a);}finally{w.f();}return o.forEach(function(a){d.delete(a),c.delete(a),b.delete(a);}),l.length},this.getCurrentNumRoutingPoints=function(){return e},this.getCurrentNumBoundaryLines=function(){return f},this.findVisiblePointInfoClosestTo=function(a){var c,d=null,e=Number.MAX_SAFE_INTEGER,f=_createForOfIteratorHelper(b);try{for(f.s();!(c=f.n()).done;){var h,i=_slicedToArray(c.value,2),j=i[0],k=i[1],l=_createForOfIteratorHelper(k);try{for(l.s();!(h=l.n()).done;){var m=_slicedToArray(h.value,2),n=m[0],o=m[1],q=new Line(a,n),r=q.getLength();r<e&&!g(q)&&(d=p(n,o),e=r);;}}catch(a){l.e(a);}finally{l.f();}}}catch(a){f.e(a);}finally{f.f();}return d},this.computeRoute=function(b,c,d){if(null===b||null===c)return new PointSet;var e=a.findVisiblePointInfoClosestTo(b);if(null===e)return new PointSet;for(var f,h=new Vec2(c.getX()-b.getX(),c.getY()-b.getY()).normalize(),j=[e.point],k=0,m=e;!0;){if(f=l(k,j,m,b,c,h,d),null===f){var n=new Line(j[j.length-1],c);if(g(n))return new PointSet;break}if(k+=new Line(m.point,f.point).getLength(),j.push(f.point),m=o(f.point),1>new Line(m.point,c).getLength())break}return s(d)&&PointVisibilityMapRouteOptimizer.optimize(j,i),new PointSet(j)};}

  var SvgPathBuilder={pointToLineTo:function pointToLineTo(a,b){return 0===b?"M"+a.getX()+" "+a.getY():"L"+a.getX()+" "+a.getY()},pointTripletToTesselatedCurvePoints:function pointTripletToTesselatedCurvePoints(a,b){if(3!==a.length)throw new Error("_points must be array of exactly 3 points");var c=a[1],d=new Line(a[0],a[1]),e=new Line(a[1],a[2]),f=d.createShortenedLine(0,.5*b),g=e.createShortenedLine(.5*b,0);return [f.getStartPoint(),f.getEndPoint(),g.getStartPoint(),g.getEndPoint()]},pointsToPath:function pointsToPath(a,b){b=b||0;var c=[],d=0;if(0<b){for(;3<=a.length;){var e=a.shift(),f=a.shift(),g=a.shift(),h=SvgPathBuilder.pointTripletToTesselatedCurvePoints([e,f,g],b);a.unshift(h[3]),a.unshift(h[2]);for(var k=0;k<h.length-2;k++)c.push(SvgPathBuilder.pointToLineTo(h[k],d++));}for(;0<a.length;){var j=a.shift();c.push(SvgPathBuilder.pointToLineTo(j,d++));}}else for(var l,m=0;m<a.length;m++)l=a[m],c.push(SvgPathBuilder.pointToLineTo(l,m));return c.join(" ")}};

  var workerData={pointVisibilityMap:new PointVisibilityMap,requestQueue:[]},computeConnectorPath=function computeConnectorPath(a,b,c){var d=Point.fromArray(a.anchor_start_centroid_arr),e=Point.fromArray(a.anchor_end_centroid_arr),f=a.marker_start_size,g=a.marker_end_size,h=a.curvature_px,i=a.routing_algorithm,j=b.findDistanceToPointClosestTo(d),k=b.findDistanceToPointClosestTo(e),l=b.findPointsCloseTo(d,j).findPointClosestTo(e),m=b.findPointsCloseTo(e,k).findPointClosestTo(d),n=new PointSet;if(i==ConnectorRoutingAlgorithm.STRAIGHT_LINE_BETWEEN_ANCHORS)n=new PointSet([l,m]);else if(i===ConnectorRoutingAlgorithm.ASTAR||i===ConnectorRoutingAlgorithm.ASTAR_WITH_ROUTE_OPTIMIZATION||i===ConnectorRoutingAlgorithm.ASTAR_THETA_WITH_ROUTE_OPTIMIZATION)n=c.computeRoute(l,m,i);else throw "Invalid routing algorithm";var o=n.toArray(),p=d,q=e;if(0<f&&1<=o.length){var s=new Line(o[0],d).createShortenedLine(0,f);p=s.getEndPoint();}if(0<g&&1<=o.length){var t=new Line(o[o.length-1],e).createShortenedLine(0,g);q=t.getEndPoint();}var r=[p].concat(_toConsumableArray(o),[q]);return {svgPath:SvgPathBuilder.pointsToPath(r,h),pointsInPath:r}},getConnectorRoutingPointsAroundAnchor=function getConnectorRoutingPointsAroundAnchor(a,b){var c=AccessibleRoutingPointsFinder.find(a,a,b);return c.accessibleRoutingPoints},processRequestQueue=function processRequestQueue(){if(0!==workerData.requestQueue.length){var a=workerData.requestQueue.pop();workerData.requestQueue.length=0;var b={overallTime:null},c=new Date,d=a.gridSize,e=a.connectorDescriptors,f=a.entityDescriptors,g=a.boundingExtentRoutingPointScaleFactor,h=new Date,i=getConnectorRoutingPointsAroundAnchor(f,d);b.msgDecodeTime=new Date-h;var j=new Date;workerData.pointVisibilityMap.updateRoutingPointsAndBoundaryLinesFromEntityDescriptors(f,d,g),b.pointVisibilityMapCreationTime=new Date-j;var k=new Date;e.forEach(function(a){var b=computeConnectorPath(a,i,workerData.pointVisibilityMap),c=new PointSet(b.pointsInPath);a.svgPath=b.svgPath,a.pointsInPath=c.toFloat64Array().buffer;}),b.allPathsComputationTime=new Date-k,b.numRoutingPoints=workerData.pointVisibilityMap.getCurrentNumRoutingPoints(),b.numBoundaryLines=workerData.pointVisibilityMap.getCurrentNumBoundaryLines(),b.overallTime=new Date-c,postMessage({connectorDescriptors:e,metrics:b});}};setInterval(processRequestQueue,6),onmessage=function onmessage(a){workerData.requestQueue.push(a.data);};

}());
`; export { ConnectorRoutingWorkerJsString }