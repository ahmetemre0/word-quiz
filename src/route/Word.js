const express = require('express');
const router = express.Router();
const joi = require('joi');
const Word = require('../model/Word');
const WordList = require('../model/WordList');
const ObjectFinder = require('../middleware/ObjectFinder');

// GET /api/v1/word
router.get('/', ObjectFinder, async (req, res) => {
    if (req.word) {
        const word = {
            id: req.word._id,
            originalWord: req.word.originalWord,
            meanings: req.word.meanings
        };
        res.json(word);
    }
    else {
        const words = await Word.find();
        res.json(words);
    }
});

// POST /api/v1/word/add
router.post('/add', async (req, res) => {
    const { originalWord, meanings } = req.body.word;
    const word = new Word({ originalWord, meanings });
    await word.save();
    res.json({ message: 'Word created successfully' });
});

// POST /api/v1/word/edit
router.post('/edit', ObjectFinder, async (req, res) => {
    if (!req.word) {
        return res.status(404).json({ message: 'Word not found' });
    }
    
    const { originalWord, meanings } = req.word;
    if (originalWord) {
        req.word.originalWord = originalWord;
    }
    if (meanings) {
        req.word.meanings = meanings;
    }
    await req.word.save();
    res.json({ message: 'Word updated successfully' });
});

// POST /api/v1/word/delete
router.post('/delete', ObjectFinder, async (req, res) => {
    if (!req.word) {
        return res.status(404).json({ message: 'Word not found' });
    }
    await req.word.deleteOne();
    res.json({ message: 'Word deleted successfully' });
});

// POST /api/v1/word/deleteMultiple
router.post('/deleteMultiple', async (req, res) => {
    const { words } = req.body;
    await Word.deleteMany({ _id: { $in: words } });
    res.json({ message: 'Words deleted successfully' });
});

module.exports = router;