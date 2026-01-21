/**
 * Source: https://github.com/maplibre/maplibre-gl-js
 * @type {e.Map|e.Map}
 */
var map = new maplibregl.Map({
    container: 'map',
    style: '/libs/maplibre-gl@5.16.0/style.json', // stylesheet location
    center: [138.588, -34.9], // starting position [lng, lat]
    zoom: 8 // starting zoom (lower=less-zoom, higher=more-zoom)
});
