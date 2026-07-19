import React, { useState } from 'react';
import { uploadPaper } from '../api';

function UploadModal({ onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selected);
    if (!title && selected) {
      setTitle(selected.name.replace(/\.pdf$/i, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Choose a PDF to add to the catalog.');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('paper', file);
    formData.append('title', title);
    formData.append('author', author);
    formData.append('tags', tags);
    formData.append('notes', notes);

    try {
      const paper = await uploadPaper(formData);
      onUploaded(paper);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New catalog entry</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="file-drop">
            <input type="file" accept=".pdf" onChange={handleFileChange} hidden />
            {file ? file.name : 'Choose a PDF file'}
          </label>

          <label className="field-label">
            Title
            <input
              className="field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Paper title"
            />
          </label>

          <label className="field-label">
            Author(s)
            <input
              className="field-input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Vaswani et al."
            />
          </label>

          <label className="field-label">
            Tags
            <input
              className="field-input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="comma separated, e.g. nlp, transformers, 2024"
            />
          </label>

          <label className="field-label">
            Notes
            <textarea
              className="field-input field-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Summary, key findings, quotes to remember..."
              rows={4}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Filing entry…' : 'Add to catalog'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadModal;
