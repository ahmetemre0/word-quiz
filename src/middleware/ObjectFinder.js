const Word = require('../model/Word');
const WordList = require('../model/WordList');
const Quiz = require('../model/Quiz');

const ObjectFinder =  async (req, res, next) => {
    // check endpoint for determining the id name of request
    if (!req.originalUrl.startsWith('/api/v1/')) {
        return res.status(400).json({ message: 'Invalid endpoint' });
    }
    let endpoint = req.originalUrl.split('/')[3];
    if(endpoint.includes('?')) {
        endpoint = endpoint.split('?')[0];
    }
    if (endpoint !== 'word' && endpoint !== 'list' && endpoint !== 'quiz') {
        return res.status(400).json({ message: 'Invalid endpoint' });
    }
    // check the request method
    const method = req.method;
    let source;
    if (method === 'GET') {
        source = req.query;
    }
    else if (method === 'POST') {
        source = req.body;
    }
    else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
        
    let id, wordId;
    if (endpoint === 'word') {
        id = source.id;
        if (!id) {
            return next();
        }

        try {
            const word = await Word.findById(id);
            if (!word) {
                return res.status(404).json({ message: 'Word not found' });
            }
            req.word = word;
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    if (endpoint === 'list') {
        if(!source.list || !source.list._id || !source.wordId) {
            return next();
        }

        id = source.list._id;
        wordId = source.wordId;
        try {
            if (id){
                const list = await WordList.findById(id);
                if (!list) {
                    return res.status(404).json({ message: 'Word list not found' });
                }
                req.list = list;
            }

            if (wordId) {
                const word = list.words.find(word => word._id == wordId);
                if (!word) {
                    return res.status(404).json({ message: 'Word not found' });
                }
                req.word = word;
            }
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    if (endpoint === 'quiz') {
        id = source.id;
        if (!id) {
            return next();
        }
        try {
            const quiz = await Quiz.findById(id);
            if (!quiz) {
                return res.status(404).json({ message: 'Quiz not found' });
            }
            req.quiz = quiz;
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
    next();
};

module.exports = ObjectFinder;
