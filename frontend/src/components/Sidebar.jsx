import React from 'react';

function Sidebar({ tags, activeTag, onSelectTag, paperCount }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-label">Catalog</div>
      <button
        className={`tag-row ${!activeTag ? 'tag-row--active' : ''}`}
        onClick={() => onSelectTag(null)}
      >
        <span>All papers</span>
        <span className="tag-count">{paperCount}</span>
      </button>

      <div className="sidebar-divider" />

      <div className="sidebar-label">Subjects</div>
      {tags.length === 0 && <p className="sidebar-empty">No tags yet</p>}
      {tags.map((tag) => (
        <button
          key={tag}
          className={`tag-row ${activeTag === tag ? 'tag-row--active' : ''}`}
          onClick={() => onSelectTag(tag)}
        >
          <span>{tag}</span>
        </button>
      ))}
    </aside>
  );
}

export default Sidebar;
