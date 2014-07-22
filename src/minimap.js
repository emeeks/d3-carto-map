"use strict";

var d3 = require("d3"),
    Map = require("./map"),
    Layer = require("./layer");

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