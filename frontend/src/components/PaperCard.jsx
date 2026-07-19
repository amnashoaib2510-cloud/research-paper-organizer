import React from 'react';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatSize(bytes) {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function PaperCard({ paper, onOpen }) {
  return (
    <button className="paper-card" onClick={() => onOpen(paper)}>
      <div className="paper-card-spine" />
      <div className="paper-card-body">
        <div className="paper-card-meta">
          <span>{formatDate(paper.uploadDate)}</span>
          <span className="paper-card-dot">·</span>
          <span>{formatSize(paper.fileSize)}</span>
        </div>
        <h3 className="paper-card-title">{paper.title}</h3>
        {paper.author && <p className="paper-card-author">{paper.author}</p>}

        {paper.notes && <p className="paper-card-notes">{paper.notes}</p>}

        {paper.tags?.length > 0 && (
          <div className="paper-card-tags">
            {paper.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

export default PaperCard;
