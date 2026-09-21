import React, { useEffect, useRef } from 'react';
import { attachCountyLayerHandlers } from './geojsonUtils';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';
const DEFAULT_STYLE = { color: '#2f75ff', weight: 1.25, opacity: 0.95, fillColor: '#ffffff', fillOpacity: 0.08 };
const HOVER_STYLE = { color: '#0f3f91', weight: 2.8, opacity: 1, fillColor: '#dbeafe', fillOpacity: 0.34 };
const SELECTED_STYLE = { color: '#174ea6', weight: 3, opacity: 1, fillColor: '#bfdbfe', fillOpacity: 0.42 };

export default function CountyMap({ onSelectCounty, selectedCounty }) {
  const mapRef = useRef(null);
  const layersByCountyRef = useRef({});
  const selectedCountyRef = useRef(null);

  useEffect(() => {
    selectedCountyRef.current = selectedCounty;
  }, [selectedCounty]);

  useEffect(() => {
    let mounted = true;
    let leafletWait = null;
    layersByCountyRef.current = {};

    const initMap = () => {
      if (!window.L) return false;
      const L = window.L;
      if (mapRef.current) return true;
      mapRef.current = L.map('map', {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([0.15, 37.85], 6);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }).addTo(mapRef.current);
      return true;
    };

    if (!initMap()) {
      leafletWait = setInterval(() => {
        if (initMap()) {
          clearInterval(leafletWait);
          leafletWait = null;
        }
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
        if (!mapRef.current && !initMap()) return;
        const L = window.L;

        const countyLayer = L.geoJSON(data, {
          style: (feature) => {
            const geometryType = feature?.geometry?.type;
            if (geometryType !== 'Polygon' && geometryType !== 'MultiPolygon') {
              return null;
            }
            return DEFAULT_STYLE;
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
            const countyKey = String(meta.id || name);
            layersByCountyRef.current[countyKey] = layer;
            const popup = `<strong>${name}</strong><br/>Languages: ${langs.join(', ') || 'Data pending'}`;

            attachCountyLayerHandlers(layer, {
              popupContent: popup,
              onSelect: () => onSelectCounty?.(meta),
              hoverStyle: HOVER_STYLE,
              defaultStyle: DEFAULT_STYLE,
              afterMouseOut: (currentLayer) => {
                const currentSelection = selectedCountyRef.current;
                const currentKey = currentSelection && String(currentSelection.id || currentSelection.name);
                if (currentKey === countyKey) {
                  currentLayer.setStyle(SELECTED_STYLE);
                }
              },
            });

            const currentSelection = selectedCountyRef.current;
            const currentKey = currentSelection && String(currentSelection.id || currentSelection.name);
            if (currentKey === countyKey && typeof layer.setStyle === 'function') {
              layer.setStyle(SELECTED_STYLE);
            }

            if (typeof layer.getBounds === 'function') {
              const center = layer.getBounds().getCenter();
              L.marker(center, {
                interactive: false,
                icon: L.divIcon({
                  className: 'county-label',
                  html: name,
                  iconSize: [86, 22],
                  iconAnchor: [43, 11],
                }),
              }).addTo(mapRef.current);
            }
          }
        }).addTo(mapRef.current);

        if (countyLayer.getBounds().isValid()) {
          mapRef.current.fitBounds(countyLayer.getBounds(), { padding: [24, 24] });
        }
      })
      .catch((err) => console.error('GeoJSON or counties load failed', err));

    return () => {
      mounted = false;
      if (leafletWait) {
        clearInterval(leafletWait);
      }
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

  useEffect(() => {
    Object.values(layersByCountyRef.current).forEach((layer) => {
      if (typeof layer.setStyle === 'function') {
        layer.setStyle(DEFAULT_STYLE);
      }
    });

    const selectedKey = selectedCounty && String(selectedCounty.id || selectedCounty.name);
    const selectedLayer = selectedKey ? layersByCountyRef.current[selectedKey] : null;
    if (selectedLayer && typeof selectedLayer.setStyle === 'function') {
      selectedLayer.setStyle(SELECTED_STYLE);
      selectedLayer.bringToFront?.();
    }
  }, [selectedCounty]);

  return (
    <div className="map-frame" id="map"></div>
  );
}
