import React, { useEffect, useRef } from 'react';
import { attachCountyLayerHandlers } from './geojsonUtils';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function CountyMap({ onSelectCounty }) {
  const mapRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initMap = () => {
      if (!window.L) return false;
      const L = window.L;
      if (mapRef.current) return true;
      mapRef.current = L.map('map').setView([-1.0, 36.8], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
      return true;
    };

    if (!initMap()) {
      const wait = setInterval(() => {
        if (initMap()) clearInterval(wait);
      }, 150);
    }

    Promise.all([
      fetch(`${API_BASE}/api/counties/`).then((r) => r.json()),
      fetch(`${API_BASE}/api/geojson/kenya_counties/`).then((r) => r.json()),
    ])
      .then(([counties, data]) => {
        if (!mounted) return;
        const countyMetaByName = {};
        counties.forEach((county) => {
          countyMetaByName[county.name.toLowerCase()] = county;
        });

        if (!window.L) return;
        const L = window.L;

        L.geoJSON(data, {
          style: (feature) => {
            const geometryType = feature?.geometry?.type;
            if (geometryType !== 'Polygon' && geometryType !== 'MultiPolygon') {
              return null;
            }
            return { color: '#2c7bb6', weight: 2, fillOpacity: 0.3 };
          },
          onEachFeature: (feature, layer) => {
            const name = (feature.properties && feature.properties.name) || 'County';
            const meta = countyMetaByName[name.toLowerCase()] || {
              id: null,
              name,
              population: null,
              region: 'Unknown',
              languages: [],
              image_url: '',
              history: '',
              tribes: '',
              language_details: '',
            };
            const langs = meta.languages || [];
            const popup = `<strong>${name}</strong><br/>Languages: ${langs.join(', ')}`;

            attachCountyLayerHandlers(layer, {
              popupContent: popup,
              onSelect: () => onSelectCounty?.(meta),
              hoverStyle: { weight: 4, color: '#d1495b', fillOpacity: 0.5 },
              defaultStyle: { weight: 2, color: '#2c7bb6', fillOpacity: 0.3 },
            });
          }
        }).addTo(mapRef.current);
      })
      .catch((err) => console.error('GeoJSON or counties load failed', err));

    return () => {
      mounted = false;
      if (mapRef.current && window.L) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // ignore cleanup errors
        }
        mapRef.current = null;
      }
    };
  }, [onSelectCounty]);

  return (
    <div style={{ height: '480px', width: '100%', marginBottom: '1rem' }} id="map"></div>
  );
}
