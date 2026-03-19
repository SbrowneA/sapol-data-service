/**
 * Source: https://github.com/maplibre/maplibre-gl-js
 * @type {e.Map|e.Map}
 */
(() =>{
  const map = new maplibregl.Map({
    container: 'map',
    // MapLibre GL JS with MapTiler maps: https://docs.maptiler.com/maplibre/
    style: '/libs/maptiler-streets-v4/style.json',
    // starting position [lng, lat]
    center: [138.588, -34.9],
    // starting zoom (lower=less-zoom, higher=more-zoom)
    zoom: 10
  });

  map.on('load', async function () {
    console.log('Map loaded!');
    const { resolved } = await (await fetch('test-db/resolved-location-by-suburb')).json() || {};
    try {
      console.log('resolved', resolved);

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

      map.addSource('streets-geometry', {
        type: 'geojson',
        data: featureCollection
      });

      map.addLayer({
        id: 'streets-layer',
        type: 'line',
        source: 'streets-geometry',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#d10b0b',
          'line-width': 3,
          'line-opacity': 0.5
        }
      });

      map.on('click', 'streets-layer', (e) => {
        const feature = e.features?.[0]

        if (!feature) return

        const props = feature.properties

        console.log('Clicked - street:', props.street, 'suburb:', props.suburb);
      })
    } catch (err) {
      console.error(err)
    }
  });
})();