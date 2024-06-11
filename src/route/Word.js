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

// POST /api/v1/word
router.post('/', async (req, res) => {
    const schema = joi.object({
        originalWord: joi.string().required(),
        meanings: joi.array().items(joi.string()).required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { originalWord, meanings } = req.body;
    const word = new Word({ originalWord, meanings });
    await word.save();
    res.json({ message: 'Word created successfully' });
});

// PATCH /api/v1/word
router.patch('/', ObjectFinder, async (req, res) => {
    if (!req.word) {
        return res.status(404).json({ message: 'Word not found' });
    }
    const schema = joi.object({
        originalWord: joi.string(),
        meanings: joi.array().items(joi.string())
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { originalWord, meanings } = req.body;
    if (originalWord) {
        req.word.originalWord = originalWord;
    }
    if (meanings) {
        req.word.meanings = meanings;
    }
    await req.word.save();
    res.json({ message: 'Word updated successfully' });
});

// DELETE /api/v1/word/delete
router.post('/delete', ObjectFinder, async (req, res) => {
    if (!req.word) {
        return res.status(404).json({ message: 'Word not found' });
    }
    await req.word.deleteOne();
    res.json({ message: 'Word deleted successfully' });
});

module.exports = router;