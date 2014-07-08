d3-carto-map
======

The purpose of d3.carto is not to obscure D3 but rather the opposite: to make it trivial to make a map with the usual web map functionality so that a developer can focus on integrating into that map the information visualization and data processing that D3 is so well-suited for.

If you want to update the color or icons or other visual elements, the expectation is that you'll do that via selections of existing elements like you would with a hand-crafted D3 map.

Take a look at example.html to see how simple it is.

Existing functionality:

var **newMap** = d3.carto.**map()**;
selection.**call**(newMap);
Create a map and call it by the div where you want it, it will automatically size to fit the div. It will also resize when the window resizes, to deal with dynamically sized divs.

Raster
map.**addTileLayer**(externalID, layerName, tileType, *disabled*)
Add a new raster layer to the map. Currently only supports MapBox ("mapbox" as tileType) rasters. Adds a corresponding layer checkbox to the layer control to show/hide that layer.

Point
map.**addCSVLayer**(filename,layerName,cssClass,renderType,xCoordinateName,yCoordinateName)
Add a new point layer from a CSV file to the map. Adds a corresponding layer checkbox to the layer control to show/hide that layer.

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

map.**centerOn**([x,y],coordinateType,*,transitionDuration*)
Immediately (or transitioned over the number of milleseconds in the optional 'transitionDuration') center the map on the coordinate array passed to it. This does not change the zoom level.

map.**zoomTo**([x,y]*,transitionDuration*)
Immediately (or transitioned over the number of milleseconds in the optional 'transitionDuration') center the map on the coordinate array passed to it. This does not change the zoom level.

Coordinate types are:
* "**latlong**" - Coordinates are in latitude and longitude (as they would be from d3.geo.bounds).
* "**scaled**" - Coordinates are in projected and scaled XY (as they would be from d3.geo.path().bounds).

map.**projection**(*newProjection*)
Set or return the current projection object.

map.**zoom**(*newZoom*)
Set or return the current zoom object.


Existing Issues:
Graphical artifacts when the scale gets so high that stroke divided by scale returns scientific notation for the value.
