import React, { useCallback, useEffect, useState } from 'react';
import CountyMap from './Components/CountyMap';
import './App.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

function App() {
  const [overview, setOverview] = useState(null);
  const [counties, setCounties] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [view, setView] = useState('map');

  useEffect(() => {
    fetch(`${API_BASE}/api/kenya-overview/`)
      .then((res) => res.json())
      .then((data) => setOverview(data));

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

  const handleCountySelect = useCallback((county) => {
    setSelectedCounty(county);
  }, []);

  const handleViewProfile = useCallback(() => {
    if (!selectedCounty) return;
    setView('detail');
    const nextPath = `/county/${selectedCounty.id}`;
    if (window.history.pushState) {
      window.history.pushState({}, '', nextPath);
    }
  }, [selectedCounty]);

  const handleBackToMap = useCallback(() => {
    setView('map');
    setSelectedCounty(null);
    if (window.history.pushState) {
      window.history.pushState({}, '', '/');
    }
  }, []);

  const selectedLanguages = (selectedCounty?.languages || []).join(', ');

  return (
    <div className="atlas-shell">
      <header className="atlas-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">KA</div>
          <h1>Kenya Language Atlas</h1>
        </div>

        <nav className="atlas-nav" aria-label="Primary navigation">
          <a className="nav-link is-active" href="/" onClick={(event) => { event.preventDefault(); handleBackToMap(); }}>
            <span className="nav-home-icon" aria-hidden="true"></span>
            Home
          </a>
          <a className="nav-link" href="#languages">Languages</a>
          <a className="nav-link" href="#about">About</a>
          <a className="nav-link" href="#methodology">Methodology</a>
          <a className="nav-link" href="#contact">Contact</a>
        </nav>
      </header>

      {view === 'detail' && selectedCounty ? (
        <main className="detail-page">
          <article className="detail-card">
            <div className="detail-hero">
              <button className="back-button" onClick={handleBackToMap}>Back to the map</button>
              <h2>{selectedCounty.name}</h2>
              <p>{selectedCounty.history || 'History details will be added as the atlas grows.'}</p>
            </div>

            {selectedCounty.image_url && (
              <img className="detail-image" src={selectedCounty.image_url} alt={selectedCounty.name} />
            )}

            <div className="detail-grid">
              <div className="detail-stat">
                <strong>Region</strong>
                <span>{selectedCounty.region || 'Unknown'}</span>
              </div>
              <div className="detail-stat">
                <strong>Population</strong>
                <span>{selectedCounty.population || 'Not available'}</span>
              </div>
              <div className="detail-stat">
                <strong>Languages</strong>
                <span>{selectedLanguages || 'Not available'}</span>
              </div>
            </div>

            <div className="detail-body">
              <section>
                <h3>Tribes and communities</h3>
                <p>{selectedCounty.tribes || 'Community details will be added as the atlas grows.'}</p>
              </section>
              <section>
                <h3>Language profile</h3>
                <p>{selectedCounty.language_details || 'Language notes will be added as the atlas grows.'}</p>
              </section>
            </div>
          </article>
        </main>
      ) : (
        <main className="atlas-main">
          <div className="atlas-layout">
            <section className="map-panel" aria-label="Kenya county language map">
              <CountyMap onSelectCounty={handleCountySelect} selectedCounty={selectedCounty} />
            </section>

            <aside className="sidebar">
              <section className="info-card">
                <div className="card-icon pin-icon" aria-hidden="true"></div>
                <div>
                  <h2>Selected Province</h2>
                  {selectedCounty ? (
                    <>
                      <ul className="county-stats">
                        <li>
                          <strong className="county-name">{selectedCounty.name}</strong>
                          <span>{selectedCounty.region || 'Region details are not available yet.'}</span>
                        </li>
                        <li>
                          <strong>Languages</strong>
                          <span>{selectedLanguages || 'Language data is not available yet.'}</span>
                        </li>
                        <li>
                          <strong>Population</strong>
                          <span>{selectedCounty.population || 'Population data is not available yet.'}</span>
                        </li>
                      </ul>
                      <button className="profile-button" onClick={handleViewProfile}>View full profile</button>
                    </>
                  ) : (
                    <p>Click on a province on the map to see its cultural and linguistic profile.</p>
                  )}
                </div>
              </section>

              <section className="info-card">
                <div aria-hidden="true"></div>
                <div>
                  <h3>Legend</h3>
                  <ul className="legend-list">
                    <li className="legend-item">
                      <span className="boundary-key" aria-hidden="true"></span>
                      <span>Province Boundary</span>
                    </li>
                    <li className="legend-item">
                      <span className="water-key" aria-hidden="true"></span>
                      <span>Water Body</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="info-card" id="methodology">
                <div aria-hidden="true"></div>
                <div>
                  <h3>How to use</h3>
                  <ul className="steps-list">
                    <li className="step-item">
                      <span className="tool-icon cursor-icon" aria-hidden="true"></span>
                      <span className="step-copy">
                        <strong>Click on a province</strong>
                        <span>Explore languages spoken in the province</span>
                      </span>
                    </li>
                    <li className="step-item">
                      <span className="tool-icon chart-icon" aria-hidden="true"></span>
                      <span className="step-copy">
                        <strong>View insights</strong>
                        <span>See language statistics and diversity</span>
                      </span>
                    </li>
                    <li className="step-item">
                      <span className="tool-icon download-icon" aria-hidden="true"></span>
                      <span className="step-copy">
                        <strong>Share or download</strong>
                        <span>Export data or share with others</span>
                      </span>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="info-card about-card" id="about">
                <div className="card-icon info-icon" aria-hidden="true">i</div>
                <div>
                  <h3>About the Atlas</h3>
                  <p>
                    {overview?.highlights ||
                      "The Kenya Language Atlas is an open data initiative that visualizes the rich linguistic diversity across Kenya's provinces."}
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </main>
      )}

      <footer className="atlas-footer">
        <div>
          <span>&copy; 2025 Kenya Language Atlas</span>
          <span className="footer-divider">|</span>
          <span>Data sources: KNBS, Ethnologue, SIL Kenya</span>
        </div>
        <div>Built with <span className="footer-heart">heart</span> for cultural preservation</div>
      </footer>
    </div>
  );
}

export default App;
