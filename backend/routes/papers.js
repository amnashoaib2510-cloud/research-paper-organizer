const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Paper = require('../models/Paper');
const extractPdfText = require('../utils/extractPdfText');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
});

// POST /api/papers/upload
router.post('/upload', upload.single('paper'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const { title, author, tags, notes } = req.body;
    const extractedText = await extractPdfText(req.file.path);

    const parsedTags = tags
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const paper = await Paper.create({
      title: title?.trim() || req.file.originalname.replace(/\.pdf$/i, ''),
      author: author?.trim() || '',
      fileName: req.file.originalname,
      filePath: req.file.filename,
      fileSize: req.file.size,
      tags: parsedTags,
      notes: notes?.trim() || '',
      extractedText,
    });

    const { extractedText: _omit, ...paperData } = paper.toObject();
    res.status(201).json(paperData);
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: 'Failed to process upload' });
  }
});

// GET /api/papers  (list all, newest first)
router.get('/', async (req, res) => {
  try {
    const papers = await Paper.find().sort({ uploadDate: -1 });
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch papers' });
  }
});

// GET /api/papers/search?q=keyword&tag=nlp
router.get('/search', async (req, res) => {
  try {
    const { q, tag } = req.query;
    const filter = {};

    if (q) {
      filter.$text = { $search: q };
    }
    if (tag) {
      filter.tags = tag.toLowerCase();
    }

    const papers = await Paper.find(filter).sort({ uploadDate: -1 });
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/papers/tags  (all unique tags, for filter sidebar)
router.get('/tags', async (req, res) => {
  try {
    const tags = await Paper.distinct('tags');
    res.json(tags.sort());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// GET /api/papers/:id/file  (stream the actual PDF)
router.get('/:id/file', async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    const filePath = path.join(uploadDir, paper.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File missing on server' });
    }
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load file' });
  }
});

// PUT /api/papers/:id  (update notes/tags/title/author)
router.put('/:id', async (req, res) => {
  try {
    const { title, author, tags, notes } = req.body;
    const update = {};

    if (title !== undefined) update.title = title.trim();
    if (author !== undefined) update.author = author.trim();
    if (notes !== undefined) update.notes = notes.trim();
    if (tags !== undefined) {
      update.tags = Array.isArray(tags)
        ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
        : tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
    }

    const paper = await Paper.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    res.json(paper);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update paper' });
  }
});

// DELETE /api/papers/:id
router.delete('/:id', async (req, res) => {
  try {
    const paper = await Paper.findByIdAndDelete(req.params.id);
    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    const filePath = path.join(uploadDir, paper.filePath);
    fs.unlink(filePath, () => {});

    res.json({ message: 'Paper deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete paper' });
  }
});

module.exports = router;
