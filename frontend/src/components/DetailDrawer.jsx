import React, { useState, useEffect } from 'react';
import { updatePaper, deletePaper, fileUrl } from '../api';

function DetailDrawer({ paper, onClose, onUpdated, onDeleted }) {
  const [notes, setNotes] = useState(paper.notes || '');
  const [tags, setTags] = useState((paper.tags || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setNotes(paper.notes || '');
    setTags((paper.tags || []).join(', '));
  }, [paper]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updatePaper(paper._id, { notes, tags });
      onUpdated(updated);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Remove "${paper.title}" from the catalog? This cannot be undone.`)) return;
    await deletePaper(paper._id);
    onDeleted(paper._id);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="drawer-eyebrow">Catalog entry</div>
            <h2 className="drawer-title">{paper.title}</h2>
            {paper.author && <p className="drawer-author">{paper.author}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <a className="btn-secondary" href={fileUrl(paper._id)} target="_blank" rel="noreferrer">
          Open PDF ↗
        </a>

        <label className="field-label">
          Tags
          <input
            className="field-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="comma separated"
          />
        </label>

        <label className="field-label">
          Notes
          <textarea
            className="field-input field-textarea field-textarea--tall"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={10}
          />
        </label>

        <div className="drawer-actions">
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : savedFlash ? 'Saved ✓' : 'Save changes'}
          </button>
          <button className="btn-danger" onClick={handleDelete}>
            Delete entry
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailDrawer;
