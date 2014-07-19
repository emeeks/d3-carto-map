d3-carto-map
======

0.2

The purpose of d3.carto is not to obscure D3 but rather the opposite: to make it trivial to make a map with the usual web map functionality so that a developer can focus on integrating into that map the information visualization and data processing that D3 is so well-suited for.

If you want to update the color or icons or other visual elements, the expectation is that you'll do that via selections of existing elements like you would with a hand-crafted D3 map. This is still rather ill-formed, you can see **[an example here of adding new markers](http://emeeks.github.io/cartomap/change-markers.html)**, but it requires that you use a dummy datum object that d3.carto.map will automatically append with drawing data for the scaled map.

Take a look at example.html to see how simple it is or check out these **[blocks](http://bl.ocks.org/emeeks)**.

Existing functionality:

var **newMap** = d3.carto.**map()**;
selection.**call**(newMap);
Create a map and call it by the div where you want it, it will automatically size to fit the div. It will also resize when the window resizes, to deal with dynamically sized divs.

Carto Layer

map.**addCartoLayer**(d3.carto.layer)
Add a new feature layer from d3.carto.layer (see below). This is probably the best course of action when you consider adding layers as the following functions may experience more significant change or deprecation.

Raster

map.**addTileLayer**(externalID, layerName, tileType, *disabled*)
Add a new raster layer to the map. Currently only supports MapBox ("mapbox" as tileType) rasters. Adds a corresponding layer checkbox to the layer control to show/hide that layer.

Point

map.**addCSVLayer**(filename,layerName,cssClass,renderType,xCoordinateName,yCoordinateName)
Add a new point layer from a CSV file to the map. Adds a corresponding layer checkbox to the layer control to show/hide that layer.

map.**addXYLayer**(filename,layerName,cssClass,renderType,xCoordinateName,yCoordinateName)
Add a new point layer from an array of objects that have latitude and longitude to the map. Adds a corresponding layer checkbox to the layer control to show/hide that layer.

**[addXYLayer used to add labels to polygons](http://emeeks.github.io/cartomap/labels.html)**

Polygon and Polyline

These need to handle point features loaded in featureCollection format. They should also compute neighbors and presimplify for topojson and do preprocessing that would improve geojson performance down the line.

None of these implement mixed rendering yet.

Each adds a corresponding layer checkbox to the layer control to show/hide that layer (not implemented). You can use specificObject to specify the object you want or create a feature layer for each object in the topojson file ("all").

map.**addTopoJSONLayer**(filename,layerName,cssClass,renderType,specificObject)
Add a new feature layer from a topojson file. 

map.**addGeoJSONLayer**(filename,layerName,cssClass,renderType,specificObject)
Add a new feature layer from a geojson file.

map.**addFeatureJSONLayer**(featureArray,layerName,cssClass,renderType,specificObject)
Add a new feature layer from an array of features.

Rendering options are:
* "**svg**" - Points will be added as <g> elements with circles. Both the <g> element and the <circle> will receive the declared CSS class and can be styled as such. Circles can be removed with D3 and replaced with other markers manually.
* "**canvas**" - Points will be drawn with HTML5 Canvas as circles. These circles will be styled according to the circle.cssClass style as declared in your CSS. Canvas markers will not be clickable.
* "**mixed**" - Points will be drawn with HTML5 Canvas during panning and zooming and SVG elements when fixed. This provides the speed of canvas during dynamic moments with the interactivity of SVG during static moments.

**[Multiple Layers Example](http://emeeks.github.io/cartomap/many-layers.html)**

map.**centerOn**([x,y],coordinateType,*,transitionDuration*)
Immediately (or transitioned over the number of milleseconds in the optional 'transitionDuration') center the map on the coordinate array passed to it. This does not change the zoom level.

**[Center On Example](http://emeeks.github.io/cartomap/center-on-point.html)**

map.**zoomTo**(boundingBox,coordinateType,fitPercent,*,transitionDuration*)
Immediately (or transitioned over the number of milleseconds in the optional 'transitionDuration') fit the map window to the bounding box specified in boundingBox, scaled to the fitPercent, with 1 equal to fitting the bounding box to the screen and less than 1 providing a margin and greater than 1 zooming in.

**[Zoom to Example](http://emeeks.github.io/cartomap/zoom-to-bbox.html)**

Coordinate types are:
* "**latlong**" - Coordinates are in latitude and longitude (as they would be from d3.geo.bounds).
* "**scaled**" - Coordinates are in projected and scaled XY (as they would be from d3.geo.path().bounds).

map.**setScale**(newScale)
Uses a non-standard scale from 1 to 10 to determine zoom level with 1 being very zoomed out and 10 being very zoomed in. Will very likely be superseded by a standardized scale.

map.**refresh**()
Updates the map parameters to reflect a new container size and redraws all elements. Also scales newly added elements.

**[New Marker Using Refresh](http://emeeks.github.io/cartomap/change-markers.html)**

map.**projection**(*newProjection*)
Set or return the current projection object.

map.**zoom**(*newZoom*)
Set or return the current zoom object.

map.**mode**(*newMode*)
Switches between rendering modes. The options are:
* "**transform**" Uses transform zoom and is fixed to the mercator projection.
* "**projection**'" Uses projection zoom and can deal with any D3 projection.

**[An example of using projection mode to show data in Mollweide and Conic Equidistant projections](http://emeeks.github.io/cartomap/projected.html)**

d3-carto-layer
======

**d3.carto.layer** allows you to define the attributes of a new map layer that you can add to the map using map.addCartoLayer.

Carto layers fire a "load" event once data has been successfully loaded onto the map, which you can use to execute functions like marker changes that require elements to have actually been added to the canvas: *layer.on("load", nextFunction)*.

**[D3 Carto Layer Example](http://bl.ocks.org/emeeks/37c28b6ff0e01f69b4cd)**

    layer = d3.carto.layer();
    layer = d3.carto.layer.tile();
    layer = d3.carto.layer.csv();
    layer = d3.carto.layer.xyArray();
    layer = d3.carto.layer.geojson();
    layer = d3.carto.layer.topojson();
    layer = d3.carto.layer.featureArray();


layer.**type**(*newType*)
Used to set the type of geodata being added to the map and only necessary for d3.carto.layer().

layer.**path**(*newPath*)
The path to the data for this layer, either a file (geojson, topojson, csv) or tile path (tile). Ignored by d3.carto.layer.featureArray() and d3.carto.layer.xyArray().

layer.**label**(*newLabel*)
The name of the layer as it will appear in the layer selection box.

layer.**cssClass**(*newCSSClass*)
The CSS class of the newly added layer.

layer.**renderMode**(*newRenderMode*)
The render mode ("svg", "canvas", "mixed") of the layer. Ignored by d3.carto.layer.tile().

layer.**markerSize**(*newMarkerSize*)
The marker size of the layer. Ignored by d3.carto.layer.tile(), d3.carto.layer.geojson(), d3.carto.layer.topojson() and d3.carto.layer.featureArray().

layer.**specificFeature**(*newSpecficFeature*)
The specific feature type to be loaded or "all" if all feature types are to be loaded. Ignored by d3.carto.layer.csv(), d3.carto.layer.xyArray(), d3.carto.layer.tile() and d3.carto.layer.featureArray().

layer.**x**(*newX*)
The name of the "x" attribute of a layer. Does not currently support accessor functions (but will). Ignored by d3.carto.layer.tile(), d3.carto.layer.geojson(), d3.carto.layer.topojson() and d3.carto.layer.featureArray().

layer.**y**(*newY*)
The name of the "y" attribute of a layer. Does not currently support accessor functions (but will). Ignored by d3.carto.layer.tile(), d3.carto.layer.geojson(), d3.carto.layer.topojson() and d3.carto.layer.featureArray().

layer.**visibility**(*visibility*)
Initial visibility of a layer. Defaults to true.

layer.**features**(*newFeatures*)
Set or get the data array associated with this layer. Necessary to set for d3.carto.layer.xyArray() and d3.carto.layer.featureArray() and useful to get the data for any created layer. Ignored by d3.carto.layer.tile().

layer.**g**(*newG*)
The g element associated with this layer. Ignored by "canvas" rendered layers and d3.carto.layer.tile(). Useful to use d3.select for features in that layer: thisLayer.g.selectAll("path").

layer.**object**(*newObject*)
The current settings for this layer as a JSON object.


    topojsonLayer = d3.carto.layer();
    topojsonLayer
    .type("topojson")
    .path("./sampledata/glondon.topojson")
    .label("London Wards")
    .cssClass("wards")
    .renderMode("svg")
    .on("load", colorBySize);
    
    map.addCartoLayer(tileLayer).addCartoLayer(topojsonLayer).addCartoLayer(routesLayer);


d3-carto-minimap
======

**d3.carto.minimap** allows you to create and associate a map with an existing d3.carto.map. Typically this would be used as an overview map.

**[D3 Minimap Example](http://bl.ocks.org/emeeks/a726210cbc439b969f02)**


Existing Issues:

Graphical artifacts when the scale gets so high that stroke divided by scale returns scientific notation for the value.

Projected rendering mode doesn't reproject tiles yet, and also doesn't provide controls to adjust rotation or other projection characteristics interactively for the user.

Building
======
[Bower](http://bower.io) is used for front-end packages.
[NPM](http://npmjs.org) is used for automation and testing packages.
[Browserify](http://browserify.org/) is used for source combination.
[Uglify](https://github.com/mishoo/UglifyJS2) is used for minification.

```shell
npm install && bower install
make
```

To rebuild the library every time a source file changes:
 
```shell
make watch
```

Testing
======
[Mocha](http://visionmedia.github.io/mocha), along with
[Casper](https://github.com/nathanboktae/mocha-casperjs) run the
[tests](./tests).

```shell
make test
```

Coding Style
======
[JSHint](https://github.com/jshint/jshint/) helps prevent common coding errors
by enforcing a coding style. It uses [.jsintrc](./.jshintrc) for configuration.

```shell
make lint
```

Releases
======
Coming soon...