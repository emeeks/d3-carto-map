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
    var layerXCoord = function(d) {return d["x"]};
    var layerYCoord = function(d) {return d["y"]};
    var layerG;
    var layerObject;
    var layerFeatures;
    var layerTileType = "mapbox";
    var layerSpecific = "all";
    var layerMarkerSize = function() {return 5};
    var layerMarkerColor;
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
