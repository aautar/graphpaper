const ClusterDetectionWorkerJsString = String.raw`(function () {
    'use strict';

    function Point(a,b){this.__x=a,this.__y=b;}Point.prototype.getX=function(){return this.__x},Point.prototype.getY=function(){return this.__y},Point.prototype.isEqual=function(a){return !(this.__x!==a.getX()||this.__y!==a.getY())},Point.prototype.getCartesianPoint=function(a,b){return new Point(this.__x-.5*a,-this.__y+.5*b)},Point.prototype.toString=function(){return this.__x+" "+this.__y},Point.prototype.toArray=function(){return [this.__x,this.__y]},Point.fromArray=function(a){return new Point(a[0],a[1])};

    var LINE_INTERSECTION_TYPE=Object.freeze({PARALLEL:"parallel",COINCIDENT:"coincident",LINE:"line",LINESEG:"lineseg"});function LineIntersection(a,b){this.__type=a,this.__intersectionPoint=b;}LineIntersection.prototype.getType=function(){return this.__type},LineIntersection.prototype.getIntersectionPoint=function(){return this.__intersectionPoint};

    function Line(a,b){if("undefined"==typeof a||null===a)throw "Line missing _startPoint";if("undefined"==typeof b||null===b)throw "Line missing _endPoint";this.__startPoint=a,this.__endPoint=b;}Line.prototype.getStartPoint=function(){return this.__startPoint},Line.prototype.getEndPoint=function(){return this.__endPoint},Line.prototype.isEqual=function(a){return !!(this.getStartPoint().isEqual(a.getStartPoint())&&this.getEndPoint().isEqual(a.getEndPoint()))},Line.prototype.getLength=function(){return Math.sqrt(Math.pow(this.__endPoint.getX()-this.__startPoint.getX(),2)+Math.pow(this.__endPoint.getY()-this.__startPoint.getY(),2))},Line.prototype.getMinX=function(){return Math.min(this.getStartPoint().getX(),this.getEndPoint().getX())},Line.prototype.getMaxX=function(){return Math.max(this.getStartPoint().getX(),this.getEndPoint().getX())},Line.prototype.getMinY=function(){return Math.min(this.getStartPoint().getY(),this.getEndPoint().getY())},Line.prototype.getMaxY=function(){return Math.max(this.getStartPoint().getY(),this.getEndPoint().getY())},Line.prototype.getDirection=function(){var a=this.__endPoint.getX()-this.__startPoint.getX(),b=this.__endPoint.getY()-this.__startPoint.getY(),c=Math.sqrt(a*a+b*b);return new Point(a/c,b/c)},Line.prototype.createShortenedLine=function(a,b){var c=this.__endPoint.getX()-this.__startPoint.getX(),d=this.__endPoint.getY()-this.__startPoint.getY(),e=this.getDirection();return new Line(new Point(this.__startPoint.getX()+a*e.getX(),this.__startPoint.getY()+a*e.getY()),new Point(this.__startPoint.getX()+c-b*e.getX(),this.__startPoint.getY()+d-b*e.getY()))},Line.prototype.computeIntersectionType=function(a){var b=this.__startPoint.getX(),c=this.__startPoint.getY(),d=this.__endPoint.getX(),e=this.__endPoint.getY(),f=a.getStartPoint().getX(),g=a.getStartPoint().getY(),h=a.getEndPoint().getX(),i=a.getEndPoint().getY(),j=(i-g)*(d-b)-(h-f)*(e-c),k=(h-f)*(c-g)-(i-g)*(b-f),l=(d-b)*(c-g)-(e-c)*(b-f);if(0==j)return 0==j&&0==k&&0==l?LINE_INTERSECTION_TYPE.COINCIDENT:LINE_INTERSECTION_TYPE.PARALLEL;var m=k/j,n=l/j;return 1<m||0>m||1<n||0>n?LINE_INTERSECTION_TYPE.LINE:LINE_INTERSECTION_TYPE.LINESEG},Line.prototype.computeIntersection=function(a){var b=this.__startPoint.getX(),c=this.__startPoint.getY(),d=this.__endPoint.getX(),e=this.__endPoint.getY(),f=a.getStartPoint().getX(),g=a.getStartPoint().getY(),h=a.getEndPoint().getX(),i=a.getEndPoint().getY(),j=(i-g)*(d-b)-(h-f)*(e-c),k=(h-f)*(c-g)-(i-g)*(b-f),l=(d-b)*(c-g)-(e-c)*(b-f);if(0==j)return 0==j&&0==k&&0==l?new LineIntersection(LINE_INTERSECTION_TYPE.COINCIDENT,null):new LineIntersection(LINE_INTERSECTION_TYPE.PARALLEL,null);var m=k/j,n=l/j,o=this.__startPoint.getX()+m*(this.__endPoint.getX()-this.__startPoint.getX()),p=this.__startPoint.getY()+m*(this.__endPoint.getY()-this.__startPoint.getY());return 1<m||0>m||1<n||0>n?new LineIntersection(LINE_INTERSECTION_TYPE.LINE,new Point(o,p)):new LineIntersection(LINE_INTERSECTION_TYPE.LINESEG,new Point(o,p))};

    function Rectangle(a,b,c,d){this.__left=a,this.__top=b,this.__right=c,this.__bottom=d;}Rectangle.prototype.getLeft=function(){return this.__left},Rectangle.prototype.getTop=function(){return this.__top},Rectangle.prototype.getRight=function(){return this.__right},Rectangle.prototype.getBottom=function(){return this.__bottom},Rectangle.prototype.getWidth=function(){return this.__right-this.__left},Rectangle.prototype.getHeight=function(){return this.__bottom-this.__top},Rectangle.prototype.getPoints=function(){return [new Point(this.__left,this.__top),new Point(this.__right,this.__top),new Point(this.__right,this.__bottom),new Point(this.__left,this.__bottom)]},Rectangle.prototype.getLines=function(){return [new Line(new Point(this.__left,this.__top),new Point(this.__right,this.__top)),new Line(new Point(this.__right,this.__top),new Point(this.__right,this.__bottom)),new Line(new Point(this.__right,this.__bottom),new Point(this.__left,this.__bottom)),new Line(new Point(this.__left,this.__bottom),new Point(this.__left,this.__top))]},Rectangle.prototype.getUniformlyResizedCopy=function(a){return new Rectangle(this.__left-a,this.__top-a,this.__right+a,this.__bottom+a)},Rectangle.prototype.getPointsScaledToGrid=function(a){var b=new Point(this.__left+.5*(this.__right-this.__left),this.__top+.5*(this.__bottom-this.__top)),c=(this.__right-b.getX()+a)/(this.__right-b.getX()),d=(this.__bottom-b.getY()+a)/(this.__bottom-b.getY()),e=[new Point((this.__left-b.getX())*c+b.getX(),(this.__top-b.getY())*d+b.getY()),new Point((this.__right-b.getX())*c+b.getX(),(this.__top-b.getY())*d+b.getY()),new Point((this.__right-b.getX())*c+b.getX(),(this.__bottom-b.getY())*d+b.getY()),new Point((this.__left-b.getX())*c+b.getX(),(this.__bottom-b.getY())*d+b.getY())];return e},Rectangle.prototype.checkIntersect=function(a){return !(this.__bottom<a.getTop())&&!(this.__top>a.getBottom())&&!(this.__right<a.getLeft())&&!(this.__left>a.getRight())},Rectangle.prototype.checkIsPointWithin=function(a){return !!(a.getX()>=this.__left&&a.getX()<=this.__right&&a.getY()>=this.__top&&a.getY()<=this.__bottom)},Rectangle.prototype.checkIsWithin=function(a){return !!(this.__bottom<=a.getBottom()&&this.__top>=a.getTop()&&this.__right<=a.getRight()&&this.__left>=a.getLeft())};

    function DescriptorCollection(a){var b=this,c=[];this.getId=function(){return a},this.getDescriptorIndex=function(a){return b.getDescriptorIndexById(a.id)},this.getDescriptorIndexById=function(a){for(var b=0;b<c.length;b++)if(c[b].id===a)return b;return null},this.addDescriptor=function(a){return !(null!==b.getDescriptorIndex(a))&&(c.push(a),!0)},this.getDescriptors=function(){return c},this.getIds=function(){var a=[];return c.forEach(function(b){a.push(b.id);}),a},this.removeById=function(a){var d=b.getDescriptorIndexById(a);return null!==d&&(c.splice(d,1),!0)},this.removeAll=function(){c.length=0;};}

    function Cluster(a){var b=new DescriptorCollection(a);this.getId=function(){return a},this.getEntityIndex=function(a){return b.getDescriptorIndex(a)},this.getEntityIndexById=function(a){return b.getDescriptorIndexById(a)},this.addEntity=function(a){return b.addDescriptor(a)},this.getEntities=function(){return b.getDescriptors()},this.getEntityIds=function(){return b.getIds()},this.removeEntityById=function(a){return b.removeById(a)},this.removeAllEntities=function(){return b.removeAll()},this.hasEntities=function(a){for(var c=!0,d=0;d<a.length;d++)if(null===b.getDescriptorIndexById(a[d])){c=!1;break}return c},this.toJSON=function(){return {id:a,entities:b.getDescriptors()}};}Cluster.fromJSON=function(a){var b=new Cluster(a.id);return a.entities.forEach(function(a){b.addEntity(a);}),b};

    function BoxClusterDetector(a){var b=this,c=function getEntityIndexFromArray(a,b){for(var c=0;c<b.length;c++)if(b[c].id===a.id)return c;return -1},d=function removeEntitiesFromArray(a,b){for(var d,e=0;e<a.length;e++)d=c(a[e],b),-1!==d&&b.splice(d,1);return b},e=function getClusterWithMostEntitiesFromClusterMap(a){var b=0,c=null;return a.forEach(function(a,d,e){a>b&&(b=a,c=d);}),c},f=function computeDiffBetweenArrays(a,b){var c=[],d=[];return b.forEach(function(b){-1===a.indexOf(b)&&d.push(b);}),a.forEach(function(a){-1===b.indexOf(a)&&c.push(a);}),{onlyInA:c,onlyInB:d}};this.areEntitiesClose=function(b,c){var d=new Rectangle(b.x-a,b.y-a,b.x+b.width+a,b.y+b.height+a),e=new Rectangle(c.x-a,c.y-a,c.x+c.width+a,c.y+c.height+a);return d.checkIntersect(e)},this.getAllEntitiesCloseTo=function(a,c){for(var d=[],e=0;e<c.length;e++)a.id!==c[e].id&&b.areEntitiesClose(a,c[e])&&d.push(c[e]);return d},this.getClusterEntitiesFromSeed=function(a,c,e){var f=b.getAllEntitiesCloseTo(a,c);return 0===f.length?[]:void(d(f.concat([a]),c),f.forEach(function(a){e.push(a),b.getClusterEntitiesFromSeed(a,c,e);}))},this.findIntersectingClustersForEntities=function(a,b){var c=new Map;return b.forEach(function(b){for(var d=b.getEntities(),e=0;e<d.length;e++)for(var f=0;f<a.length;f++)if(d[e].id===a[f].id)if(c.has(b)){var g=c.get(b);c.set(b,g+1);}else c.set(b,1);}),c},this.removeEntityFromClusters=function(a,b){var c=[];return b.forEach(function(b){var d=b.removeEntityById(a.id);d&&c.push(b.getId());}),c},this.mapToClustersWithOldEntitiesRemoved=function(a,b){var c=b.map(function(b){for(var c=b.getEntityIds(),d=0;d<c.length;d++)-1===a.indexOf(c[d])&&b.removeEntityById(c[d]);return b});return c},this.computeClusters=function(a,c,g){for(var h=new Set,i=new Set,j=new Set,k=new Map,l=new Map,m=a.map(function(a){return a}),n=a.map(function(a){return a.id}),o=b.mapToClustersWithOldEntitiesRemoved(n,c),p=function _loop(){var a=m.pop(),c=[a];if(b.getClusterEntitiesFromSeed(a,m,c),1<c.length){var t=b.findIntersectingClustersForEntities(c,o);if(0===t.size){var j=g(),n=new Cluster(j);c.forEach(function(a){n.addEntity(a);}),o.push(n),h.add(j);}else {var p=e(t),q=p.getEntityIds();if(p.removeAllEntities(),c.forEach(function(a){var c=b.removeEntityFromClusters(a,o);c.forEach(function(a){i.add(a);}),p.addEntity(a);}),p.getEntityIds().length===q.length&&p.hasEntities(q));else {i.add(p.getId());var r=p.getEntityIds(),s=f(q,r);l.set(p.getId(),s.onlyInA),k.set(p.getId(),s.onlyInB);}}d(c,m);}else {var u=b.removeEntityFromClusters(a,o);u.forEach(function(b){i.add(b);var c=l.get(b);c?c.push(a.id):l.set(b,[a.id]),"undefined"==typeof k.get(b)&&k.set(b,[]);});}};0<m.length;)p();var q=o.filter(function(a){return !!(2>a.getEntities().length)});q.forEach(function(a){i.delete(a.getId()),k.delete(a.getId()),l.delete(a.getId()),j.add(a.getId());}),h.forEach(function(a){i.delete(a),k.delete(a),l.delete(a);});var r=o.filter(function(a){return !!(2<=a.getEntities().length)});return {clusters:r,newClusterIds:h,updatedClusterIds:i,deletedClusterIds:j,updatedClusterToRemovedEntitites:l,updatedClusterToAddedEntitites:k}};}

    var UUID={v4:function v4(){return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(a){var b=0|16*Math.random(),c="x"==a?b:8|3&b;return c.toString(16)})}};

    var workerData={requestQueue:[],knownClusters:[]},clustersToTransferrableMap=function clustersToTransferrableMap(a){for(var b=new Map,c=0;c<a.length;c++)b.set(a[c].getId(),a[c].toJSON());return b},processRequestQueue=function processRequestQueue(){if(0!==workerData.requestQueue.length){var a={overallTime:null},b=workerData.requestQueue.pop();workerData.requestQueue.length=0;var c=b.entityDescriptors,d=new BoxClusterDetector(12);if(null!==b.knownClustersOverwrite){var g=function toClusterArray(a){var b=[];return a.forEach(function(a){b.push(Cluster.fromJSON(a));}),b};workerData.knownClusters=g(b.knownClustersOverwrite);}var e=new Date,f=d.computeClusters(c,workerData.knownClusters,UUID.v4);a.computeClustersTime=new Date-e,postMessage({metrics:a,clusters:clustersToTransferrableMap(f.clusters),newClusterIds:f.newClusterIds,updatedClusterIds:f.updatedClusterIds,deletedClusterIds:f.deletedClusterIds,updatedClusterToRemovedEntitites:f.updatedClusterToRemovedEntitites,updatedClusterToAddedEntitites:f.updatedClusterToAddedEntitites}),workerData.knownClusters=f.clusters;}};setInterval(processRequestQueue,50),onmessage=function onmessage(a){workerData.requestQueue.push(a.data);};

}());
`; export { ClusterDetectionWorkerJsString }