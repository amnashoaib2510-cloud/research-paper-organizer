const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true, default: '' },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    tags: [{ type: String, trim: true, lowercase: true }],
    notes: { type: String, default: '' },
    extractedText: { type: String, default: '', select: false }, // used for full-text search only
    uploadDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Text index across the fields users actually search by
paperSchema.index({ title: 'text', tags: 'text', notes: 'text', extractedText: 'text' });

module.exports = mongoose.model('Paper', paperSchema);
