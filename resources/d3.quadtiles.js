(function() {

d3.quadTiles = function(projection, zoom) {
  var tiles = [],
      width = 1 << (zoom = Math.max(0, zoom)),
      step = Math.max(.2, Math.min(1, zoom * .01)),
      invisible,
      precision = projection.precision(),
      stream = projection.precision(960).stream({
        point: function() { invisible = false; },
        lineStart: noop,
        lineEnd: noop,
        polygonStart: noop,
        polygonEnd: noop
      });

  visit(-180, -180, 180, 180);

  projection.precision(precision);

  return tiles;

  function visit(x1, y1, x2, y2) {
    var w = x2 - x1,
        m1 = mercatorφ(y1),
        m2 = mercatorφ(y2),
        δ = step * w;
    invisible = true;
    stream.polygonStart(), stream.lineStart();
    for (var x = x1; x < x2 + δ / 2 && invisible; x += δ) stream.point(x, m1);
    for (var y = m1; (y += δ) < m2 && invisible;) stream.point(x2, y);
    for (var x = x2; x > x1 - δ / 2 && invisible; x -= δ) stream.point(x, m2);
    for (var y = m2; (y -= δ) > m1 && invisible;) stream.point(x1, y);
    if (invisible) stream.point(x1, m1);
    stream.lineEnd(), stream.polygonEnd();
    if (w <= 360 / width) {
      // TODO :)
      if (!invisible) tiles.push({type: "Polygon", coordinates: [
        d3.range(x1, x2 + δ / 2, δ).map(function(x) { return [x, y1]; })
          .concat([[x2, .5 * (y1 + y2)]])
          .concat(d3.range(x2, x1 - δ / 2, -δ).map(function(x) { return [x, y2]; }))
          .concat([[x1, .5 * (y1 + y2)]])
          .concat([[x1, y1]]).map(function(d) { return [d[0], mercatorφ(d[1])]; })
        ], key: [(180 + x1) / 360 * width | 0, (180 + y1) / 360 * width | 0, zoom], centroid: [.5 * (x1 + x2), .5 * (m1 + m2)]});
    } else if (!invisible) {
      var x = .5 * (x1 + x2), y = .5 * (y1 + y2);
      visit(x1, y1, x, y);
      visit(x, y1, x2, y);
      visit(x1, y, x, y2);
      visit(x, y, x2, y2);
    }
  }
}

function noop() {}

function mercatorφ(y) {
  return Math.atan(Math.exp(-y * Math.PI / 180)) * 360 / Math.PI - 90;
}

})();
