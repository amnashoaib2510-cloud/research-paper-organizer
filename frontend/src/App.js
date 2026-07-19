import React, { useState, useEffect, useCallback } from 'react';
import { getPapers, searchPapers, getTags } from './api';
import Sidebar from './components/Sidebar';
import PaperCard from './components/PaperCard';
import UploadModal from './components/UploadModal';
import DetailDrawer from './components/DetailDrawer';
import './App.css';

function App() {
  const [papers, setPapers] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);

  const loadPapers = useCallback(async () => {
    setLoading(true);
    try {
      const data = query || activeTag ? await searchPapers(query, activeTag) : await getPapers();
      setPapers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query, activeTag]);

  const loadTags = useCallback(async () => {
    try {
      setTags(await getTags());
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  useEffect(() => {
    const timeout = setTimeout(loadPapers, query ? 300 : 0); // debounce typed search
    return () => clearTimeout(timeout);
  }, [loadPapers, query]);

  const handleUploaded = (paper) => {
    setShowUpload(false);
    setPapers((prev) => [paper, ...prev]);
    loadTags();
  };

  const handleUpdated = (updated) => {
    setPapers((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    setSelectedPaper(updated);
    loadTags();
  };

  const handleDeleted = (id) => {
    setPapers((prev) => prev.filter((p) => p._id !== id));
    setSelectedPaper(null);
    loadTags();
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">§</span>
          <div>
            <div className="brand-name">Marginalia</div>
            <div className="brand-sub">Research paper archive</div>
          </div>
        </div>

        <div className="search-slip">
          <span className="search-slip-label">Search</span>
          <input
            className="search-slip-input"
            placeholder="Title, tag, or note contents…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={() => setShowUpload(true)}>
          + New entry
        </button>
      </header>

      <div className="app-body">
        <Sidebar
          tags={tags}
          activeTag={activeTag}
          onSelectTag={setActiveTag}
          paperCount={papers.length}
        />

        <main className="main-panel">
          {loading && <p className="status-text">Retrieving records…</p>}

          {!loading && papers.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-mark">§</div>
              <h2>The catalog is empty</h2>
              <p>
                {query || activeTag
                  ? 'No entries match this search. Try another term or clear the filter.'
                  : 'Add your first paper to begin building your archive.'}
              </p>
              {!query && !activeTag && (
                <button className="btn-primary" onClick={() => setShowUpload(true)}>
                  + New entry
                </button>
              )}
            </div>
          )}

          {!loading && papers.length > 0 && (
            <div className="paper-grid">
              {papers.map((paper) => (
                <PaperCard key={paper._id} paper={paper} onOpen={setSelectedPaper} />
              ))}
            </div>
          )}
        </main>
      </div>

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />
      )}

      {selectedPaper && (
        <DetailDrawer
          paper={selectedPaper}
          onClose={() => setSelectedPaper(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}

export default App;
