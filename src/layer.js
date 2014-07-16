"use strict";

var d3 = require('d3');

var Layer = module.exports = function() {
    var layerPath = "";
    var layerType = "";
    var layerVisibility = true;
    var layerActive = true;
    var layerRenderMode = "canvas";
    var layerClass = "default";
    var layerLabel = "unlabeled";
    var layerXCoord = "x";
    var layerYCoord = "y";
    var layerG;
    var layerObject;
    var layerFeatures;
    var layerTileType = "mapbox";
    var layerSpecific = "all";
    layerMarkerSize = 5;
    
    var layerDispatch = d3.dispatch('load');
    
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

    layer.x = function(newX) {
    	if (!arguments.length) return layerXCoord;
	layerXCoord = newX;
	return this;
    }
    
    layer.y = function(newY) {
    	if (!arguments.length) return layerYCoord;
	layerYCoord = newY;
	return this;
    }
    
    layer.markerSize = function(newSize) {
    	if (!arguments.length) return layerMarkerSize;
	layerMarkerSize = newSize;
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
