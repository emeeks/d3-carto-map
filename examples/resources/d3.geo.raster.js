// Copyright 2014, Jason Davies, http://www.jasondavies.com/
(function() {

d3.geo.raster = function(projection) {
  var path = d3.geo.path().projection(projection),
      url = null,
      scaleExtent = [0, Infinity],
      subdomains = ["a", "b", "c", "d"];

  var reprojectDispatch = d3.dispatch('reprojectcomplete');

  var imgCanvas = document.createElement("canvas"),
      imgContext = imgCanvas.getContext("2d");

  function redraw(layer) {
    // TODO improve zoom level computation
    var z = Math.max(scaleExtent[0], Math.min(scaleExtent[1], (Math.log(projection.scale()) / Math.LN2 | 0) - 6)),
        pot = z + 6,
        ds = projection.scale() / (1 << pot),
        t = projection.translate();

    layer.style(prefix + "transform", "translate(" + t.map(pixel) + ")scale(" + ds + ")");

    var tile = layer.selectAll(".tile")
        .data(d3.quadTiles(projection, z), key);
    tile.enter().append("canvas")
        .attr("class", "tile")
        .each(function(d) {
          var canvas = this,
              image = d.image = new Image,
              k = d.key;
          image.crossOrigin = true;
          image.onload = function() { setTimeout(function() { onload(d, canvas, pot); }, 1); };
          image.src = url({x: k[0], y: k[1], z: k[2], subdomain: subdomains[(k[0] * 31 + k[1]) % subdomains.length]});
        })
	.transition()
	.delay(500)
	.each("end", function() {reprojectDispatch.reprojectcomplete()});
    tile.exit().remove();
  }

  redraw.url = function(_) {
    if (!arguments.length) return url;
    url = typeof _ === "string" ? urlTemplate(_) : _;
    return redraw;
  };

  redraw.scaleExtent = function(_) {
    return arguments.length ? (scaleExtent = _, redraw) : scaleExtent;
  };

  redraw.subdomains = function(_) {
    return arguments.length ? (subdomains = _, redraw) : subdomains;
  };

  d3.rebind(redraw, reprojectDispatch, "on");
  return redraw;

  function onload(d, canvas, pot) {
    var t = projection.translate(),
        s = projection.scale(),
        c = projection.clipExtent(),
        image = d.image,
        dx = image.width,
        dy = image.height,
        k = d.key,
        width = 1 << k[2];

    projection.translate([0, 0]).scale(1 << pot).clipExtent(null);

    imgCanvas.width = dx, imgCanvas.height = dy;
    imgContext.drawImage(image, 0, 0, dx, dy);

    var bounds = path.bounds(d),
        x0 = d.x0 = bounds[0][0] | 0,
        y0 = d.y0 = bounds[0][1] | 0,
        x1 = bounds[1][0] + 1 | 0,
        y1 = bounds[1][1] + 1 | 0;

    var Lambda0 = k[0] / width * 360 - 180,
        Lambda1 = (k[0] + 1) / width * 360 - 180,
        Phi0 = k[1] / width * 360 - 180,
        Phi1 = (k[1] + 1) / width * 360 - 180;
        mPhi0 = mercatorPhi(Phi0),
        mPhi1 = mercatorPhi(Phi1);

    var width = canvas.width = x1 - x0,
        height = canvas.height = y1 - y0,
        context = canvas.getContext("2d");

    if (width > 0 && height > 0) {
      var sourceData = imgContext.getImageData(0, 0, dx, dy).data,
          target = context.createImageData(width, height),
          targetData = target.data,
          interpolate = bilinear(function(x, y, offset) {
            return sourceData[(y * dx + x) * 4 + offset];
          });

      for (var y = y0, i = -1; y < y1; ++y) {
        for (var x = x0; x < x1; ++x) {
          var p = projection.invert([x, y]), Lambda, Phi;
          if (!p || isNaN(Lambda = p[0]) || isNaN(Phi = p[1]) || Lambda > Lambda1 || Lambda < Lambda0 || Phi > mPhi0 || Phi < mPhi1) { i += 4; continue; }
          Phi = mercatorPhi.invert(Phi);

          var sx = (Lambda - Lambda0) / (Lambda1 - Lambda0) * dx,
              sy = (Phi - Phi0) / (Phi1 - Phi0) * dy;
          if (1) {
            var q = (((Lambda - Lambda0) / (Lambda1 - Lambda0) * dx | 0) + ((Phi - Phi0) / (Phi1 - Phi0) * dy | 0) * dx) * 4;
            targetData[++i] = sourceData[q];
            targetData[++i] = sourceData[++q];
            targetData[++i] = sourceData[++q];
          } else {
            targetData[++i] = interpolate(sx, sy, 0);
            targetData[++i] = interpolate(sx, sy, 1);
            targetData[++i] = interpolate(sx, sy, 2);
          }
          targetData[++i] = 0xff;
        }
      }
      context.putImageData(target, 0, 0);
    }

    d3.selectAll([canvas])
        .style("left", x0 + "px")
        .style("top", y0 + "px");

    projection.translate(t).scale(s).clipExtent(c);
  }
};

function key(d) { return d.key.join(", "); }
function pixel(d) { return (d | 0) + "px"; }

// Find latitude based on Mercator y-coordinate (in degrees).
function mercatorPhi(y) {
  return Math.atan(Math.exp(-y * Math.PI / 180)) * 360 / Math.PI - 90;
}

mercatorPhi.invert = function(Phi) {
  return -Math.log(Math.tan(Math.PI * .25 + Phi * Math.PI / 360)) * 180 / Math.PI;
};

function bilinear(f) {
  return function(x, y, o) {
    var x0 = Math.floor(x),
        y0 = Math.floor(y),
        x1 = Math.ceil(x),
        y1 = Math.ceil(y);
    if (x0 === x1 || y0 === y1) return f(x0, y0, o);
    return (f(x0, y0, o) * (x1 - x) * (y1 - y)
          + f(x1, y0, o) * (x - x0) * (y1 - y)
          + f(x0, y1, o) * (x1 - x) * (y - y0)
          + f(x1, y1, o) * (x - x0) * (y - y0)) / ((x1 - x0) * (y1 - y0));
  };
}

function urlTemplate(s) {
  return function(o) {
    return s.replace(/\{([^\}]+)\}/g, function(_, d) {
      var v = o[d];
      return v != null ? v : d === "quadkey" && quadkey(o.x, o.y, o.z);
    });
  };
}

function quadkey(column, row, zoom) {
  var key = [];
  for (var i = 1; i <= zoom; i++) {
    key.push((((row >> zoom - i) & 1) << 1) | ((column >> zoom - i) & 1));
  }
  return key.join("");
}

})();

// Check for vendor prefixes, by Mike Bostock.
var prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);

function prefixMatch(p) {
  var i = -1, n = p.length, s = document.body.style;
  while (++i < n) if (p[i] + "Transform" in s) return "-" + p[i].toLowerCase() + "-";
  return "";
}