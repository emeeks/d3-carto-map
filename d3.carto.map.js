!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),(f.d3||(f.d3={})).carto=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports={
  "name": "d3-carto-map",
  "version": "0.4.0",
  "description": "easy layer-based maps for d3",
  "main": "d3.carto.map.js",
  "directories": {
    "example": "examples"
  },
  "scripts": {
    "test": "make test"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/emeeks/d3-carto-map"
  },
  "keywords": [
    "d3",
    "map",
    "cartography",
    "topojson",
    "geojson",
    "csv",
    "svg",
    "canvas"
  ],
  "dependencies": {
    "d3": "^3.4.10"
  },
  "browserify": {
    "transform": [
      "browserify-shim"
    ]
  },
  "browserify-shim": {
    "d3": "global:d3"
  },
  "author": "Elijah Meeks",
  "license": "Unlicense",
  "bugs": {
    "url": "https://github.com/emeeks/d3-carto-map/issues"
  },
  "homepage": "https://github.com/emeeks/d3-carto-map",
  "devDependencies": {
    "browserify": "^4.2.0",
    "browserify-shim": "^3.6.0",
    "casper-chai": "^0.2.1",
    "casperjs": "^1.1.0-beta3",
    "chai": "^1.9.1",
    "glob": "^4.0.4",
    "jshint": "^2.5.2",
    "mocha": "^1.20.1",
    "mocha-casperjs": "^0.5.0",
    "uglify-js": "^2.4.15",
    "watchify": "^0.10.2"
  }
}

},{}],2:[function(_dereq_,module,exports){
"use strict";

module.exports = {
  map: _dereq_("./map"),
  layer: _dereq_("./layer"),
  minimap: _dereq_("./minimap"),
  modal: _dereq_("./modal"),
  version: _dereq_("../package.json").version
};

},{"../package.json":1,"./layer":3,"./map":4,"./minimap":5,"./modal":6}],3:[function(_dereq_,module,exports){
(function (global){
"use strict";

var d3 = (typeof window !== "undefined" ? window.d3 : typeof global !== "undefined" ? global.d3 : null);

var Layer = module.exports = function() {
    var layerPath = "";
    var layerType = "";
    var layerVisibility = true;
    var layerActive = true;
    var layerRenderMode = "canvas";
    var layerClass = "default";
    var layerLabel = "unlabeled";
    var layerXCoord = function(d) {return d["x"]};
    var layerYCoord = function(d) {return d["y"]};
    var layerG;
    var layerObject;
    var layerFeatures;
    var layerTileType = "mapbox";
    var layerSpecific = "all";
    var layerMarkerSize = function() {return 5};
    var layerMarkerColor;
    var layerStrokeColor;
    var layerStrokeWidth;
    var layerCluster = false;
    var clickableFeatures = false;
    var d3Modal;
    var layerDataset;
    
    var layerDispatch = d3.dispatch('load','recluster','newmodal');
    
    var layer = function() {
	
    }
    
    layer.path = function(newPath) {
	if (!arguments.length) return layerPath;
	layerPath = newPath;
	return this;
    }

    layer.type = function(newType) {
	if (!arguments.length) return layerType;
	layerType = newType;
	return this;
	
    }

    layer.visibility = function(newVisibility) {
    	if (!arguments.length) return layerVisibility;
	layerVisibility = newVisibility;
	return this;
    }

    layer.renderMode = function(newMode) {
    	if (!arguments.length) return layerRenderMode;
	layerRenderMode = newMode;
	return this;
    }
    
    layer.clickableFeatures = function(newState) {
    	if (!arguments.length) return clickableFeatures;
	clickableFeatures = newState;
	return this;
    }
    layer.modal = function(newModal) {
	if (!arguments.length) return d3Modal;
	d3Modal = newModal;
	layerDispatch.newmodal();
	return this;
    }

    layer.x = function(newX) {
    	if (!arguments.length) return layerXCoord;
	if (typeof newX == "function") {
	    layerXCoord = newX;
	}
//A number
	else if (typeof newX == "number") {
	    layerXCoord = function(d) {return newX}	    
	}
//Otherwise assume a top-level attribute name
	else {
	    layerXCoord = function(d) {return d[newX]}
	}
	return this;
    }
    
    layer.y = function(newY) {
    	if (!arguments.length) return layerYCoord;
	if (typeof newY == "function") {
	    layerYCoord = newY;
	}
//A number
	else if (typeof newY == "number") {
	    layerYCoord = function(d) {return newY}	    
	}
//Otherwise assume a top-level attribute name
	else {
	    layerYCoord = function(d) {return d[newY]}
	}
	return this;
    }
    
    layer.markerSize = function(newSize) {
    	if (!arguments.length) return layerMarkerSize;
	if (typeof newSize == "function") {
	    layerMarkerSize = newSize;
	}
//A number
	else if (typeof newSize == "number") {
	    layerMarkerSize = function(d) {return newSize}    
	}
//Otherwise assume a top-level attribute name
	else {
	    layerMarkerSize = function(d) {return d[newSize]}
	}
	return this;
    }

    layer.markerColor = function(newColor) {
    	if (!arguments.length) return layerMarkerColor;
	if (typeof newColor == "function") {
	    layerMarkerColor = newColor;
	}
//Else set color
	else {
	    layerMarkerColor = function(d) {return newColor}
	}
	return this;
    }

    layer.strokeColor = function(newColor) {
    	if (!arguments.length) return layerStrokeColor;
	if (typeof newColor == "function") {
	    layerStrokeColor = newColor;
	}
//Else set color
	else {
	    layerStrokeColor = function(d) {return newColor}
	}
	return this;
    }
    
    layer.strokeWidth = function(newWidth) {
    	if (!arguments.length) return layerStrokeWidth;
	if (typeof newColor == "function") {
	    layerStrokeWidth = newWidth;
	}
//Else set color
	else {
	    layerStrokeWidth = function(d) {return newWidth}
	}
	return this;
    }
    
    layer.cssClass = function(newClass) {
    	if (!arguments.length) return layerClass;
	layerClass = newClass;
	return this;
    }
    
    layer.g = function(newG) {
    	if (!arguments.length) return layerG;
	layerG = newG;
	return this;
    }

    layer.object = function(newObject) {
    	if (!arguments.length) return layerObject;
	layerObject = newObject;
	layerDispatch.load();
	return this;
    }

    layer.features = function(newFeatures) {
    	if (!arguments.length) return layerFeatures;
	layerFeatures = newFeatures;
	return this;
    }
    layer.tileType = function(newType) {
    	if (!arguments.length) return layerTileType;
	layerTileType = newType;
	return this;
    }
    layer.label = function(newLabel) {
    	if (!arguments.length) return layerLabel;
	layerLabel = newLabel;
	return this;
    }
    layer.specificFeature = function(newSpecific) {
    	if (!arguments.length) return layerSpecific;
	layerSpecific = newSpecific;
	return this;
    }
    
    layer.dataset = function(newDataset) {
    	if (!arguments.length) return layerDataset;
	layerDataset = newDataset;
	return this;
    }
    
    layer.cluster = function(newClusterSetting) {
    	if (!arguments.length) return layerCluster;
	layerCluster = newClusterSetting;
	return this;
    }

    layer.recluster = function() {
	layerDispatch.recluster();
    }
    
    layer.clusterLayer = function() {
	return layerObject.qtreeLayer;
    }
    
    d3.rebind(layer, layerDispatch, "on");
    return layer;
}

Layer.topojson = function() {
    return Layer().type("topojson");
}

Layer.geojson = function() {
    return Layer().type("geojson");
}

Layer.csv = function() {
    return Layer().type("csv");
}

Layer.xyArray = function() {
    return Layer().type("xyarray");
}

Layer.featureArray = function() {
    return Layer().type("featurearray");
}

Layer.tile = function() {
    return Layer().type("tile");
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(_dereq_,module,exports){
(function (global){
"use strict";

var d3 = (typeof window !== "undefined" ? window.d3 : typeof global !== "undefined" ? global.d3 : null),
    Layer = _dereq_("./layer"),
    Modal = _dereq_("./modal");

var Map = module.exports = function() {
    var mapSVG;
    var reprojectDiv;
    var tileSVG;
    var mapDiv;
    var canvasCanvas;
    var layerBox;
    var zoomBox;
    var panBox;
    var mapProjection;
    var mapZoom;
    var mapCenter = [12,42];
    var mapHeight = 10;
    var mapWidth = 10;
    var rasterReprojecting = false;
    var workingDistance = 100;
    var mouseOrigin;
    var rotateOrigin;
    var touchInitialD;
    var touchInitialRotate;
    var touchInitialLength;
    var touchInitialScale;
    var quadClusterScale = .1;
    var newPointsLayer;
    var newFeaturesLayer;

    var d3MapZoomed;
    var d3MapZoomInitialize;
    var d3MapZoomComplete;
    var renderCanvas;
    var renderTiles;
    
    var d3MapMode = "transform";

    var d3MapCanvasG;
    var d3MapCanvasImage;
    
    var d3MapAllLayers = [];
    
    var d3MapTileG = [];
    var d3MapTileLayer = [];
    
    var d3MapCanvasPointsData = [];

    var d3MapSVGPointsG = [];
    var d3MapSVGPointsLayer = [];

    var d3MapRasterPointsLayer = [];
    
    var d3MapRasterFeatureLayer = [];

    var d3MapSVGFeatureG = [];
    var d3MapSVGFeatureLayer = [];

    var d3MapTile = function(){};
    d3MapTile.size = function(){};
    if (d3.geo.tile) {
        var d3MapTile = d3.geo.tile()
        .size([10, 10]);
    }

    var d3MapProjection;

    var d3MapPath = d3.geo.path();
    
    var d3MapZoom = d3.behavior.zoom();
    
    var tandemMapArray = [];
    
    var tileTypes = {
	stamen: {flatPath: "tile.stamen.com", flatType: "jpg", reprojectPathPrefix: "http://{subdomain}.tile.stamen.com/", reprojectPathSuffix: "/{z}/{x}/{y}.jpg"},
	mapbox: {flatPath: "tiles.mapbox.com/v3", flatType: "png", reprojectPathPrefix: "http://{subdomain}.tiles.mapbox.com/v3/", reprojectPathSuffix: "/{z}/{x}/{y}.png"},
    cartodb: {flatPath: "basemaps.cartocdn.com", flatType: "png", reprojectPathPrefix: "http://{subdomain}.basemaps.cartocdn.com/", reprojectPathSuffix: "/{z}/{x}/{y}.png"}
    }

    function map(selectedDiv) {

    mapDiv = selectedDiv;
    
    reprojectDiv = selectedDiv.append("div").attr("id", "reprojectDiv").style("overflow", "hidden").style("height", "100%").style("width", "100%").style("position", "absolute");
    //Multiple SVGs because we draw the tiles underneath and sandwich a canvas layer between the tiles and the interactive SVG layer
    tileSVG = selectedDiv.append("svg").style("height", "100%").style("width", "100%").style("position", "absolute").style("z-index", -1).append("g").attr("class","rotateG").attr("id", "d3TileSVG");
    canvasCanvas = selectedDiv.append("canvas").attr("id", "d3MapCanvas").style("height", "100%").style("width", "100%").style("pointer-events", "none")
    .attr("height", 5).attr("width", 5).style("position", "absolute").style("z-index", 0);
    mapSVG = selectedDiv.append("svg").attr("id", "d3MapSVG").style("height", "100%").style("width", "100%")
    .style("position", "absolute").style("z-index", 1)
    .call(d3MapZoom)
    .on("touchstart", touchBegin).on("touchmove", touchUpdate)
    .append("g").attr("class", "rotateG");

    d3MapCanvasImage = mapSVG.append("g").attr("id","d3MapCanvasG").append("image");
    
    layerBox = selectedDiv.insert("div", "svg").attr("id", "d3MapLayerBox");
    layerBox.append("div").attr("id", "layerBoxContent");

    zoomBox = selectedDiv.insert("div", "svg").attr("id", "d3MapZoomBox").attr("class", "d3MapControlsBox");
    panBox = selectedDiv.insert("div", "svg").attr("id", "d3MapPanBox").attr("class", "d3MapControlsBox");

    zoomBox.selectAll("button.zoomcontrol").data(["in", "out"]).enter().append("button").attr("class", "zoomcontrol").attr("id", function(d) {return d})
    .on("click", manualZoom).html(function(d) {return d=="in" ? "+" : "-"});
    
    var panSymbols = {"up": "&#8593;","down": "&#8595;","left": "&#8592;","right": "&#8594;"}
    panBox.selectAll("button.pancontrol").data(["up","down","left", "right"]).enter().append("button").attr("class", "pancontrol")
    .attr("id", function(d) {return d})
    .on("click", function(d) {return manualPan(d,.5)}).html(function(d) {return panSymbols[d]});
    
    map.mode("transform");
    
    updateLayers();

        //TO DO: Change this so that it appends the functionality and doesn't overwrite it
        //Or find a viable solution that recognizes <div> resizing
        var existingOnResize = d3.functor(window.onresize);
        window.onresize = function(event) {
            map.refresh();
            existingOnResize();
        }
        map.refresh();
	map.centerOn(mapCenter,"latlong",0)
	
	return this;
    }
    
    //Internal Functions

    function updateLayers() {
        layerBox.select("#layerBoxContent").selectAll("*").remove();

        var newLines = layerBox.select("#layerBoxContent").append("ul");
        
        newLines.selectAll("li.nothing").data(d3MapTileLayer).enter().append("li")
        .on("click", showHideLayer).attr("id", function(d) {return d.object().id});

        newLines.selectAll("li.nothing").data(d3MapSVGPointsLayer).enter().append("li")
        .on("click", showHideLayer).attr("id", function(d) {return d.object().id});

        newLines.selectAll("li.nothing").data(d3MapRasterPointsLayer.filter(function(d) {return !d.object().mixed})).enter().append("li")
        .on("click", showHideLayer).attr("id", function(d) {return d.object().id});

	newLines.selectAll("li.nothing").data(d3MapSVGFeatureLayer).enter().append("li")
        .on("click", showHideLayer).attr("id", function(d) {return d.object().id});

        newLines.selectAll("li.nothing").data(d3MapRasterFeatureLayer).enter().append("li")
        .on("click", showHideLayer).attr("id", function(d) {return d.object().id});
        
        newLines.selectAll("li").append("input").attr("type", "checkbox").property("checked", function(d) {return d.visibility()});
        newLines.selectAll("li").append("span").html(function(d) {return d.object().name})
	
	newLines.selectAll("li").filter(function(d) {return d.cluster()}).remove();
    }
    
    function showHideLayer(d,i,sentNode) {
    var n = sentNode || this;

    var imgUrl = canvasCanvas.node().toDataURL("image/png");
    d3MapCanvasImage.attr("xlink:href", imgUrl).style("opacity", 1);

        //TO DO: Put transitions back in by adding a transition Canvas Image
        if (!d.visibility()) {
            d.visibility(true);
	    if (d.object().mixed) {
		d3MapRasterPointsLayer.forEach(function(p) {
		    if (p.object().id == d.object().mixedupDup) {
			p.visibility(true);
		    }
		})
	    }
	    renderTiles();
            mapDiv.select("g#" + d.object().id).style("opacity", 0).transition().duration(1000).style("opacity", 1);
            d3.select(n).select("input").property("checked", true);
        }
        else {
            mapDiv.select("g#" + d.object().id).transition().duration(1000).style("opacity", 0);
            d3.select(n).select("input").property("checked", false);
            d.visibility(false);
	    if (d.mixed) {
		d3MapRasterPointsLayer.forEach(function(p) {
		    if (p.object().id == d.object().mixedupDup) {
	                p.visibility(false);
		    }
		})
	    }
        }
	if (d.type() == "tile") {
	    d3MapZoomInitialize();
	}
	d3MapZoomComplete();
	d3MapCanvasImage.transition().duration(1000).style("opacity", 0);
    }

    function rebuildAttributes() {
	    for (var x in d3MapSVGPointsLayer) {
            d3MapSVGPointsLayer[x].g().selectAll("circle,rect,path,polygon,ellipse")
	    .each(function(d) {
		if (!d._d3Map) {
		    var sw = parseFloat(d3.select(this).style("stroke-width")) || 0;
		    var r = parseFloat(d3.select(this).attr("r")) || 0;
		    var height = parseFloat(d3.select(this).attr("height")) || 0;
		    var width = parseFloat(d3.select(this).attr("width")) || 0;
		    var x = parseFloat(d3.select(this).attr("x")) || parseFloat(d3.select(this).attr("cx")) || 0;
		    var y = parseFloat(d3.select(this).attr("y")) || parseFloat(d3.select(this).attr("cy")) || 0;
		    var fontSize = parseFloat(d3.select(this).style("font-size")) || 0;
		    var fontWeight = parseFloat(d3.select(this).style("font-weight")) || 100;
		    d._d3Map = {};
		    d._d3Map.strokeWidth = sw;
		    d._d3Map.height = height;
		    d._d3Map.width = width;
		    d._d3Map.dx = x;
		    d._d3Map.dy = y;
		    d._d3Map.fontSize = fontSize;
		    d._d3Map.fontWeight = fontWeight;
		}
	    })
            }
    }
    
    function degreeDistance() {
	var a = d3MapProjection([1,1]);
	var b = d3MapProjection([2,2]);
	var s = d3MapZoom.scale();
	var aa = [a[0] * s, a[1] * s];
	var ba = [b[0] * s, b[1] * s];
	var dist = Math.sqrt(Math.abs(aa[0] - ba[0]) + Math.abs(aa[1] - ba[1]));
	
	return dist;
    }
    
    
    // MAP ZOOMING
    
    //Projection Zoom
    function d3MapZoomedProjection() {
	mapDiv.selectAll("div.d3MapModal").remove();
	if (d3MapProjection.clipExtent) {
	d3MapProjection.clipExtent([[0,0],[mapWidth,mapHeight]]);
	}
	d3MapProjection.scale(d3MapZoom.scale()).translate(d3MapZoom.translate());
	      ///POINTS
      for (var x in d3MapSVGPointsLayer) {
        if (d3MapSVGPointsLayer[x].object().renderFrequency == "drawAlways" && d3MapSVGPointsLayer[x].visibility() && d3MapSVGPointsLayer[x].renderMode() == "svg") {
            renderSVGPointsProjected(x);
        }
    }
    
        // FEATURES
        for (var x in d3MapSVGFeatureLayer) {
            if (d3MapSVGFeatureLayer[x].object().renderFrequency == "drawAlways"  && d3MapSVGFeatureLayer[x].visibility() && d3MapSVGFeatureLayer[x].renderMode() == "svg") {
            renderSVGFeaturesProjected(x);
            }
        }
	
	renderCanvas("zoom");
    }

    function d3MapZoomInitializeProjection() {
	mouseOrigin = d3MapZoom.translate();
	if (d3MapProjection.rotate) {
        	rotateOrigin = d3MapProjection.rotate();
	}
	for (var x in d3MapSVGPointsLayer) {
	    if ((d3MapSVGPointsLayer[x].object().renderFrequency == "drawEnd" || !d3MapSVGPointsLayer[x].visibility())) {
	        d3MapSVGPointsLayer[x].g().style("display", "none");
	    }
        }
        
        for (var x in d3MapSVGFeatureLayer) {
            if ((d3MapSVGFeatureLayer[x].renderFrequency == "drawEnd" || !d3MapSVGFeatureLayer[x].visibility())) {
            d3MapSVGFeatureLayer[x].g().style("display", "none");
            }
        }
    
    mapDiv.select("#reprojectDiv").selectAll("div").remove();
	renderCanvas("zoomstart");
    
    }

    function d3MapZoomCompleteProjection() {
        
        for (var x in d3MapSVGPointsLayer) {
            if ((d3MapSVGPointsLayer[x].object().renderFrequency == "drawEnd" || d3MapSVGPointsLayer[x].object().renderFrequency == "drawAlways")  && d3MapSVGPointsLayer[x].visibility() ) {
            d3MapSVGPointsLayer[x].g().style("display", "block");
            renderSVGPointsProjected(x);
            }
        }

        for (var x in d3MapSVGFeatureG) {
            if ((d3MapSVGFeatureLayer[x].renderFrequency == "drawEnd" || d3MapSVGFeatureLayer[x].renderFrequency == "drawAlways")  && d3MapSVGFeatureLayer[x].visibility() ) {
            d3MapSVGFeatureG[x].g().style("display", "block");
            renderSVGFeaturesProjected(x);
            }
        }
	
	renderTiles();
	renderCanvas("zoomend");
     }


    function renderCanvasProjected(zoomMode) {
	var context = canvasCanvas.node().getContext("2d");
        context.clearRect(0,0,mapWidth,mapHeight);
    
        for (var x in d3MapRasterFeatureLayer) {
          if ((d3MapRasterFeatureLayer[x].object().renderFrequency == "drawAlways" || (d3MapRasterFeatureLayer[x].object().renderFrequency == "drawDuring" && zoomMode == "zoom")) && d3MapRasterFeatureLayer[x].visibility() ) {
            renderCanvasFeaturesProjected(x, context);
          }	
        }

        for (var x in d3MapRasterPointsLayer) {
          if ((d3MapRasterPointsLayer[x].object().renderFrequency == "drawAlways" || (d3MapRasterPointsLayer[x].object().renderFrequency == "drawDuring" && zoomMode == "zoom")) && d3MapRasterPointsLayer[x].visibility() ) {
            renderCanvasPointsProjected(x, context);
          }
        }
    }

        function renderCanvasFeaturesProjected(i,context) {

	var _data = d3MapRasterFeatureLayer[i].features()

	var canvasPath = d3MapPath;
    
	for (var x in _data) {
	    context.strokeStyle = d3MapRasterFeatureLayer[i].strokeColor()(_data[x]);
	    context.fillStyle = d3MapRasterFeatureLayer[i].markerColor()(_data[x]);
	    context.lineWidth = parseFloat(d3MapRasterFeatureLayer[i].strokeWidth()(_data[x]));
	    context.beginPath(), canvasPath.context(context)(_data[x]);
	    if (_data[x]._d3Map.stroke != "none") {
		context.stroke()
	    }
	    if (_data[x]._d3Map.color != "none") {
		context.fill();
	    }
	}
    }
    
        function renderCanvasPointsProjected(i,context) {
	var _data = d3MapRasterPointsLayer[i].features()
	var _layerX = d3MapRasterPointsLayer[i].x();
	var _layerY = d3MapRasterPointsLayer[i].y();
	var r = [0,0];
	var z = 180;
	if (d3MapProjection.rotate) {
	    r = d3MapProjection.rotate();
	    z = d3MapProjection.clipAngle() || 180;
	}
	var a = [-r[0], -r[1]];
	var cDist = Math.PI * (z / 180);
	
        for (var y in _data) {

        var projectedPoint = d3MapProjection([_layerX(_data[y]),_layerY(_data[y])]);
	if (projectedPoint) {
        var projX = projectedPoint[0];
        var projY = projectedPoint[1];

	if (d3.geo.distance([_layerX(_data[y]),_layerY(_data[y])],a) < cDist) {
	
        context.beginPath();
        context.arc(projX,projY,d3MapRasterPointsLayer[i].markerSize()(_data[y]),0,2*Math.PI);
        context.fillStyle = d3MapRasterPointsLayer[i].markerColor()(_data[y]);
        context.strokeStyle = d3MapRasterPointsLayer[i].strokeColor()(_data[y]);
	context.lineWidth = parseFloat(d3MapRasterPointsLayer[i].strokeWidth()(_data[y]));
        context.stroke();
        context.fill();
	}
	}
      }
    }
     
         // "globe" zoom

    function d3MapZoomedRotate() {
	mapDiv.selectAll("div.d3MapModal").remove();
    	var updateClustering = false;
    
	if (Math.abs(degreeDistance() - workingDistance) > .1) {
	    workingDistance = degreeDistance();
	    updateClustering = true;
	}
	
	
    var xRotate = d3.scale.linear()
    .domain([1, -1])
    .range([-180, 180]);

    var yRotate = d3.scale.linear()
    .domain([1, -1])
    .range([90, -90]);
    
	  var d = d3MapZoom.translate();
	  var s = d3MapZoom.scale();
	  var p = [(mouseOrigin[0] - d[0]) / s, (mouseOrigin[1] - d[1]) / s];
	  var r = rotateOrigin;
	  
	d3MapProjection.rotate([xRotate(p[0]) + r[0], yRotate(p[1]) + r[1], d3MapProjection.rotate()[2]]);

	d3MapProjection.clipExtent([[0,0],[mapWidth,mapHeight]]);
	d3MapProjection.scale(d3MapZoom.scale());
	      ///POINTS
      for (var x in d3MapSVGPointsLayer) {
	if (d3MapSVGPointsLayer[x].cluster() && updateClustering) {
	    quadtreeModePoints(d3MapSVGPointsLayer[x], degreeDistance());
	}
        else if (d3MapSVGPointsLayer[x].object().renderFrequency == "drawAlways" && d3MapSVGPointsLayer[x].visibility() && d3MapSVGPointsLayer[x].renderMode() == "svg") {
            renderSVGPointsProjected(x);
        }

    }
    
        // FEATURES
        for (var x in d3MapSVGFeatureLayer) {
            if (d3MapSVGFeatureLayer[x].cluster() && updateClustering) {
	    quadtreeModePoints(d3MapSVGFeatureLayer[x], degreeDistance());
	}
        else if (d3MapSVGFeatureLayer[x].object().renderFrequency == "drawAlways"  && d3MapSVGFeatureLayer[x].visibility() && d3MapSVGFeatureLayer[x].renderMode() == "svg") {
            renderSVGFeaturesProjected(x);
            }
        }
	
	renderCanvas("zoom");
    }

     
    //Transform Zoom
    function d3MapZoomedTransform() {
	mapDiv.selectAll("div.d3MapModal").remove();
	renderTiles();

	var updateClustering = false;
    
	if (Math.abs(degreeDistance() - workingDistance) > .05) {
	    workingDistance = degreeDistance();
	    updateClustering = true;
	}
	    
      ///POINTS
      for (var x in d3MapSVGPointsLayer) {
    	if (d3MapSVGPointsLayer[x].cluster() && updateClustering) {
	    quadtreeModePoints(d3MapSVGPointsLayer[x], degreeDistance());
	}
        else if (d3MapSVGPointsLayer[x].object().renderFrequency == "drawAlways" && d3MapSVGPointsLayer[x].visibility() && !d3MapSVGPointsLayer[x].cluster() && d3MapSVGPointsLayer[x].renderMode() == "svg") {
            renderSVGPoints(x);
        }

    }
    // FEATURES
        for (var x in d3MapSVGFeatureLayer) {

    	if (d3MapSVGFeatureLayer[x].cluster() && updateClustering) {
	    quadtreeModePoints(d3MapSVGFeatureLayer[x], degreeDistance());
	}
        else if (d3MapSVGFeatureLayer[x].object().renderFrequency == "drawAlways"  && d3MapSVGFeatureLayer[x].visibility() ) {
            renderSVGFeatures(x);
            }
        }
    
    //CANVAS RENDERING
    renderCanvas("zoom");

    for (var x in tandemMapArray) {
	if (tandemMapArray[x].type == "minimap") {
	    tandemMapArray[x].mini.updateBoundingBox(map.screenBounds());
	}
    }
    }

    function d3MapZoomInitializeTransform() {
	
	var updateClustering = false;
    
	if (Math.abs(degreeDistance() - workingDistance) > .05) {
	    workingDistance = degreeDistance();
	    updateClustering = true;
	}

        //TO DO: Split out the rendering into separate functions and call those with renderVector("always") or renderVector("once") and the like
        for (var x in d3MapSVGPointsLayer) {
	    
        if (d3MapSVGPointsLayer[x].object().renderFrequency == "drawEnd" || !d3MapSVGPointsLayer[x].visibility() || d3MapSVGPointsLayer[x].cluster()) {
            d3MapSVGPointsLayer[x].g().style("display", "none");
        }
	else if (!d3MapSVGPointsLayer[x].cluster()) {
            d3MapSVGPointsLayer[x].g().style("display", "block");	    
	}
	if (d3MapSVGPointsLayer[x].cluster() && updateClustering) {
	    quadtreeModePoints(d3MapSVGPointsLayer[x], degreeDistance());
	}
        }
        
        for (var x in d3MapSVGFeatureLayer) {
            if (d3MapSVGFeatureLayer[x].object().renderFrequency == "drawEnd" || !d3MapSVGFeatureLayer[x].visibility()  || d3MapSVGFeatureLayer[x].cluster()) {
                d3MapSVGFeatureLayer[x].g().style("display", "none");
            }
	    else {
		d3MapSVGFeatureLayer[x].g().style("display", "block");
	    }
	    if (d3MapSVGFeatureLayer[x].cluster() && updateClustering) {
	    quadtreeModePoints(d3MapSVGFeatureLayer[x], degreeDistance());
	}
        }
    
    renderCanvas("zoom");

    }
    
    
    function d3MapZoomCompleteTransform() {

    renderTiles();
    
    	var updateClustering = false;
    
	if (Math.abs(degreeDistance() - workingDistance) > .05) {
	    workingDistance = degreeDistance();
	    updateClustering = true;
	}

    
    renderCanvas("zoomcomplete")
        
        for (var x in d3MapSVGPointsLayer) {
            if (d3MapSVGPointsLayer[x].object().renderFrequency == "drawEnd" || !d3MapSVGPointsLayer[x].visibility() || d3MapSVGPointsLayer[x].cluster()) {
            d3MapSVGPointsLayer[x].g().style("display", "none");
        }
	else if ((d3MapSVGPointsLayer[x].object().renderFrequency == "drawEnd" || d3MapSVGPointsLayer[x].object().renderFrequency == "drawAlways")  && d3MapSVGPointsLayer[x].visibility() && !d3MapSVGPointsLayer[x].cluster()) {
            d3MapSVGPointsLayer[x].g().style("display", "block");
            renderSVGPoints(x);
            }
        }

        for (var x in d3MapSVGFeatureLayer) {
            if (d3MapSVGFeatureLayer[x].cluster() && updateClustering) {
	    quadtreeModePoints(d3MapSVGFeatureLayer[x], degreeDistance());
	}
	    if ((d3MapSVGFeatureLayer[x].object().renderFrequency == "drawEnd" || d3MapSVGFeatureLayer[x].object().renderFrequency == "drawAlways")  && d3MapSVGFeatureLayer[x].visibility() && !d3MapSVGFeatureLayer[x].cluster()) {
            d3MapSVGFeatureLayer[x].g().style("display", "block");
            }
	    else {
		d3MapSVGFeatureLayer[x].g().style("display", "none");
	    }

    }
    }
    
    function renderCanvasTransform(zoomMode) {
	var context = canvasCanvas.node().getContext("2d");
        context.clearRect(0,0,mapWidth,mapHeight);
    
        for (var x in d3MapRasterFeatureLayer) {
          if ((d3MapRasterFeatureLayer[x].object().renderFrequency == "drawAlways" || (d3MapRasterFeatureLayer[x].object().renderFrequency == "drawDuring" && zoomMode == "zoom")) && d3MapRasterFeatureLayer[x].visibility() ) {
            renderCanvasFeatures(x, context);
          }	
        }

        for (var x in d3MapRasterPointsLayer) {
          if ((d3MapRasterPointsLayer[x].object().renderFrequency == "drawAlways" || (d3MapRasterPointsLayer[x].object().renderFrequency == "drawDuring" && zoomMode == "zoom")) && d3MapRasterPointsLayer[x].visibility() ) {
	    if ((d3MapRasterPointsLayer[x].features().length > 1000 && zoomMode == "zoomcomplete") || (d3MapRasterPointsLayer[x].features().length < 1000)) {
		renderCanvasPoints(x, context);
	    }
          }
        }
    }
    
    function renderSVGPoints(i) {
        var _pG = d3MapSVGPointsLayer[i].g();

        _pG.attr("transform", "translate(" + d3MapZoom.translate() + ")scale(" + d3MapZoom.scale() + ")");

	_pG.selectAll("g.marker")
	.attr("transform", "scale(" + (1 / d3MapZoom.scale()) + ")");

    }
    
    function renderSVGFeatures(i) {
        d3MapSVGFeatureLayer[i].g()
            .attr("transform", "translate(" + d3MapZoom.translate() + ")scale(" + d3MapZoom.scale() + ")");
    }

    function renderCanvasFeatures(i,context) {

	var _data = d3MapRasterFeatureLayer[i].features();

	var canvasProjection = d3.geo.mercator().scale(d3MapProjection.scale() * d3MapZoom.scale()).translate(d3MapZoom.translate());
	var canvasPath = d3.geo.path().projection(canvasProjection);
    
	for (var x in _data) {
	    context.strokeStyle = d3MapRasterFeatureLayer[i].strokeColor()(_data[x]);
	    context.fillStyle = d3MapRasterFeatureLayer[i].markerColor()(_data[x]);
	    context.lineWidth = parseFloat(d3MapRasterFeatureLayer[i].strokeWidth()(_data[x]));
	    context.beginPath(), canvasPath.context(context)(_data[x]);
	    if (_data[x]._d3Map.stroke != "none") {
		context.stroke()
	    }
	    if (_data[x]._d3Map.color != "none") {
		context.fill();
	    }
	}
    }
    
    function renderCanvasPoints(i,context) {
	var _data = d3MapRasterPointsLayer[i].features();
	var _layerX = d3MapRasterPointsLayer[i].x();
	var _layerY = d3MapRasterPointsLayer[i].y();
        for (var y in _data) {

        var projectedPoint = d3MapProjection([_layerX(_data[y]),_layerY(_data[y])])
        var projX = projectedPoint[0] * d3MapZoom.scale() + d3MapZoom.translate()[0];
        var projY = projectedPoint[1] * d3MapZoom.scale() + d3MapZoom.translate()[1];

        //Transform fill and opacity to rgba        
        var rgbMarker = d3.rgb(_data[y]._d3Map.color)
        var rgbaMarker = "rgba(" + rgbMarker.r + "," + rgbMarker.g + "," + rgbMarker.b + "," + _data[y]._d3Map.opacity + ")";
        
        context.beginPath();
        context.arc(projX,projY,d3MapRasterPointsLayer[i].markerSize()(_data[y]),0,2*Math.PI);
        context.fillStyle = d3MapRasterPointsLayer[i].markerColor()(_data[y]);
        context.strokeStyle = d3MapRasterPointsLayer[i].strokeColor()(_data[y]);
        context.lineWidth = parseFloat(d3MapRasterPointsLayer[i].strokeWidth()(_data[y]));
        context.stroke();
        context.fill();

      }
    }
    
    function renderTilesTransform() {
          //Tile drawing needs to only draw the topmost baselayer, or designate base layers through the layer control dialogue
	if (d3MapTileLayer.length == 0) {
	    return;
	  }
  var tiles = d3MapTile
      .scale(d3MapZoom.scale())
      .translate(d3MapZoom.translate())
      ();

      for (var x in d3MapTileLayer) {
        if (d3MapTileLayer[x].visibility()) {
  var image = d3MapTileLayer[x].g()
      .attr("transform", "scale(" + tiles.scale + ")translate(" + tiles.translate + ")")
    .selectAll("image")
      .data(tiles, function(d) { return d; });

  image.exit()
      .remove();

  image.enter().append("image")
    .attr("xlink:href", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + "." + tileTypes[d3MapTileLayer[x].object().type].flatPath + "/"+d3MapTileLayer[x].object().path+"/" + d[2] + "/" + d[0] + "/" + d[1] + "." + tileTypes[d3MapTileLayer[x].object().type].flatType; })
      .attr("width", 1)
      .attr("height", 1)
      .attr("x", function(d) { return d[0]; })
      .attr("y", function(d) { return d[1]; });
      }
      }
    }
    
    //PROJECTED RENDERING
    
        function renderSVGPointsProjected(i) {
	var _data = d3MapSVGPointsLayer[i].g();
	var _layerX = d3MapSVGPointsLayer[i].x();
	var _layerY = d3MapSVGPointsLayer[i].y();
	
	var r = d3MapProjection.rotate();
	var z = d3MapProjection.clipAngle() || 180;
	var a = [-r[0], -r[1]];
	var cDist = Math.PI * (z / 180);
	
        _data
            .attr("transform", "translate(0,0)scale(1)");
	    
	_data.selectAll("g.pointG").attr("transform", function(d) {return "translate(" + d3MapProjection([_layerX(d),_layerY(d)])+")"})
	.style("display", function(d) {return d3.geo.distance([_layerX(d),_layerY(d)],a) > 1.7 ? "none" : "block"})

	_data.selectAll("g.marker")
	.attr("transform", "scale(1)");

    }
    
    function renderSVGFeaturesProjected(i) {
	var _data = d3MapSVGFeatureLayer[i].g();

        _data
            .attr("transform", "translate(0,0) scale(1)");

        _data.selectAll("path")
	    .attr("d", d3MapPath)
    }
    
    function renderTilesProjected() {
	  if (d3MapTileLayer.length == 0) {
	    return;
	  }
	  rasterReprojecting = true;
      for (var x in d3MapTileLayer) {
        if (d3MapTileLayer[x].visibility()) {

    mapDiv.select("#reprojectDiv").selectAll("div").remove();

    var layer = mapDiv.select("#reprojectDiv")
	.style("width", mapWidth + "px")
	.style("height", mapHeight + "px")
  .append("div")
  .style("position", "absolute")
    .style(prefix + "transform-origin", "0 0 0")
    .call(d3.geo.raster(d3MapProjection)
    .url("//{subdomain}." + tileTypes[d3MapTileLayer[x].object().type].flatPath + "/"+ d3MapTileLayer[x].object().path +"/{z}/{x}/{y}." + tileTypes[d3MapTileLayer[x].object().type].flatType)
      .on("reprojectcomplete", function() {console.log("reprojectComplete");}));
    
    reprojectDiv.selectAll("canvas.tile").style("position","absolute")
    }
      }

    }
function manualZoom(zoomDirection) {

  if (zoomDirection == "in") {
    if (d3MapZoom.scale() >= d3MapZoom.scaleExtent()[1]) {
      return;
    }
        var newZoom = d3MapZoom.scale() * 1.5;
        var newX = ((d3MapZoom.translate()[0] - (mapWidth / 2)) * 1.5) + mapWidth / 2;
        var newY = ((d3MapZoom.translate()[1] - (mapHeight / 2)) * 1.5) + mapHeight / 2;
  }

  else {
    if (d3MapZoom.scale() <= d3MapZoom.scaleExtent()[0]) {
      return;
    }
        var newZoom = d3MapZoom.scale() * .75;
        var newX = ((d3MapZoom.translate()[0] - (mapWidth / 2)) * .75) + mapWidth / 2;
        var newY = ((d3MapZoom.translate()[1] - (mapHeight / 2)) * .75) + mapHeight / 2;    
    }

        mapSVG.call(d3MapZoom.translate([newX,newY]).scale(newZoom).event);
    }
    
    function manualPan(panDirection, panAmount) {
        var newX = ((d3MapZoom.translate()[0] - (mapWidth / 2))) + mapWidth / 2;
        var newY = ((d3MapZoom.translate()[1] - (mapHeight / 2))) + mapHeight / 2;
	switch (panDirection) {
	    case "left":
		newX = newX + (mapWidth * panAmount);
		break;
	    case "right":
		newX = newX - (mapWidth * panAmount);
		break;
	    case "up":
		newY = newY + (mapHeight * panAmount);
		break;
	    case "down":
		newY = newY - (mapHeight * panAmount);
		break;
	    default:
	    return false;
	}
        mapSVG.call(d3MapZoom.translate([newX,newY]).event);
	return true;
    }
      
      function scaled(incomingNumber) {
          return parseFloat(incomingNumber) / d3MapZoom.scale();
        }

	function cssFromClass(incomingClass) {
	    var marker = {};
        var dummyMarker = mapSVG.append("circle").attr("class", incomingClass);
        marker.markerStroke = dummyMarker.style("stroke") || "black";
        marker.markerStrokeWidth = dummyMarker.style("stroke-width") || 1;
        marker.markerFill = dummyMarker.style("fill") || "white";
        marker.markerOpacity = dummyMarker.style("opacity") || 1;
        marker.fontSize = dummyMarker.style("font-size") || 1;
        marker.fontWeight = dummyMarker.style("font-weight") || 1;
        dummyMarker.remove();
	return marker;
	}

    function processFeatures(featureData, featureLayerName, featureLayerClass, renderType, renderFrequency,cartoLayer) {

	var marker = cssFromClass(featureLayerClass);
	var qtree = d3.geom.quadtree();

	if (!cartoLayer) {
	    cartoLayer = Layer()
	    .type("featurearray")
	    .features(featureData)
	    .label(featureLayerName)
	    .cssClass(featureLayerClass)
	    .features(featureData)
	    .renderType(renderType)
	    .markerColor(marker.markerFill)
	    .strokeColor(marker.markerStroke)
	    .strokeWidth(marker.markerStrokeWidth)
	    .on("newmodal", function() {d3MapSetModal(cartoLayer)});
	}
	
	qtree.x(function(d) {return d3.geo.centroid(d)[0]}).y(function(d) {return d3.geo.centroid(d)[1]});
	
	var featureQuad = qtree(featureData);

	featureQuad.visit(function(node, x1,y1,x2,y2) {
	    if (!node.leaf) {
		node._d3Quad = {};
		node._d3Quad["x"] = (x1 + x2) / 2;
		node._d3Quad["y"] = (y1 + y2) / 2;
		node._d3Quad["qsize"] = (x2 - x1);
	    }
	})

	for (var x in featureData) {
                      featureData[x]._d3Map = {};
                      featureData[x]._d3Map.arrayPosition = x;
                      featureData[x]._d3Map.color = marker.markerFill;
                      featureData[x]._d3Map.stroke = marker.markerStroke;
                      featureData[x]._d3Map.opacity = marker.markerOpacity;
                      featureData[x]._d3Map.strokeWidth = marker.markerStrokeWidth;
	      }
	      
	      cartoLayer.features(featureData);
	  if (!cartoLayer.markerColor()) {
	    cartoLayer.markerColor(marker.markerFill);
	  }
	  if (!cartoLayer.strokeColor()) {
	    cartoLayer.strokeColor(marker.markerStroke)
	  }
	  if (!cartoLayer.strokeWidth()) {
	    cartoLayer.strokeWidth(marker.markerStrokeWidth)
	  }

		    if (renderType == "canvas") {
			var layerObj = {id: "rf" + d3MapRasterFeatureLayer.length, drawOrder: d3MapRasterFeatureLayer.length, path: "", visible: true, name: featureLayerName, active: true, qtree: featureQuad, renderFrequency: "drawAlways", cluster: cartoLayer.cluster()}
			d3MapRasterFeatureLayer.push(cartoLayer);
		    }

		    else {
                    var layerG = mapSVG.insert("g", ".points").attr("class", "features").attr("id", "sf" + d3MapSVGFeatureLayer.length);
                    var layerObj = {id: "sf" + d3MapSVGFeatureLayer.length, drawOrder: d3MapSVGFeatureLayer.length, path: "", visible: true, name: featureLayerName, active: true, qtree: featureQuad, renderFrequency: "drawAlways", cluster: cartoLayer.cluster()}
                    d3MapSVGFeatureLayer.push(cartoLayer)
                    layerG.attr("transform", "translate(" + d3MapZoom.translate() + ")scale(" + d3MapZoom.scale() + ")");
		    cartoLayer.g(layerG);
		    
		    updateLayer(cartoLayer);
  
		  
	    if (cartoLayer.clickableFeatures()) {
		d3MapSetModal(cartoLayer);
		  }
		  else {
		    layerG.selectAll("g.marker")
		    .style("pointer-events", "none");
		  }

		    }
		    
	if (cartoLayer.cluster()) {
	    workingDistance = 1000;
	}
		    d3MapAllLayers.push(cartoLayer)
	    cartoLayer.object(layerObj);
	    updateLayers();
	    map.refresh();
	    
	}

    function processXYFeatures(points, newCSVLayerName, newCSVLayerClass, markerSize, renderType, xcoord, ycoord, renderFrequency,cartoLayer) {
    	var rFreq = renderFrequency || "mixed";
        var cName = newCSVLayerName || "CSV " + d3Layer.length
        var cID = "cps" + d3MapSVGPointsLayer.length;
        var ccID = "cpc" + d3MapRasterPointsLayer.length;
	
	var qtree = d3.geom.quadtree();
	var marker = cssFromClass(newCSVLayerClass);

	if (!cartoLayer) {
	    cartoLayer = Layer()
	    .type("xyarray")
	    .features(points)
	    .label(newCSVLayerName)
	    .cssClass(newCSVLayerClass)
	    .markerSize(markerSize)
	    .x(xcoord)
	    .y(ycoord)
	    .renderMode(renderType)
	    .markerColor(marker.markerFill)
	    .strokeColor(marker.markerStroke)
	    .strokeWidth(marker.markerStrokeWidth)
	    .cluster(false)
	    .on("newmodal", function() {d3MapSetModal(cartoLayer)});
	}

	qtree.x(function(d) {return cartoLayer.x()(d)}).y(function(d) {return cartoLayer.y()(d)});
	
	var xyQuad = qtree(points);
	
	xyQuad.visit(function(node, x1,y1,x2,y2) {
	    if (!node.leaf) {
		node._d3Quad = {};
		node._d3Quad["x"] = (x1 + x2) / 2;
		node._d3Quad["y"] = (y1 + y2) / 2;
		node._d3Quad["qsize"] = (x2 - x1);	
	    }
	})

        if (renderType == "canvas") {
        var pointsObj = {id: ccID, drawOrder: d3MapRasterPointsLayer.length, path: "", visible: true, name: cName, active: true, renderFrequency: "drawAlways", mixed: false, qtree: xyQuad, cluster: cartoLayer.cluster()}
            d3MapRasterPointsLayer.push(cartoLayer);
        }
        else if (renderType == "svg") {
        var pointsObj = {id: cID, drawOrder: d3MapSVGPointsLayer.length, path: "", visible: true, name: cName, active: true, renderFrequency: "drawAlways", mixed: false, qtree: xyQuad, cluster: cartoLayer.cluster()}
            d3MapSVGPointsLayer.push(cartoLayer);
        }

	//Mixed mode will be broken for a bit

        else if (renderType == "mixed") {
        var pointsObj = {id: ccID, path: "",drawOrder: d3MapRasterPointsLayer.length, visible: true, name: cName, active: true, renderFrequency: "drawDuring", mixed: true, mixedDup: cID, qtree: xyQuad, cluster: cartoLayer.cluster()}
            d3MapRasterPointsLayer.push(cartoLayer);
        var pointsObj = {id: cID, path: "",drawOrder: d3MapSVGPointsLayer.length, visible: true, name: cName, active: true, renderFrequency: "drawEnd", mixed: true, mixedDup: ccID, qtree: xyQuad, cluster: cartoLayer.cluster()}
            d3MapSVGPointsLayer.push(cartoLayer);
        }

            //To access CSS properties
	    var marker = cssFromClass(newCSVLayerClass);
        
          for (var x in points) {
            if(points[x]) {
              //Create and store fixed display data in the _d3Map object
	      if (!points[x]._d3Map) {

              points[x]._d3Map = {};
              points[x]._d3Map.color = marker.markerFill;
              points[x]._d3Map.stroke = marker.markerStroke;
              points[x]._d3Map.opacity = marker.markerOpacity;
              points[x]._d3Map.strokeWidth = marker.markerStrokeWidth;
              points[x]._d3Map.fontSize = marker.fontSize;
              points[x]._d3Map.fontWeight = marker.fontWeight;
              points[x]._d3Map.x = points[x][xcoord];
              points[x]._d3Map.y = points[x][ycoord];
              points[x]._d3Map.dx = 0;
              points[x]._d3Map.dy = 0;
	      }
	      else {

              points[x]._d3Map.color = marker.markerFill;
              points[x]._d3Map.stroke = marker.markerStroke;
              points[x]._d3Map.opacity = marker.markerOpacity;
              points[x]._d3Map.strokeWidth = marker.markerStrokeWidth;
              points[x]._d3Map.fontSize = marker.fontSize;
              points[x]._d3Map.fontWeight = marker.fontWeight;
	      }
            }
          }

	  if (!cartoLayer.markerColor()) {
	    cartoLayer.markerColor(marker.markerFill);
	  }
	  if (!cartoLayer.strokeColor()) {
	    cartoLayer.strokeColor(marker.markerStroke)
	  }
	  if (!cartoLayer.strokeWidth()) {
	    cartoLayer.strokeWidth(marker.markerStrokeWidth)
	  }

	  cartoLayer.features(points);
        if (renderType == "svg" || renderType == "mixed") {
	var pointsG = mapSVG.append("g").attr("class", "points").attr("id", cID);
        d3MapSVGPointsG.push(pointsG);
	cartoLayer.g(pointsG);
	pointsG.attr("transform", "translate(" + d3MapZoom.translate() + ")scale(" + d3MapZoom.scale() + ")");
  
	    updateLayer(cartoLayer);
 
  
  if (cartoLayer.clickableFeatures()) {
	d3MapSetModal(cartoLayer);
  }
  else {
    cartoLayer.g().selectAll("g.marker")
    .style("pointer-events", "none");
  }

        }

	if (cartoLayer.cluster()) {
	    workingDistance = 1000;
	}

	    d3MapAllLayers.push(cartoLayer)
	    cartoLayer.object(pointsObj);
	    updateLayers();
	    map.refresh();

    }

    function d3MapAddTileLayer(newTileLayer, newTileLayerName, tileType, disabled, cartoLayer) {

	var tName = newTileLayerName || "Raster " + d3MapTileLayer.length
        var tPosition = d3MapTileLayer.length;
        var tID = "tl" + d3MapTileLayer.length;
        var tObj = {id: tID, drawOrder: d3MapTileLayer.length, path: newTileLayer, visible: true, name: tName, active: true, renderFrequency: "drawAlways", type: tileType};
	var tG = tileSVG.insert("g", tID).attr("class", "tiles").attr("id", tID);
	
	if (cartoLayer) {
	    cartoLayer.g(tG);
	    cartoLayer.object(tObj);
	}
	else {
	    cartoLayer = Layer()
	    .path(newTileLayer)
	    .label(tName)
	    .tileType(tileType)
	    .visibility(disabled)
	    .g(tG)
	    .object(tObj)
	    .on("newmodal", function() {d3MapSetModal(cartoLayer)});
	}

        d3MapTileLayer.push(cartoLayer);
        d3MapTileG.push(tG);

        d3MapZoomed();
        updateLayers();
	d3MapAllLayers.push(cartoLayer);
        if (cartoLayer.visibility() == false || disabled) {
	    cartoLayer.visibility(true);
            showHideLayer(cartoLayer,0,mapDiv.select("li#" + tID).node())
        }

    }
    
    function d3MapAddCSVLayer(newCSVLayer, newCSVLayerName, newCSVLayerClass, markerSize, renderType, xcoord, ycoord, renderFrequency,cartoLayer) {

	var marker = cssFromClass(newCSVLayerClass);

	if (!cartoLayer) {
	    cartoLayer = Layer()
	    .type("csv")
	    .path(newCSVLayer)
	    .label(newCSVLayerName)
	    .cssClass(newCSVLayerClass)
	    .markerSize(markerSize)
	    .x(xcoord)
	    .y(ycoord)
	    .renderMode(renderType)
	    .markerColor(marker.markerFill)
	    .strokeColor(marker.markerStroke)
	    .strokeWidth(marker.markerStrokeWidth)
	    .cluster(false)
	    .on("newmodal", function() {d3MapSetModal(cartoLayer)});
	}
	
	if (!renderFrequency) {
	    renderFrequency = "drawAlways";
	}
	
	d3.csv(newCSVLayer, function(error, points) {
	    processXYFeatures(points, newCSVLayerName, newCSVLayerClass, markerSize, renderType, xcoord, ycoord, renderFrequency,cartoLayer)
        })
	}

    function d3MapAddTopoJSONLayer(newTopoLayer, newTopoLayerName, newTopoLayerClass, renderType, specificFeature, renderFrequency,cartoLayer) {
        d3.json(newTopoLayer, function(error, topoData) {

	    var layerDataType = "topojson";

            for (var x in topoData.objects) {
                if (x == specificFeature || specificFeature == "all") {

	var marker = cssFromClass(newTopoLayerClass);

	if (!cartoLayer) {
	    cartoLayer = Layer()
	    .type("topojson")
	    .path(newTopoLayer)
	    .label(newTopoLayerName)
	    .cssClass(newTopoLayerClass)
	    .markerColor(marker.markerFill)
	    .strokeColor(marker.markerStroke)
	    .strokeColor(marker.markerStrokeWidth)
	    .on("newmodal", function() {d3MapSetModal(cartoLayer)});
	}
	cartoLayer.dataset(topoData).specificFeature(x);

		    var topoLayerData = topojson.feature(topoData, topoData.objects[x]);
		    var td;
		    if (topoLayerData.type == "Feature") {
			td = [topoLayerData];
		    }
		    else {
			td = topoLayerData.features;
		    }
		    processFeatures(td, newTopoLayerName, newTopoLayerClass, renderType, renderFrequency,cartoLayer);
		    
                }
            }
        })
}

	function d3MapAddGeoJSONLayer(newGeoLayer, newGeoLayerName, newGeoLayerClass, renderType, specificFeature, renderFrequency,cartoLayer){
	var layerDataType = "geojson";

	var marker = cssFromClass(newGeoLayerClass);

	if (!cartoLayer) {
	    cartoLayer = Layer()
	    .type("geojson")
	    .path(newGeoLayer)
	    .label(newGeoLayerName)
	    .cssClass(newGeoLayerClass)
	    .markerColor(marker.markerFill)
	    .strokeColor(marker.markerStroke)
	    .strokeColor(marker.markerStrokeWidth)
	    .on("newmodal", function() {d3MapSetModal(cartoLayer)});
	}

        d3.json(newGeoLayer, function(error, geoData) {
	    if (geoData.features[0].geometry.type == "Point") {
		cartoLayer
		.type("xyarray")
		.x(function(d) {return d.geometry.coordinates[0]})
		.y(function(d) {return d.geometry.coordinates[1]});
		processXYFeatures(geoData.features, newGeoLayerName, newGeoLayerClass, cartoLayer.markerSize(), renderType, cartoLayer.x(), cartoLayer.y(), renderFrequency,cartoLayer);
	    }
	    else {
	    processFeatures(geoData.features, newGeoLayerName, newGeoLayerClass, renderType, renderFrequency,cartoLayer);
	    }
        })
	}

	
    function quadtreeModePoints(layer, resolution) {
	
	var quadDisplayScale = d3.scale.linear().domain([2,2.5,4,5,6,7,8,9,10,12,20]).range([300,150,50,10,8,6,5,4,3,2,.01]).clamp(true);
	var clusterD = quadClusterScale;
	if (map.mode() == "globe") {
	    clusterD = quadClusterScale;
	}
	if (map.mode() == "projection") {
	    clusterD = quadClusterScale;
	}
	if (layer.object().qtreeLayer) {
	    map.deleteCartoLayer(layer.object().qtreeLayer);
	}
	if (layer.type() == "featurearray" || layer.type() == "geojson" || layer.type() == "topojson") {	
	    clusterD = quadClusterScale;
	}
	var quadtree = layer.object().qtree
	var quadSites = [];
	traverse(quadtree);

	function traverse(node) {
	    for (var x in node.nodes) {
		if (node.nodes[x].leaf) {
		    quadSites.push(node.nodes[x])
		}
		else if (node.nodes[x]._d3Quad.qsize < (quadDisplayScale(resolution) * clusterD)) {
		    quadSites.push(node.nodes[x])
		}
		else {
		    traverse(node.nodes[x])
		}
	    }
	}

	for (var x in quadSites) {
	    quadSites[x]._d3MapQuad = {};
	    quadSites[x]._d3MapQuad.size = quadSize(quadSites[x]);
	    quadSites[x]._d3MapQuad.x = quadSites[x]._d3Quad ? quadSites[x]._d3Quad.x : layer.x()(quadSites[x].point);
	    quadSites[x]._d3MapQuad.y = quadSites[x]._d3Quad ? quadSites[x]._d3Quad.y : layer.y()(quadSites[x].point);
	}
	
    function quadSize(d) {
	var _size = 0;
	d.children = [];
	    for (var x in d.nodes) {
		if (d.nodes[x].leaf) {
		    d.children.push(d.nodes[x]);
		    _size++;
		}
		else if (d.nodes[x].nodes) {
		    d.children.push(d.nodes[x]);
		    _size += quadSize(d.nodes[x]);
		}
	    }
	return _size;
    }
//	TODO: Topojson.merge
	if (layer.type() == "topojson" || layer.type() == "featurearray" || layer.type() == "geojson") {
	    var quadSiteFeatures = [];
	    if (layer.type() == "topojson") {

	    for (x in quadSites) {
		quadSiteFeatures.push(createMergedPolygon(quadSites[x]));
	    }		
	    }
	    else {
	    for (x in quadSites) {
		quadSiteFeatures.push(createMultiPolygon(quadSites[x]));
	    }
	    }

    var qtreeLayer = d3.carto.layer.featureArray();
    qtreeLayer
    .features(quadSiteFeatures)
    .label(layer.label() + " (Clustered)")
    .cssClass(layer.cssClass())
    .renderMode("svg")
    .markerSize(function(d) {return d.leaf ? 3 : simpleSizeScale(d._d3MapQuad.size)})
    .clickableFeatures(true)
    .on("load", layer.recluster)
    .on("newmodal", function() {d3MapSetModal(qtreeLayer)});

    layer.object().qtreeLayer = qtreeLayer;
    
    map.addCartoLayer(qtreeLayer);
	}
	else if (layer.type() == "csv" || layer.type() == "xyarray") {
    var simpleSizeScale = d3.scale.linear().domain([2,10]).range([4,10]).clamp(true)

    var qtreeLayer = d3.carto.layer.xyArray();
    qtreeLayer
    .features(quadSites)
    .label(layer.label() + " (Clustered)")
    .cssClass(layer.cssClass())
    .renderMode("svg")
    .markerSize(function(d) {return d.leaf ? 3 : simpleSizeScale(d._d3MapQuad.size)})
    .x(function(d) {return d._d3MapQuad.x})
    .y(function(d) {return d._d3MapQuad.y})
    .on("load", layer.recluster)
    .on("newmodal", function() {d3MapSetModal(qtreeLayer)});

    layer.object().qtreeLayer = qtreeLayer;
    
    map.addCartoLayer(qtreeLayer);
	}

	function createMultiPolygon(d) {
	    if (d.leaf == true) {
		return d.point;
	    }
	    var multiMade = {type: "Feature", properties: {node: d}, geometry: {"type": "MultiPolygon", coordinates: combineGeoms(d,[])}};
	    return multiMade;
	}
	
	function createMergedPolygon(d) {
	    var topoData = layer.dataset();
	    var topoObject = layer.specificFeature();
	    
	    if (d.leaf == true) {
		var thisPoint = {type: d.point.type, properties: {node: d}, geometry: d.point.geometry}
		return thisPoint;
	    }

	    var multiMade = {type: "Feature", properties: {node: d}, geometry: topojson.merge(topoData, mergeGeoms(d,[]))};
	    return multiMade;
	}

	function mergeGeoms(d,geomArray) {
	    var topoDataM = layer.dataset();
	    var topoObjectM = layer.specificFeature();
	    var newArray = [];
	    if (d.leaf == true) {
		newArray =  d3.merge([geomArray,[topoDataM.objects[topoObjectM].geometries[d.point._d3Map.arrayPosition]]]);
	    }
	    else {
		for (x in d.children) {
		    newArray = mergeGeoms(d.children[x],newArray);
		}
		newArray = d3.merge([geomArray,newArray])
	    }
	    return newArray;
	}
	
	function combineGeoms(d, geomArray) {
	    var newArray = [];
	    if (d.leaf == true) {
		if (d.point.geometry.type == "Polygon") {
		    newArray = d3.merge([geomArray,[d.point.geometry.coordinates]]);
		}
		else if (d.point.geometry.type == "MultiPolygon") {
		    newArray = d3.merge([geomArray,d.point.geometry.coordinates]);		    
		}
	    }
	    else {
		for (x in d.children) {
		    newArray = combineGeoms(d.children[x],newArray);
		}
		newArray = d3.merge([geomArray,newArray])
	    }
	    return newArray;
	}
	
	
    }
    
    function touchBegin() {
	return;
      d3.event.preventDefault();
      d3.event.stopPropagation();

    var d = d3.touches(this);
        touchInitialD = d;

      touchInitialRotate = d3.transform(d3.select(".rotateG").attr("transform")).rotate;
	touchInitialScale = d3MapZoom.scale();
       	if (d.length == 2) {
	    d3MapZoomInitialize();
	    touchInitialLength = Math.sqrt(Math.abs(d[0][0] - d[1][0]) + Math.abs(d[0][1] - d[1][1]));
	}


          }
     function touchUpdate() {
	return;
       d3.event.preventDefault();
       d3.event.stopPropagation();
       var d = d3.touches(this);

      if (d.length == 2) {
	var currentLength = Math.sqrt(Math.abs(d[0][0] - d[1][0]) + Math.abs(d[0][1] - d[1][1]));
        var zoom = currentLength / touchInitialLength;
        var newScale = zoom * touchInitialScale;
	d3MapZoom.scale(newScale)
        d3MapZoomed();

      }

      else if (d.length == 3) {
        var slope1 = (touchInitialD[0][1] - touchInitialD[1][1]) / (touchInitialD[0][0] - touchInitialD[1][0]);
        var slope2 = (d[0][1] - d[1][1]) / (d[0][0] - d[1][0]);
        
        var angle = Math.atan((slope1 - slope2)/(1 + slope1*slope2)) * 180/Math.PI;

        var newRotate = touchInitialRotate - angle;
        
        d3.selectAll(".rotateG").attr("transform", "rotate(" +newRotate +")")
        d3.selectAll("text").attr("transform", "rotate(" +(-newRotate)+")")

      }

     }
    
    function touchEnd() {
	return;
       var d = d3.touches(this);
	if (d.length == 2) {
	    d3MapZoomComplete();
	}

    }
    
    function d3MapSetModal(cartoLayer) {
	if (!cartoLayer.modal()) {
	    var cartoModal = Modal().parentDiv(mapDiv).parentG(cartoLayer.g());
	    cartoLayer.modal(cartoModal);	
	}
	else {
	    cartoLayer.modal().parentDiv(mapDiv).parentG(cartoLayer.g())
	}
	    cartoLayer.g().selectAll("g.marker")
	    .style("cursor", "pointer")
	    .on("click", cartoLayer.modal())
    }
    
    function xyToCoordinates(xy) {
	var _x = (xy[0] - d3MapZoom.translate()[0]) / d3MapZoom.scale();
	var _y = (xy[1] - d3MapZoom.translate()[1]) / d3MapZoom.scale();
	return d3MapProjection.invert([_x,_y]);
	
    }
    
    function updateLayer(cartoLayer) {

    var features = cartoLayer.features();
    var layerG = cartoLayer.g();
    if (!layerG) {map.refresh();return;}
    var layerClass = cartoLayer.cssClass();

    if (cartoLayer.type() == "csv" || cartoLayer.type() == "xyarray") {

  var appendedPointsEnter = layerG.selectAll("g.pointG")
  .data(features)
  .enter()
  .append("g")
  .attr("id", function(d,i) {return layerClass + "_g_" + i})
  .attr("class", layerClass + " pointG")
  .append("g")
  .attr("class", "marker")
  .attr("transform", "scale(" + (1 / d3MapZoom.scale()) + ")");
  
  appendedPointsEnter
  .append("circle")
  .attr("class", layerClass)
  .attr("r", function(d) {return cartoLayer.markerSize()(d)});
  
  layerG.selectAll("g.pointG")
  .data(features)
  .exit()
  .remove();
  
  layerG.selectAll("g.pointG")
    .attr("transform", function(d) {return "translate(" + (d._d3Quad ? d3MapProjection([d._d3Quad.x,d._d3Quad.y]) : d3MapProjection([cartoLayer.x()(d),cartoLayer.y()(d)])) + ")"})
  .each(function(d) {
    d._d3Map.originalTranslate = "translate(" + (d._d3Quad ? d3MapProjection([d._d3Quad.x,d._d3Quad.y]) : d3MapProjection([cartoLayer.x()(d),cartoLayer.y()(d)])) + ")";
  })

  
    }
    else if (cartoLayer.type() == "geojson" || cartoLayer.type() == "topojson" || cartoLayer.type() == "featurearray") {
	        var appendedFeatures = layerG.selectAll("g")
                  .data(features)
                  .enter()
                  .append("g")
                  .attr("class", "marker " + layerClass);
		  
		  appendedFeatures
		  .append("path")
                  .attr("class", layerClass)
                  .attr("d", d3MapPath)
		  
		  layerG.selectAll("g")
		  .data(features)
		  .exit()
		  .remove();

    }
    
    }
    
    //Exposed Functions

    map.addCartoLayer = function (cartoLayer) {
	switch (cartoLayer.type()) {
	    case "tile":
		d3MapAddTileLayer(cartoLayer.path(),cartoLayer.label(),cartoLayer.tileType(),!cartoLayer.visibility(),cartoLayer)
		break;
	    case "csv":
		d3MapAddCSVLayer(cartoLayer.path(), cartoLayer.label(), cartoLayer.cssClass(), cartoLayer.markerSize(), cartoLayer.renderMode(), cartoLayer.x(), cartoLayer.y(), "drawAlways",cartoLayer)
		break;
	    case "topojson":
		d3MapAddTopoJSONLayer(cartoLayer.path(), cartoLayer.label(), cartoLayer.cssClass(), cartoLayer.renderMode(), cartoLayer.specificFeature(), "drawAlways",cartoLayer)
		break;
	    case "geojson":
		d3MapAddGeoJSONLayer(cartoLayer.path(), cartoLayer.label(), cartoLayer.cssClass(), cartoLayer.renderMode(), cartoLayer.specificFeature(), "drawAlways",cartoLayer)
		break;
	    case "xyarray":
		processXYFeatures(cartoLayer.features(), cartoLayer.label(), cartoLayer.cssClass(), cartoLayer.markerSize(), cartoLayer.renderMode(), cartoLayer.x(), cartoLayer.y(), "drawAlways",cartoLayer)
		break;
	    case "featurearray":
		processFeatures(cartoLayer.features(), cartoLayer.label(), cartoLayer.cssClass(),cartoLayer.renderMode(), "drawAlways",cartoLayer)
		break;
	    default:
	    return false;
	}
	for (var x in tandemMapArray) {
	    var newCartoLayer = new d3.carto.layer;
	    var layerFunctions = ["path","type","visibility","renderMode","x","y","markerSize","cssClass","g","object","features","tileType","specificFeature"];
	    for (var i in layerFunctions) {
		newCartoLayer[layerFunctions[i]](cartoLayer[layerFunctions[i]]());
	    }
	    if (tandemMapArray[x].forceCanvas) {
		newCartoLayer.renderMode("canvas")
	    }
	    tandemMapArray[x].map.addCartoLayer(newCartoLayer);
	}
	return this;
    }

    map.addTileLayer = function (newTileLayer, newTileLayerName, tileType, disabled) {
        if (!arguments.length) return false;

        var tDisabled = disabled || false;
	
	d3MapAddTileLayer(newTileLayer, newTileLayerName, tileType, tDisabled);
        return this;
    }
    
    map.addCSVLayer = function (newCSVLayer, newCSVLayerName, newCSVLayerClass, markerSize, renderType, xcoord, ycoord, renderFrequency) {
        //TO DO: Render Type "mixed" creates two layers, a canvas layer drawnAlways and an SVG layer drawnOnce
        if (!arguments.length) return false;

	d3MapAddCSVLayer(newCSVLayer, newCSVLayerName, newCSVLayerClass, markerSize, renderType, xcoord, ycoord, renderFrequency);
	return this;
    
    }
    
    map.addXYLayer = function (dataArray, newCSVLayerName, newCSVLayerClass, markerSize, renderType, xcoord, ycoord, renderFrequency) {
        //TO DO: Render Type "mixed" creates two layers, a canvas layer drawnAlways and an SVG layer drawnOnce
        if (!arguments.length) return false;

	processXYFeatures(dataArray, newCSVLayerName, newCSVLayerClass, markerSize, renderType, xcoord, ycoord, renderFrequency)
	
	return this;
    
    }

    map.addTopoJSONLayer = function (newTopoLayer, newTopoLayerName, newTopoLayerClass, renderType, specificFeature, renderFrequency) {
        if (!arguments.length) return false;
	d3MapAddTopoJSONLayer(newTopoLayer, newTopoLayerName, newTopoLayerClass, renderType, specificFeature, renderFrequency);
	return this;    
    }    

    map.addGeoJSONLayer = function (newGeoLayer, newGeoLayerName, newGeoLayerClass, renderType, specificFeature, renderFrequency) {
	if (!arguments.length) return false;
	d3MapAddGeoJSONLayer(newGeoLayer, newGeoLayerName, newGeoLayerClass, renderType, specificFeature, renderFrequency)
	return this;	
    }

    map.addFeatureLayer = function (featureArray, newLayerName, newLayerClass, renderType, renderFrequency) {
	    var layerDataType = "featurearray";

	    processFeatures(featureArray, newLayerName, newLayerClass, renderType, renderFrequency);
	    
    }
    // #map.getLayerAttributes("layerName")
    
    map.center = function (newCenter) {
        if (!arguments.length) return mapCenter;
        mapCenter = newCenter;
        return this;
    }
    
    map.centerOn = function (newSetCenter, type, transitionSpeed) {
        var tSpeed = transitionSpeed || 0;
        if (!arguments.length) return false;

	var projectedCenter = newSetCenter;

	if (type == "latlong") {
            var projectedCenter = d3MapProjection(newSetCenter);
	}

        var s = d3MapZoom.scale();
        var t = [mapWidth / 2 - (s * projectedCenter[0]), mapHeight / 2 - (s * projectedCenter[1])];

        if (tSpeed == 0) {
        mapSVG
            .call(d3MapZoom.translate(t).scale(s).event);
        }
        else {
        mapSVG.transition()
            .duration(tSpeed)
            .call(d3MapZoom.translate(t).scale(s).event);            
        }

        return this;
    }
    
    map.zoomTo = function (boundingBox, type, margin, transitionSpeed) {

        if (!arguments.length) return false;

	var m = margin || .9;
        var tSpeed = transitionSpeed || 0;

	if (type == "latlong") {
            boundingBox = [d3MapProjection(boundingBox[0]),d3MapProjection(boundingBox[1])];
	}
	
      var dx = boundingBox[1][0] - boundingBox[0][0],
      dy = boundingBox[1][1] - boundingBox[0][1],
      x = (boundingBox[0][0] + boundingBox[1][0]) / 2,
      y = (boundingBox[0][1] + boundingBox[1][1]) / 2,
      s = m / Math.max(dx / mapWidth, dy / mapHeight),
      t = [mapWidth / 2 - s * x, mapHeight / 2 - s * y];

        if (tSpeed == 0) {
            mapSVG
                .call(d3MapZoom.translate(t).scale(s).event);
        }
        else {
	    mapSVG.transition()
              .duration(transitionSpeed)
              .call(d3MapZoom.translate(t).scale(s).event);
	}
        return this;
    }
    
    map.zoomToLayer = function(cartoLayer, margin, transitionSpeed) {
	
	var layerExtent = boundingExtent(cartoLayer.features());
	map.zoomTo(layerExtent, "latlong", margin, transitionSpeed);
	function boundingExtent(features) {
            var boundExtent = [[Infinity,Infinity],[-Infinity,-Infinity]];
	    if (cartoLayer.type() == "topojson" || cartoLayer.type() == "geojson" || cartoLayer.type() == "featureArray") {
            for (var x in features) {
              var thisBounds = d3.geo.bounds(features[x]);
	      boundExtent[0][0] = Math.max(-179.99,Math.min(thisBounds[0][0],boundExtent[0][0]));
              boundExtent[0][1] = Math.max(-89.99,Math.min(thisBounds[0][1],boundExtent[0][1]));
              boundExtent[1][0] = Math.min(179.99,Math.max(thisBounds[1][0],boundExtent[1][0]));
              boundExtent[1][1] = Math.min(89.99,Math.max(thisBounds[1][1],boundExtent[1][1]));

            }
	    }
	    else {
            for (var x in features) {
              var thisXY = [cartoLayer.x()(features[x]), cartoLayer.y()(features[x])]
	      boundExtent[0][0] = Math.max(-179.99,Math.min(boundExtent[0][0],thisXY[0]));
              boundExtent[0][1] = Math.max(-89.99,Math.min(boundExtent[0][1],thisXY[1]));
              boundExtent[1][0] = Math.min(179.99,Math.max(boundExtent[1][0],thisXY[0]));
              boundExtent[1][1] = Math.min(89.99,Math.max(boundExtent[1][1],thisXY[1]));

            }		
	    }
            return boundExtent;
	}
    }

    map.screenBounds = function () {

    var s = d3MapZoom.scale(),
    t = d3MapZoom.translate();
    
    var b1 = map.projection().invert([-t[0]/s,-t[1]/s])
    var b2 = map.projection().invert([(mapWidth- t[0]) / s,-(t[1] - mapHeight) / s])

    return [b1,b2]

    }

    map.zoom = function (newZoom) {
        if (!arguments.length) return d3MapZoom;
        d3MapZoom = newZoom;
        return this;
    }

    map.projection = function (newProjection) {
        if (!arguments.length) return d3MapProjection;
	if (newProjection.clipExtent) {
	    newProjection.clipExtent([[0,0],[mapWidth,mapHeight]]);
	}
	var newScale = newProjection.scale();
	var newTranslate = newProjection.translate();	
        d3MapProjection = newProjection;
	d3MapZoom.scale(newScale).translate(newTranslate);
	d3MapPath.projection(d3MapProjection);
        return this;
    }
    
    map.path = function() {
	return d3MapPath;
    }
    
    map.refresh = function() {
	mapHeight = parseFloat(mapSVG.node().parentNode.clientHeight || mapSVG.node().parentNode.parentNode.clientHeight);
	mapWidth = parseFloat(mapSVG.node().parentNode.clientWidth || mapSVG.node().parentNode.parentNode.clientWidth);
	d3MapTile.size([mapWidth, mapHeight]);
        canvasCanvas.attr("height", mapHeight).attr("width", mapWidth).style("height",mapHeight + "px").style("width", mapWidth + "px")
        d3MapCanvasImage.attr("height", mapHeight).attr("width", mapWidth).style("height",mapHeight + "px").style("width", mapWidth + "px")
	rebuildAttributes();
        d3MapZoomInitialize();
        d3MapZoomed();
        d3MapZoomComplete();
	return this;
    }
    
    map.setScale = function(newScale) {
        if (!arguments.length) return d3MapZoom.scale();
	
	newScale += 9;

	var s = (1 << newScale) / d3MapZoom.scale();
	var newZoom = d3MapZoom.scale() * s;
        var newX = ((d3MapZoom.translate()[0] - (mapWidth / 2)) * s) + mapWidth / 2;
        var newY = ((d3MapZoom.translate()[1] - (mapHeight / 2)) * s) + mapHeight / 2;    

        mapSVG.call(d3MapZoom.translate([newX,newY]).scale(newZoom).event);
	return this;

    }
    
    map.clusteringTolerance = function(newScale) {
        if (!arguments.length) return quadClusterScale;
	quadClusterScale = newScale
	return this;

    }
    
    map.mode = function(newMode) {
	if (!arguments.length) return d3MapMode;
	if (newMode == "projection") {
	        d3MapProjection = d3.geo.conicEquidistant()
	        .scale(350)
	        .translate([350,600]);
	    d3MapPath
		.projection(d3MapProjection);
		
	    d3MapZoom
		.scale(d3MapProjection.scale())
//		.scaleExtent([1, 15052461])
		.translate(d3MapProjection.translate());
		
	    d3MapZoomed = d3MapZoomedProjection;
	    d3MapZoomInitialize = d3MapZoomInitializeProjection;
	    d3MapZoomComplete = d3MapZoomCompleteProjection;
	    renderCanvas = renderCanvasProjected;
	    renderTiles = renderTilesProjected;
	    //Adjust g and so on
	    mapSVG.selectAll("g.features,g.points").attr("transform", "translate(0,0) scale(1)")
	    
	    tileSVG.style("display", "none");
	    reprojectDiv.style("display", "block")
	    //rescale stroke-width and size
	}
	else if (newMode == "globe") {
	    d3MapProjection = d3.geo.orthographic()
		.center([0, 15])
		.scale(200)
		.translate([mapWidth/2, mapHeight/2])
		.rotate([0,0,0])
		.clipAngle(90);
    
	    d3MapPath
		.projection(d3MapProjection);
		
	    d3MapZoom
		.scale(d3MapProjection.scale())
//		.scaleExtent([1, 15052461])
		.translate(d3MapProjection.translate());
		
	    d3MapZoomed = d3MapZoomedRotate;
	    d3MapZoomInitialize = d3MapZoomInitializeProjection;
	    d3MapZoomComplete = d3MapZoomCompleteProjection;
	    renderCanvas = renderCanvasProjected;
	    renderTiles = renderTilesProjected;
	    //Adjust g and so on
	    mapSVG.selectAll("g.features,g.points").attr("transform", "translate(0,0) scale(1)")
	    
	    tileSVG.style("display", "none");
	    reprojectDiv.style("display", "block")
	    //rescale stroke-width and size
	}
	else if (newMode == "transform") {
	    d3MapZoomed = d3MapZoomedTransform;
	    d3MapZoomInitialize = d3MapZoomInitializeTransform;
	    d3MapZoomComplete = d3MapZoomCompleteTransform;
	    renderCanvas = renderCanvasTransform;
	    renderTiles = renderTilesTransform;
	    
	    d3MapProjection = d3.geo.mercator()
		.scale((1 << 13) / 2 / Math.PI)
		.scale(4096)
		.translate([5, 5]);

	    d3MapPath
		.projection(d3MapProjection);

	    var c = d3MapProjection(mapCenter);
    
	    d3MapZoom
		.scale(d3MapProjection.scale() * 2 * Math.PI)
//		.scaleExtent([700, 15052461])
		.translate([mapWidth - c[0], mapHeight - c[1]]);
    
	    d3MapProjection
		.scale(1 / 2 / Math.PI)
		.translate([0, 0]);

	    mapSVG.selectAll("g.features,g.points").attr("transform", "translate(" + d3MapZoom.translate() +") scale(" + d3MapZoom.scale() +")")

	    mapSVG.selectAll("g.features").selectAll("path").attr("d", d3MapPath);
	    mapSVG.selectAll("g.points").selectAll("g.pointG").attr("transform", function(d) {return "translate(" + d3MapProjection([d._d3Map.x,d._d3Map.y]) + ")"});

	    tileSVG.style("display", "block");
	    reprojectDiv.style("display", "none")
	}
	else {
	    return false;
	}
	d3MapZoom
	    .on("zoom", d3MapZoomed)
	    .on("zoomstart", d3MapZoomInitialize)
	    .on("zoomend", d3MapZoomComplete)
	    
	d3MapMode = newMode;
	map.refresh();
	return this;

    }
    
    map.layers = function() {
	return d3MapAllLayers;
    }
    
    map.zoomable = function(_on) {
	if(_on) {
	d3.select(mapSVG.node().parentNode).call(d3MapZoom);
	}
	else{
	var disabledZoom = d3.behavior.zoom().on("zoom", null).on("zoomstart", null).on("zoomend", null);
	d3.select(mapSVG.node().parentNode).call(disabledZoom);

	}
	    return this;
    }
    
    map.div = function() {
	return mapDiv;
    }
    
    map.pushLayers = function(otherMap, miniMap, forceCanvas, otherType) {
	tandemMapArray.push({map: otherMap, mini: miniMap, forceCanvas: forceCanvas, type: otherType});
	return this;
    }

    map.deleteCartoLayer = function(layer) {
        var layerArray = [d3MapTileLayer,d3MapSVGPointsLayer,d3MapRasterPointsLayer,d3MapSVGFeatureLayer,d3MapRasterFeatureLayer];
	
	for (var x in layerArray) {
	    for (var y in layerArray[x]) {
		if (layer == layerArray[x][y]) {
		    if(layerArray[x][y].g()) {
			layerArray[x][y].g().remove()
		    }
		    layerArray[x].splice(y,1);
		}
	    }
	}
	
	for (var x in d3MapAllLayers) {
	    if (d3MapAllLayers[x] == layer) {
		d3MapAllLayers.splice(x,1);
	    }
	}
	layer = undefined;
	updateLayers();
	return this;
    
    }
    
    map.createHexbinLayer = function(cartoLayer, degreeResolution) {

	  var hexbin = d3.hexbin()
            .size([1000, 1000])
            .radius(degreeResolution)
            .x(function(d) {return cartoLayer.x()(d)})
            .y(function(d) {return cartoLayer.y()(d)});
    	    
	    var hexdata = hexbin(cartoLayer.features());
	    var hexGeodata = [];
	    var thisHexagon = hexbin.hexagonArray()
	    for (var x in hexdata) {
		var localHexagon = [];
		var origx = hexdata[x].x;
		var origy = hexdata[x].y;
		for (var z in thisHexagon) {
		    localHexagon.push([thisHexagon[z][0] + origx,thisHexagon[z][1] + origy])
		}
		    localHexagon.push([localHexagon[1][0], localHexagon[1][1]])
		    localHexagon.splice(0,1)

		var hexFeature = {type: "Feature", properties: {node: hexdata[x]}, geometry: {"type": "Polygon", coordinates: [localHexagon.reverse()]}};

		hexGeodata.push(hexFeature);
	    }
	    
	    cartoLayer = Layer()
	    .type("featurearray")
	    .features(hexGeodata)
	    .label("Hexbin")
	    .cssClass("hexbin")
	    .renderMode("svg")
	    .on("newmodal", function() {d3MapSetModal(cartoLayer)});

	    return cartoLayer;

    }
    
    map.createVoronoiLayer = function(cartoLayer, margin) {
	
	var xExtent = d3.extent(cartoLayer.features(), function(d) {return parseFloat(cartoLayer.x()(d))});
	var yExtent = d3.extent(cartoLayer.features(), function(d) {return parseFloat(cartoLayer.y()(d))});

	  var voronoi = d3.geom.voronoi()
	    .clipExtent([[xExtent[0] - margin,yExtent[0] - margin],[xExtent[1] + margin,yExtent[1] + margin]])
            .x(function(d) {return cartoLayer.x()(d)})
            .y(function(d) {return cartoLayer.y()(d)});
    	    
	    var vorData = voronoi(cartoLayer.features());
	    var vorGeodata = []

	    for (var x in vorData) {
		var thisVor = vorData[x];

		    thisVor.push(vorData[x][0])

		var vorFeature = {type: "Feature", properties: {node: cartoLayer.features()[x]}, geometry: {"type": "Polygon", coordinates: [thisVor]}};

		vorGeodata.push(vorFeature);
	    }
	    
	    cartoLayer = Layer()
	    .type("featurearray")
	    .features(vorGeodata)
	    .label("Voronoi")
	    .cssClass("voronoi")
	    .renderMode("svg")
	    .on("newmodal", function() {d3MapSetModal(cartoLayer)});

	    return cartoLayer;

    }

        map.createHullLayer = function(cartoLayer, cartoAttribute) {

	var xExtent = d3.extent(cartoLayer.features(), function(d) {return parseFloat(cartoLayer.x()(d))});
	var yExtent = d3.extent(cartoLayer.features(), function(d) {return parseFloat(cartoLayer.y()(d))});
	var features = cartoLayer.features();

	var hull = d3.geom.hull()
            .x(function(d) {return cartoLayer.x()(d)})
            .y(function(d) {return cartoLayer.y()(d)});

	var attributeKeys = d3.set(features.map(cartoAttribute)).values();
	    var hullGeodata = [];
	
	for (var x in attributeKeys) {
	    var hullData = hull(features.filter(function(d) {return cartoAttribute(d) == attributeKeys[x]}));
	    if(hullData.length > 0) {

	    var hullCoords = hullData.map(function(d) {return [cartoLayer.x()(d),cartoLayer.y()(d)]});
	    hullCoords.push(hullCoords[0]);

	    var hullFeature = {type: "Feature", properties: {node: attributeKeys[x]}, geometry: {"type": "Polygon", coordinates: [hullCoords]}};

	    hullGeodata.push(hullFeature);
	    }
	}
	    cartoLayer = Layer()
	    .type("featurearray")
	    .features(hullGeodata)
	    .label("Hull")
	    .cssClass("hull")
	    .renderMode("svg")
	    .on("newmodal", function() {d3MapSetModal(cartoLayer)});

	    return cartoLayer;

    }

    map.continuousCartogram = function(cartoLayer, cartoAttribute) {

    var features = cartoLayer.features();
        var cartogram = d3.cartogram()
        .projection(d3MapProjection)
	.iterations(16)
        .value(function(p,q) {return Math.max(.001,parseFloat(cartoAttribute(features[q])))});
	var specObj = cartoLayer.specificFeature();

    var carto = cartogram(cartoLayer.dataset(), cartoLayer.dataset().objects[specObj].geometries);

      var geoPath = d3.geo.path()
        .projection(null);

    cartoLayer.g().selectAll("path")
    .transition()
    .duration(1000)
   .attr("d", function(d,i) {return geoPath(carto.features[i])});

    }
    
    map.newFeature = function(cartoLayer, featureType) {
	var addedPoints = [];
	var featureCoords = [];
	var addedFeatures = [];
	mapSVG.append("g").attr("id", "newFeatureG").append("rect").attr("height", mapHeight).attr("width", mapWidth).attr("opacity", .1).on("click", addPoint);
	
	function addPoint() {
	    var p = d3.mouse(this);
	    
	    addedPoints.push({id: "New Point " + addedPoints.length, "x": xyToCoordinates(p)[0], "y": xyToCoordinates(p)[1]});
	    featureCoords.push(xyToCoordinates(p))
	    
	    if (newPointsLayer) {
		map.deleteCartoLayer(newPointsLayer);
	    }
	    if (newFeaturesLayer) {
		map.deleteCartoLayer(newFeaturesLayer);
	    }
	    newPointsLayer = Layer()
	    .type("xyarray")
	    .features(addedPoints)
	    .label("New Points")
	    .cssClass("newpoints")
	    .renderMode("svg")
	    .markerSize(5)
	    .x("x")
	    .y("y")
	    .clickableFeatures(true)
	    .on("newmodal", function() {d3MapSetModal(newPointsLayer)})

	    var polyCoords = d3.merge([featureCoords,[featureCoords[0]]]);

	    function sumOverEdges() {
		var edgeSum = 0;
		for (var x in polyCoords) {
		    if (x < polyCoords.length - 1) {
			edgeSum += (polyCoords[x][0] + polyCoords[parseInt(x)+1][0]) * (polyCoords[x][1] + polyCoords[parseInt(x)+1][1])
		    }
		}
		if (edgeSum < 0) {
		    return false;
		}
		else {
		    return true;
		}
 	    }


	    if (addedFeatures.length > 0 || addedPoints.length > 1) {

	    if (sumOverEdges()) {
		polyCoords = polyCoords.reverse();
	    }

	    var tempFeature = [{type: "Feature", geometry: {type: "Polygon", coordinates: [polyCoords]}}]
            var tempFeatures = d3.merge([addedFeatures, tempFeature]);

	    newFeaturesLayer = Layer()
	    .type("featurearray")
	    .features(tempFeatures)
	    .label("New Features")
	    .cssClass("newfeatures")
	    .renderMode("svg")
	    .clickableFeatures(true)
	    .on("newmodal", function() {d3MapSetModal(newFeaturesLayer)})
	    .on("load", function() {newFeaturesLayer.g().selectAll("path").on("click", addNewFeature)})
	    map.addCartoLayer(newFeaturesLayer);
	    }

	    
	    map.addCartoLayer(newPointsLayer)

	    function addNewFeature() {
		var newF = newFeaturesLayer.features()[0];
		var oldF = cartoLayer.features();
		oldF.push(newF);

	    cartoLayer
	    .features(oldF);
	    
	    updateLayer(cartoLayer);

	    mapSVG.select("#newFeatureG").remove();
		map.deleteCartoLayer(newPointsLayer);
		map.deleteCartoLayer(newFeaturesLayer);

	    }



	}
    }

    map.showHideLayer = function(cartoLayer) {
	showHideLayer(cartoLayer, 0,mapDiv.select("li#" + cartoLayer.object().id).node());
    }
    
    map.refreshCartoLayer = function(cartoLayer) {
	updateLayer(cartoLayer);
    }
    
    map.svgFeatureLayer = function() {
	return d3MapSVGFeatureLayer;
    }

    map.rasterFeatureLayer = function() {
	return d3MapRasterFeatureLayer;
    }

    return map;
}
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./layer":3,"./modal":6}],5:[function(_dereq_,module,exports){
(function (global){
"use strict";

var d3 = (typeof window !== "undefined" ? window.d3 : typeof global !== "undefined" ? global.d3 : null),
    Map = _dereq_("./map"),
    Layer = _dereq_("./layer");

var minimap = module.exports = function() {
    
    var d3Minimap,
	d3MiniDiv,
	d3TandemMap;
    
    
    function d3CartoMiniMap(selectedDiv) {
	var newD3Minimap = d3.carto.map();
	d3MiniDiv = selectedDiv;
	d3MiniDiv.call(newD3Minimap);
	
	d3Minimap = newD3Minimap;
	
	newD3Minimap
	.zoomable(false)
	.setScale(2)
	.refresh();
	
	d3MiniDiv.select("#d3MapSVG").append("rect")
	.attr("height", 20)
	.attr("width", 50)
	.attr("x", 20)
	.attr("y", 20)
	.attr("class", "minimap-extent")

	d3CartoMiniMap.hideControls(true);
    }

    d3CartoMiniMap.map = function(newMap) {
	if (!arguments.length) return d3Minimap;
	d3Minimap = newMap;
	return this;

    }
    
    d3CartoMiniMap.tandem = function(cartoMap) {
	cartoMap.pushLayers(d3Minimap, d3CartoMiniMap, true, "minimap");
	d3TandemMap = cartoMap;
	return this;
    }

    d3CartoMiniMap.duplicate = function(cartoMap) {
	var incLayers = cartoMap.layers();
	for (var x in incLayers) {
	    var cartoLayer = incLayers[x]
	    switch(cartoLayer.type()) {
		case "tile":
		d3Minimap.addTileLayer(cartoLayer.path(),cartoLayer.label(),cartoLayer.tileType(),!cartoLayer.visibility(),cartoLayer)
		break;
	    case "csv":
		d3Minimap.addXYLayer(cartoLayer.features(), cartoLayer.label(), cartoLayer.cssClass(), cartoLayer.markerSize(), "canvas", cartoLayer.x(), cartoLayer.y(), "drawAlways",cartoLayer)
		break;
	    case "topojson":
		d3Minimap.addFeatureLayer(cartoLayer.features(), cartoLayer.label(), cartoLayer.cssClass(),"canvas", "drawAlways",cartoLayer)
		break;
	    case "geojson":
		d3Minimap.addFeatureLayer(cartoLayer.features(), cartoLayer.label(), cartoLayer.cssClass(),"canvas", "drawAlways",cartoLayer)
		break;
	    case "xyarray":
		d3Minimap.addXYLayer(cartoLayer.features(), cartoLayer.label(), cartoLayer.cssClass(), "canvas", cartoLayer.renderMode(), cartoLayer.x(), cartoLayer.y(), "drawAlways",cartoLayer)
		break;
	    case "featurearray":
		d3Minimap.addFeatureLayer(cartoLayer.features(), cartoLayer.label(), cartoLayer.cssClass(),"canvas", "drawAlways",cartoLayer)
		break;
	    default:
		break;
	    }
	}
	d3Minimap.refresh();
	return this;
    }
    
    d3CartoMiniMap.hideControls = function(hide) {
	if (hide) {
	    d3Minimap.div().select("#d3MapLayerBox").style("display", "none");
	    d3Minimap.div().select("#d3MapZoomBox").style("display", "none");
	}
	else {
	    d3Minimap.div().select("#d3MapLayerBox").style("display", "none");
	    d3Minimap.div().select("#d3MapZoomBox").style("display", "none");	    
	}
	return this;
    }
    
    d3CartoMiniMap.updateBoundingBox = function(bounds) {
	
	var b1 = d3Minimap.projection()(bounds[0]);
	var b2 = d3Minimap.projection()(bounds[1]);
	var s = d3Minimap.zoom().scale();
	var t = d3Minimap.zoom().translate();

	var x = (b1[0] * s) + t[0];
	var y = (b1[1] * s) + t[1];
	var x2 = (b2[0] * s) + t[0];
	var y2 = (b2[1] * s) + t[1];
	var w = x2 - x;
	var h = y2 - y;

	d3MiniDiv.select("rect.minimap-extent")
	.attr("x", x)
	.attr("y", y)
	.attr("width", w)
	.attr("height", h);

	return this;
    }
    
    return d3CartoMiniMap;
}
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./layer":3,"./map":4}],6:[function(_dereq_,module,exports){
(function (global){
"use strict";

var d3 = (typeof window !== "undefined" ? window.d3 : typeof global !== "undefined" ? global.d3 : null),
    Map = _dereq_("./map"),
    Layer = _dereq_("./layer");

var Modal = module.exports = function() {
        var d3Modal = d3.select(),
	d3ModalContent,
        d3ModalParentDiv,
        d3ModalParentG,
        d3ModalCurrentElement,
        createModalContent,
        d3ModalType
        ;

    function d3CartoModal(incomingD) {
        d3ModalCurrentElement = this;
        d3ModalParentDiv.selectAll("div.d3MapModal").remove();

        d3Modal = d3ModalParentDiv.append("div")
        .attr("class", "d3MapModal");

        d3Modal
        .append("div")
        .attr("class", "d3MapModalContent")
        .html(createModalContent(incomingD));

        d3Modal
        .append("div")
        .attr("class", "d3MapModalArrow");

        d3CartoModal.repositionModal();
    }
    
    d3CartoModal.parentDiv = function(newParent) {
	if (!arguments.length) return d3ModalParentDiv;
	d3ModalParentDiv = newParent;
	return this;
    }

    d3CartoModal.parentG = function(newParent) {
	if (!arguments.length) return d3ModalParentG;
	d3ModalParentG = newParent;
	return this;
    }
    
    d3CartoModal.type = function(newType) {
	if (!arguments.length) return d3ModalType;
	d3ModalType = newType;
	return this;
    }
    
    d3CartoModal.repositionModal = function() {
    if (d3Modal.size() == 0) {
        return false}
        
            var modalHeight = parseFloat(d3Modal.node().clientHeight || d3Modal.node().parentNode.clientHeight);
            var modalWidth = parseFloat(d3Modal.node().clientWidth || d3Modal.node().parentNode.clientWidth);
        if (d3ModalType == "Point") {
            var tP = d3.transform(d3.select(d3ModalCurrentElement).attr("transform"));
            var tG = d3.transform(d3ModalParentG.attr("transform"));
            var newLeft = (tP.translate[0] * tG.scale[0]) + tG.translate[0] - (modalWidth / 2);
            var newTop = (tP.translate[1] * tG.scale[1]) + tG.translate[1] - modalHeight - 20;
        }
        else {
            var _m = d3.mouse(d3ModalParentDiv.node())
            var newLeft = _m[0] - (modalWidth / 2);
            var newTop = _m[1] - modalHeight - 20
        }
        
        d3.select("div.d3MapModal")
        .style("left", newLeft + "px")
        .style("top", newTop + "px");
        
        d3.select("div.d3MapModalArrow").style("left", ((modalWidth / 2) - 20) + "px")
        return true;
    }

    d3CartoModal.formatter = function(newFormatter) {
	if (!arguments.length) return createModalContent;
	createModalContent = newFormatter;
	return this;
    }
    
    createModalContent = function(d) {
        var mLabel;
        var mContent = d;
        var mOutput = "";
        if (d.properties) {
            mContent = d.properties;
        }
        for (var x in mContent) {
            if (x.toLowerCase() == "label") {
                mLabel = x;
                break;
            }
            if (x.toLowerCase() == "name") {
                mLabel = x;
                break;
            }
        }
        if (mLabel) {
            mOutput += "<h1>" + mContent[mLabel] + "</h2>"
        }
        for (var x in mContent) {
            if (x.toLowerCase != mLabel && x != "_d3Map") {
                mOutput += "<p>" + x.toUpperCase() + ": " + mContent[x] +"</p>";
            }
        }
        return mOutput;

    }
    
    return d3CartoModal;
}
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./layer":3,"./map":4}]},{},[2])
(2)
});