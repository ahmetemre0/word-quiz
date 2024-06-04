const express = require('express');
const router = express.Router();
const joi = require('joi');
const Word = require('../model/Word');
const WordList = require('../model/WordList');
const Quiz = require('../model/Quiz');
const ObjectFinder = require('../middleware/ObjectFinder');

// POST /api/v1/quiz
router.post('/', ObjectFinder, async (req, res) => {
    const schema = joi.object({
        name: joi.string().required(),
        lists: joi.array().items(joi.object({
            id: joi.string().required()
        }))
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { name, lists } = req.body;
    const quiz = new Quiz({ name });
    const mergedDistinctWordsFromLists = [];
    for (let i = 0; i < lists.length; i++) {
        const list = await WordList.findOne({ _id: lists[i].id });
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        const words = list.words;
        for (let j = 0; j < words.length; j++) {
            const word = await Word.findOne({ _id: words[j] });
            if (!word) {
                return res.status(404).json({ message: 'Word not found' });
            }
            if (!mergedDistinctWordsFromLists.find(element => element._id == word._id)) {
                mergedDistinctWordsFromLists.push(word);
            }
        }
    }
    const quizWords = [];
    for (let i = 0; i < mergedDistinctWordsFromLists.length; i++) {
        quizWords.push({ word: mergedDistinctWordsFromLists[i]._id });
    }
    quiz.words = quizWords;
    await quiz.save();
    res.json({ message: 'Quiz created successfully' });
});

// GET /api/v1/quiz
router.get('/start', ObjectFinder, async (req, res) => {
    if (!req.quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }    
    let word = req.quiz.words.find(word => word.turn == 0);
    if (!word) {
        const next = req.quiz.words.find(word => word.turn == 1);
        if (!next) {
            return res.json({ message: 'Quiz finished' });
        }
        // get random word from the list where turn is 1
        const randomIndexWithTurn1 = Math.floor(Math.random() * req.quiz.words.filter(word => word.turn == 1).length);
        word = req.quiz.words.filter(word => word.turn == 1)[randomIndexWithTurn1];
        word.turn = 0;
        await req.quiz.save();
    }
    
    const wordData = await Word.findOne({ _id: word.word, }, { originalWord: 1, meanings: 1, _id: 0});
    // add id to word data
    wordData.id = word.word;
    res.json({ word: wordData });
});

router.get('/next', ObjectFinder, async (req, res) => {
    if (!req.quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }
    let word = req.quiz.words.find(word => word.turn == 0);
    if (!word) {
        const next = req.quiz.words.find(word => word.turn == 1);
        if (!next) {
            return res.json({ message: 'Quiz finished' });
        }
        // get random word from the list where turn is 1
        const randomIndexWithTurn1 = Math.floor(Math.random() * req.quiz.words.filter(word => word.turn == 1).length);
        word = req.quiz.words.filter(word => word.turn == 1)[randomIndexWithTurn1];
        word.turn = 0;
        await req.quiz.save();
    }
    const oldWordsToIncreaseTurn = req.quiz.words.filter(word => word.turn <= 0);
    for (let i = 0; i < oldWordsToIncreaseTurn.length; i++) {
        oldWordsToIncreaseTurn[i].turn--;
    }
    await req.quiz.save();
    const wordData = await Word.findOne({ _id: word.word }, { originalWord: 1, meanings: 1, _id: 0 });
    // add id to word data
    wordData.id = word.word;

    res.json({ word: wordData });
});

router.get('/prev', ObjectFinder, async (req, res) => {
    if (!req.quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }
    const currentTurn = req.quiz.words.find(word => word.word == req.word._id).turn;
    const prevWord = req.quiz.words.find(word => word.turn == currentTurn - 1);
    if (!prevWord) {
        return res.json({ message: 'No previous word' });
    }
    const word = await Word.findOne({ _id: prevWord.word }, { originalWord: 1, meanings: 1, _id: 0 });
    // add id to word data
    word.id = prevWord.word;
    res.json({ word });
});

router.post('/delete', ObjectFinder, async (req, res) => {
    if (!req.quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }
    await Quiz.deleteOne({ _id: req.quiz._id });
    res.json({ message: 'Quiz deleted successfully' });
});

router.post('/reset', ObjectFinder, async (req, res) => {
    if (!req.quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }
    req.quiz.words.forEach(word => word.turn = 1);
    await req.quiz.save();
    res.json({ message: 'Quiz reset successfully' });
});

router.post('/rename', ObjectFinder, async (req, res) => {
    if (!req.quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }
    const schema = joi.object({
        name: joi.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    req.quiz.name = req.body.name;
    await req.quiz.save();
    res.json({ message: 'Quiz renamed successfully' });
});

module.exports = router;