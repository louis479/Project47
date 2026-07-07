import React, { useEffect, useState } from 'react';
import CountyMap from './Components/CountyMap';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

function App() {
  const [overview, setOverview] = useState(null);
  const [regions, setRegions] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [counties, setCounties] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [view, setView] = useState('map');

  useEffect(() => {
    fetch(`${API_BASE}/api/kenya-overview/`)
      .then((res) => res.json())
      .then((data) => setOverview(data));

    fetch(`${API_BASE}/api/regions/`)
      .then((res) => res.json())
      .then((data) => setRegions(data));

    fetch(`${API_BASE}/api/languages/`)
      .then((res) => res.json())
      .then((data) => setLanguages(data));

    fetch(`${API_BASE}/api/counties/`)
      .then((res) => res.json())
      .then((data) => setCounties(data));
  }, []);

  useEffect(() => {
    const syncViewFromLocation = () => {
      const match = window.location.pathname.match(/^\/county\/(\d+)$/);
      if (match && counties.length) {
        const found = counties.find((county) => String(county.id) === match[1]);
        if (found) {
          setSelectedCounty(found);
          setView('detail');
          return;
        }
      }
      setView('map');
      setSelectedCounty(null);
    };

    syncViewFromLocation();
    window.addEventListener('popstate', syncViewFromLocation);
    return () => window.removeEventListener('popstate', syncViewFromLocation);
  }, [counties]);

  const handleCountySelect = (county) => {
    setSelectedCounty(county);
    setView('detail');
    const nextPath = `/county/${county.id}`;
    if (window.history.pushState) {
      window.history.pushState({}, '', nextPath);
    }
  };

  const handleBackToMap = () => {
    setView('map');
    setSelectedCounty(null);
    if (window.history.pushState) {
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '2rem', maxWidth: '960px', margin: 'auto' }}>
      <h1>Kenya Language Atlas</h1>
      <p>A simple prototype showing Kenya’s language and regional diversity.</p>

      {view === 'detail' && selectedCounty ? (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.25rem', background: '#fafafa' }}>
          <button onClick={handleBackToMap} style={{ marginBottom: '1rem', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid #2c7bb6', background: 'white', cursor: 'pointer' }}>
            ← Back to the map
          </button>
          <h2>{selectedCounty.name}</h2>
          <p><strong>Region:</strong> {selectedCounty.region}</p>
          <p><strong>Population:</strong> {selectedCounty.population}</p>
          <p><strong>Languages:</strong> {(selectedCounty.languages || []).join(', ')}</p>

          {selectedCounty.image_url && (
            <img src={selectedCounty.image_url} alt={selectedCounty.name} style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '8px', margin: '1rem 0' }} />
          )}

          <h3>History</h3>
          <p>{selectedCounty.history || 'History details will be added as the atlas grows.'}</p>

          <h3>Tribes and communities</h3>
          <p>{selectedCounty.tribes || 'Community details will be added as the atlas grows.'}</p>

          <h3>Language profile</h3>
          <p>{selectedCounty.language_details || 'Language notes will be added as the atlas grows.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem' }}>
          <div>
            <CountyMap onSelectCounty={handleCountySelect} />
          </div>
          <div>
            <div id="county-info" style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '6px' }}>
              <h3>Selected County</h3>
              {selectedCounty ? (
                <div>
                  <p><strong>{selectedCounty.name}</strong></p>
                  <p><strong>Region:</strong> {selectedCounty.region}</p>
                  <p><strong>Languages:</strong> {(selectedCounty.languages || []).join(', ')}</p>
                </div>
              ) : (
                <div>Click a county on the map to see its cultural and linguistic profile.</div>
              )}
            </div>
            <div style={{ marginTop: '1rem', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '6px' }}>
              <h4>Legend</h4>
              <div style={{ display: 'flex', alignItems: 'center' }}><div style={{ width: 16, height: 12, background: '#2c7bb6', marginRight: 8 }}></div> County area</div>
            </div>
          </div>
        </div>
      )}

      {overview && (
        <section style={{ marginBottom: '2rem', marginTop: '2rem' }}>
          <h2>Kenya Overview</h2>
          <p><strong>Capital:</strong> {overview.capital}</p>
          <p><strong>Population:</strong> {overview.population}</p>
          <p><strong>Languages:</strong> {overview.languages.join(', ')}</p>
          <p>{overview.highlights}</p>
        </section>
      )}

      <section style={{ marginBottom: '2rem' }}>
        <h2>Sample Regions</h2>
        {regions.map((region) => (
          <div key={region.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '0.8rem' }}>
            <h3>{region.name}</h3>
            <p>{region.description}</p>
            <p><strong>Population:</strong> {region.population}</p>
            <p><strong>Languages:</strong> {region.languages}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Sample Languages</h2>
        {languages.map((language) => (
          <div key={language.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '0.8rem' }}>
            <h3>{language.name}</h3>
            <p><strong>Family:</strong> {language.family}</p>
            <p><strong>Speakers:</strong> {language.speakers}</p>
            <p>{language.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;
