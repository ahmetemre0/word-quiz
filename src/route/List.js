const express = require('express');
const router = express.Router();
const joi = require('joi');
const Word = require('../model/Word');
const WordList = require('../model/WordList');
const ObjectFinder = require('../middleware/ObjectFinder');

// GET /api/v1/list
router.get('/', ObjectFinder, async (req, res) => {
    if (req.list) {
        const list = {
            id: req.list._id,
            name: req.list.name,
            words: req.list.words.map(element => {
                originalWord = element.originalWord;
                meanings = element.meanings;
                return { originalWord, meanings };
            })
        };
        res.json(list);
    }
    else {
        const lists = await WordList.find();
        
        const data = await Promise.all(lists.map(async (list) => {
            const words = await Promise.all(list.words.map(async (element) => {
                const word = await Word.findOne({ _id: element }, { originalWord: 1, meanings: 1, _id: 0 });
                return word;
            }));

            return {
                _id: list._id,
                name: list.name,
                words: words
            };
        }));

        res.json(data);
    }
});

// POST /api/v1/list/add
router.post('/add', async (req, res) => {

    const { name, words } = req.body.list;
    const list = new WordList({ name });
    list.words = [];
    for (let i = 0; i < words.length; i++) {
        const word = await Word.findOne({ _id: words[i].id });
        if (!word) {
            return res.status(404).json({ message: 'Word not found' });
        }
        list.words.push({ word: words[i].id });
    }
    try {
        await list.save();
        res.json({ message: 'List created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    
});

// POST /api/v1/list/word/add
router.post('/word/add', ObjectFinder, async (req, res) => {
    const schema = joi.object({
        wordId: joi.string().required(),
        id: joi.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    
    try {
        req.list.words.push(req.word._id);
        await req.list.save();
        res.json({ message: 'Word added to list successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/v1/list/word/remove
router.post('/word/remove', ObjectFinder , async (req, res) => {
    const schema = joi.object({
        wordId: joi.string().required(),
        id: joi.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    
    try {
        req.list.words = req.list.words.filter(element => element != req.word._id);
        await req.list.save();
        res.json({ message: 'Word removed from list successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/v1/list/rename
router.post('/rename', ObjectFinder, async (req, res) => {
    const schema = joi.object({
        id: joi.string().required(),
        name: joi.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { name } = req.body;
    try {
        req.list.name = name;
        await req.list.save();
        res.json({ message: 'List renamed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/v1/list/delete
router.post('/delete', ObjectFinder, async (req, res) => {
    try {
        await WordList.findByIdAndDelete(req.body.list._id);
        res.json({ message: 'List deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/v1/list/deleteMultiple
router.post('/deleteMultiple', async (req, res) => {

    const lists = req.body.lists;
    try {
        await WordList.deleteMany({ _id: { $in: lists } });
        res.json({ message: 'Lists deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/v1/list/multi-add
router.post('/multi-add', async (req, res) => {
    const schema = joi.object({
        name: joi.string().required(),
        words: joi.array().items(joi.object({
            id: joi.string().required()
        })).required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { name, words } = req.body;
    const list = new WordList({ name });
    list.words = [];
    for (let i = 0; i < words.length; i++) {
        const word = await Word.findOne({ _id: words[i].id });
        if (!word) {
            return res.status(404).json({ message: 'Word not found' });
        }
        list.words.push({ word: words[i].id });
    }
    try {
        await list.save();
        res.json({ message: 'List created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/v1/list/multi-remove
router.post('/multi-remove', ObjectFinder, async (req, res) => {

    const { words } = req.body;
    try {
        req.list.words = req.list.words.filter(element => {
            return !words.find(word => word.id == element);
        });
        await req.list.save();
        res.json({ message: 'Words removed from list successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;