"use strict";

var d3 = require("d3"),
    Layer = require("./layer"),
    Modal = require("./modal");

var Map = module.exports = function() {
    var mapSVG;
    var reprojectDiv;
    var tileSVG;
    var mapDiv;
    var canvasCanvas;
    var layerBox;
    var zoomBox;
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
    
    var d3MapTile = d3.geo.tile()
    .size([10, 10]);

    var d3MapProjection;

    var d3MapPath = d3.geo.path();
    
    var d3MapZoom = d3.behavior.zoom();
    
    var tandemMapArray = [];
    
    var tileTypes = {
	stamen: {flatPath: "tile.stamen.com", flatType: "jpg", reprojectPathPrefix: "http://{subdomain}.tile.stamen.com/", reprojectPathSuffix: "/{z}/{x}/{y}.jpg"},
	mapbox: {flatPath: "tiles.mapbox.com/v3", flatType: "png", reprojectPathPrefix: "http://{subdomain}.tiles.mapbox.com/v3/", reprojectPathSuffix: "/{z}/{x}/{y}.png"}
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

    zoomBox = selectedDiv.insert("div", "svg").attr("id", "d3MapZoomBox");
    
    zoomBox.selectAll("button.zoomcontrol").data(["in", "out"]).enter().append("button").attr("class", "zoomcontrol")
    .on("click", manualZoom).html(function(d) {return d=="in" ? "+" : "-"});
    
    var panSymbols = {"up": "&#8593;","down": "&#8595;","left": "&#8592;","right": "&#8594;"}
    zoomBox.selectAll("button.pancontrol").data(["up","down","left", "right"]).enter().append("button").attr("class", "pancontrol")
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
	d3MapProjection.clipExtent([[0,0],[mapWidth,mapHeight]]);
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
	rotateOrigin = d3MapProjection.rotate();
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
	    context.strokeStyle = _data[x]._d3Map.stroke;
	    context.fillStyle = d3MapRasterFeatureLayer[i].markerColor()(_data[x]);
	    context.lineWidth = _data[x]._d3Map.strokeWidth;
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
	var r = d3MapProjection.rotate();
	var a = [-r[0], -r[1]];

        for (var y in _data) {

        var projectedPoint = d3MapProjection([_layerX(_data[y]),_layerY(_data[y])]) 
        var projX = projectedPoint[0];
        var projY = projectedPoint[1];

	if (d3.geo.distance([_layerX(_data[y]),_layerY(_data[y])],a) < 1.7) {
	
        context.beginPath();
        context.arc(projX,projY,d3MapRasterPointsLayer[i].markerSize()(_data[y]),0,2*Math.PI);
        context.fillStyle = d3MapRasterPointsLayer[i].markerColor()(_data[y]);
        context.strokeStyle = _data[y]._d3Map.stroke;
        context.lineWidth = parseFloat(_data[y]._d3Map.strokeWidth);
        context.stroke();
        context.fill();
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
        if (d3MapSVGPointsLayer[x].object().renderFrequency == "drawAlways" && d3MapSVGPointsLayer[x].visibility() && d3MapSVGPointsLayer[x].renderMode() == "svg") {
            renderSVGPointsProjected(x);
        }
	if (d3MapSVGPointsLayer[x].object().cluster && updateClustering) {
	    quadtreeModePoints(d3MapSVGPointsLayer[x], degreeDistance());
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

     
    //Transform Zoom
    function d3MapZoomedTransform() {
	mapDiv.selectAll("div.d3MapModal").remove();
	var updateClustering = false;
	renderTiles();
    
	if (Math.abs(degreeDistance() - workingDistance) > .5) {
	    workingDistance = degreeDistance();
	    updateClustering = true;
	}
	    
      ///POINTS
      for (var x in d3MapSVGPointsLayer) {
        if (d3MapSVGPointsLayer[x].object().renderFrequency == "drawAlways" && d3MapSVGPointsLayer[x].visibility() && !d3MapSVGPointsLayer[x].object().cluster && d3MapSVGPointsLayer[x].renderMode() == "svg") {
            renderSVGPoints(x);
        }
    	if (d3MapSVGPointsLayer[x].object().cluster && updateClustering) {
	    quadtreeModePoints(d3MapSVGPointsLayer[x], degreeDistance());
	}

    }
    // FEATURES
        for (var x in d3MapSVGFeatureLayer) {
            if (d3MapSVGFeatureLayer[x].object().renderFrequency == "drawAlways"  && d3MapSVGFeatureLayer[x].visibility() ) {
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
        //TO DO: Split out the rendering into separate functions and call those with renderVector("always") or renderVector("once") and the like
        for (var x in d3MapSVGPointsLayer) {
        if (d3MapSVGPointsLayer[x].object().renderFrequency == "drawEnd" || !d3MapSVGPointsLayer[x].visibility() || d3MapSVGPointsLayer[x].object().cluster) {
            d3MapSVGPointsLayer[x].g().style("display", "none");
        }
	else if (!d3MapSVGPointsLayer[x].object().cluster) {
            d3MapSVGPointsLayer[x].g().style("display", "block");	    
	}
        }
        
        for (var x in d3MapSVGFeatureLayer) {
            if (d3MapSVGFeatureLayer[x].object().renderFrequency == "drawEnd" || !d3MapSVGFeatureLayer[x].visibility() ) {
            d3MapSVGFeatureLayer[x].g().style("display", "none");
            }
        }
    
    renderCanvas("zoom");

    }
    
    
    function d3MapZoomCompleteTransform() {

    renderTiles();
    renderCanvas("zoomcomplete")
        
        for (var x in d3MapSVGPointsLayer) {
            if ((d3MapSVGPointsLayer[x].object().renderFrequency == "drawEnd" || d3MapSVGPointsLayer[x].object().renderFrequency == "drawAlways")  && d3MapSVGPointsLayer[x].visibility() && !d3MapSVGPointsLayer[x].object().cluster) {
            d3MapSVGPointsLayer[x].g().style("display", "block");
            renderSVGPoints(x);
            }
        }

        for (var x in d3MapSVGFeatureLayer) {
            if ((d3MapSVGFeatureLayer[x].object().renderFrequency == "drawEnd" || d3MapSVGFeatureLayer[x].object().renderFrequency == "drawAlways")  && d3MapSVGFeatureLayer[x].visibility() ) {
            d3MapSVGFeatureLayer[x].g().style("display", "block");
            renderSVGFeatures(x);
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
	    context.strokeStyle = _data[x]._d3Map.stroke;
	    context.fillStyle = d3MapRasterFeatureLayer[i].markerColor()(_data[x]);
	    context.lineWidth = _data[x]._d3Map.strokeWidth;
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
        context.strokeStyle = _data[y]._d3Map.stroke;
        context.lineWidth = parseFloat(_data[y]._d3Map.strokeWidth);
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
	var z = d3MapProjection.clipAngle();
	var a = [-r[0], -r[1]];
	
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
	if (!cartoLayer) {
	    cartoLayer = Layer()
	    .type("featurearray")
	    .features(featureData)
	    .label(featureLayerName)
	    .cssClass(featureLayerClass)
	    .features(featureData)
	    .renderType(renderType)
	    .markerColor(marker.markerFill);
	}

	for (var x in featureData) {
                      featureData[x]._d3Map = {};
                      featureData[x]._d3Map.color = marker.markerFill;
		      //Override Fill for lines?
		      if (featureData[x].geometry.type == "LineString") {
                          featureData[x]._d3Map.color = "none";
		      }
                      featureData[x]._d3Map.stroke = marker.markerStroke;
                      featureData[x]._d3Map.opacity = marker.markerOpacity;
                      featureData[x]._d3Map.strokeWidth = marker.markerStrokeWidth;
	      }
	      
	      cartoLayer.features(featureData);

		    if (renderType == "canvas") {
			var layerObj = {id: "rf" + d3MapRasterFeatureLayer.length, drawOrder: d3MapRasterFeatureLayer.length, path: "", visible: true, name: featureLayerName, active: true, renderFrequency: "drawAlways"}
			d3MapRasterFeatureLayer.push(cartoLayer);
		    }

		    else {
                    var layerG = mapSVG.insert("g", ".points").attr("class", "features").attr("id", "sf" + d3MapSVGFeatureLayer.length);
                    var layerObj = {id: "sf" + d3MapSVGFeatureLayer.length, drawOrder: d3MapSVGFeatureLayer.length, path: "", visible: true, name: featureLayerName, active: true, renderFrequency: "drawAlways"}
                    d3MapSVGFeatureLayer.push(cartoLayer)
                    layerG.attr("transform", "translate(" + d3MapZoom.translate() + ")scale(" + d3MapZoom.scale() + ")");
		    cartoLayer.g(layerG);
  
                  var appendedFeatures = layerG.selectAll("g")
                  .data(featureData)
                  .enter()
                  .append("g")
                  .attr("class", featureLayerClass);
		  
		  appendedFeatures
		  .append("path")
                  .attr("class", featureLayerClass)
                  .attr("d", d3MapPath)
		  
	    if (cartoLayer.clickableFeatures()) {
	        if (!cartoLayer.modal()) {
		    var cartoModal = Modal().parentDiv(mapDiv).parentG(layerG);
		    cartoLayer.modal(cartoModal);	
	        }
	        else {
		    cartoLayer.modal().parentDiv(mapDiv).parentG(layerG)
		}
		   appendedFeatures
		    .style("cursor", "pointer")
		    .on("click", cartoLayer.modal())
		  }
		  else {
		    appendedFeatures
		    .style("pointer-events", "none");
		  }

		    }
		    
		    d3MapAllLayers.push(cartoLayer)
		    cartoLayer.object(layerObj);
	    updateLayers();
            d3MapZoomed();
            d3MapZoomComplete();
	    
	}

    function processXYFeatures(points, newCSVLayerName, newCSVLayerClass, markerSize, renderType, xcoord, ycoord, renderFrequency,cartoLayer) {
    	var rFreq = renderFrequency || "mixed";
        var cName = newCSVLayerName || "CSV " + d3Layer.length
        var cID = "cps" + d3MapSVGPointsLayer.length;
        var ccID = "cpc" + d3MapRasterPointsLayer.length;
	
	var qtree = d3.geom.quadtree();
	
	qtree.x(function(d) {return d[xcoord]}).y(function(d) {return d[ycoord]});
	
	var xyQuad = qtree(points);
	
	xyQuad.visit(function(node, x1,y1,x2,y2) {
	    if (!node.leaf) {
		node._d3Map = {};
		node._d3Map[xcoord] = (x1 + x2) / 2
		node._d3Map[ycoord] = (y1 + y2) / 2
		node._d3Map["qsize"] = (x2 - x1) / 2
		node[xcoord] = (x1 + x2) / 2
		node[ycoord] = (y1 + y2) / 2
		
	    }
	})

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
	    .cluster(false)
	}

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

	  cartoLayer.features(points);
        if (renderType == "svg" || renderType == "mixed") {
        var pointsG = mapSVG.append("g").attr("class", "points").attr("id", cID);
        d3MapSVGPointsG.push(pointsG);
	cartoLayer.g(pointsG);
	pointsG.attr("transform", "translate(" + d3MapZoom.translate() + ")scale(" + d3MapZoom.scale() + ")");
  
  var appendedPointsEnter = pointsG.selectAll("g.blank")
  .data(points)
  .enter()
  .append("g")
  .attr("id", function(d,i) {return newCSVLayerClass + "_g_" + i})
  .attr("class", newCSVLayerClass + " pointG")
  .attr("transform", function(d) {return "translate(" + d3MapProjection([cartoLayer.x()(d),cartoLayer.y()(d)]) + ")"})
  .each(function(d) {
    d._d3Map.originalTranslate = "translate(" + d3MapProjection([cartoLayer.x()(d),cartoLayer.y()(d)]) + ")";
  })
  .append("g")
  .attr("class", "marker")
  .attr("transform", "scale(" + d3MapProjection.scale() + ")");
  
  appendedPointsEnter
  .append("circle")
  .attr("class", newCSVLayerClass)
  .attr("r", function(d) {return cartoLayer.markerSize()(d)});
  
  if (cartoLayer.clickableFeatures()) {
    if (!cartoLayer.modal()) {
        var cartoModal = Modal().parentDiv(mapDiv).parentG(pointsG);
	cartoLayer.modal(cartoModal);	
    }
    else {
	cartoLayer.modal().parentDiv(mapDiv).parentG(pointsG)
    }
   appendedPointsEnter
    .style("cursor", "pointer")
    .on("click", cartoLayer.modal())
  }
  else {
    appendedPointsEnter
    .style("pointer-events", "none");
  }

        }

	if (pointsObj.cluster) {
	    workingDistance = 1000;
	}

	    d3MapAllLayers.push(cartoLayer)
	    cartoLayer.object(pointsObj);
            d3MapZoomed();        
	    updateLayers();
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
	    .object(tObj);
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
	    .cluster(false)
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
	    .markerColor(marker.markerFill);
	}
	cartoLayer.dataset(topoData);

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
	    .markerColor(marker.markerFill);	    
	}

        d3.json(newGeoLayer, function(error, geoData) {
	    processFeatures(geoData.features, newGeoLayerName, newGeoLayerClass, renderType, renderFrequency,cartoLayer);
        })
	}

	
    function quadtreeModePoints(layer, resolution) {
	    var clusterD = 3;
	if (map.mode() == "globe") {
	    clusterD = 100;
	}
	if (map.mode() == "projection") {
	    clusterD = 0;
	}
	if (layer.object().qtreeLayer) {
	    map.deleteCartoLayer(layer.object().qtreeLayer);
	}
	
	var quadtree = layer.object().qtree
	var quadSites = [];
	traverse(quadtree);
	
	function traverse(node) {
	    for (var x in node.nodes) {
		if (node.nodes[x].leaf) {
		    quadSites.push(node.nodes[x])
		}
		else if (node.nodes[x]._d3Map.qsize * resolution < clusterD) {
		    quadSites.push(node.nodes[x])
		}
		else {
		    traverse(node.nodes[x])
		}
	    }
	}

    var qtreeLayer = d3.carto.layer.xyArray();
    qtreeLayer
    .features(quadSites)
    .label("Clustered")
    .cssClass("quad")
    .renderMode("svg")
    .markerSize(3)
    .x("x")
    .y("y")
    .on("load", layer.recluster);

    layer.object().qtreeLayer = qtreeLayer;
    
    map.addCartoLayer(qtreeLayer);

    }
    
    function touchBegin() {
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
       var d = d3.touches(this);
	if (d.length == 2) {
	    d3MapZoomComplete();
	}

    }
    //Exposed Functions
    
    map.aFunction = function (incomingData) {
        if (!arguments.length) return false;
        
        return this;
    }
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
	newProjection.clipExtent([[0,0],[mapWidth,mapHeight]]);
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
	mapHeight = parseFloat(mapSVG.node().clientHeight || mapSVG.node().parentNode.clientHeight);
	mapWidth = parseFloat(mapSVG.node().clientWidth || mapSVG.node().parentNode.clientWidth);
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
    
    map.mode = function(newMode) {
	if (!arguments.length) return d3MapMode;
	if (newMode == "projection") {
	        d3MapProjection = d3.geo.mollweide()
	        .scale(450)
	        .translate([600,600]);
	    d3MapPath
		.projection(d3MapProjection);
		
	    d3MapZoom
		.scale(d3MapProjection.scale())
		.scaleExtent([1, 15052461])
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
		.scaleExtent([1, 15052461])
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
		.scaleExtent([700, 15052461])
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
	    mapSVG.style("pointer-events", "auto");
	}
	else{
	    mapSVG.style("pointer-events", "none");
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
    
    map.showHideLayer = function(cartoLayer) {
	showHideLayer(cartoLayer, 0,mapDiv.select("li#" + cartoLayer.object().id).node());
    }
    
    map.svgFeatureLayer = function() {
	return d3MapSVGFeatureLayer;
    }

        map.rasterFeatureLayer = function() {
	return d3MapRasterFeatureLayer;
    }

    return map;
}