/**
 * Source: https://github.com/maplibre/maplibre-gl-js
 * @type {e.Map|e.Map}
 */
var map = new maplibregl.Map({
  container: 'map',
  // MapLibre GL JS with MapTiler maps: https://docs.maptiler.com/maplibre/
  style: '/libs/maptiler-streets-v4/style.json',
  // starting position [lng, lat]
  center: [138.588, -34.9],
  // starting zoom (lower=less-zoom, higher=more-zoom)
  zoom: 10
});

map.on('load', async function() {
  // console.log('Map loaded!');
  try {
    const { resolved } = await (await fetch('test-db/resolved-location-by-suburb')).json() || {};
    console.log('resolved', resolved);
    // locations.resolved.forEach((r) => {

    const featureCollection = {
      type: 'FeatureCollection',
      features: resolved.map((r) => ({
        type: 'Feature',
        properties: {
          street: r.street,
          suburb: r.suburb,
          streetBySuburbId: r.streetBySuburbId
        },
        geometry: r.streetGeometry
      }))
    };

    map.addSource('streets-geometries', {
      type: 'geojson',
      data: featureCollection
    });

    map.addLayer({
      id: 'streets-layer',
      type: 'line',
      source: 'streets-geometries',
      paint: {
        // 'line-color': '#d10b0b',
        'line-color': '#d10b0b',
        'line-width': 3,
        'line-opacity': 0.5
      }
    });
  } catch (err) {
    console.error(err)
  }
});