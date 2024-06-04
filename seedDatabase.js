const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Word = require('./src/model/Word');
const WordList = require('./src/model/WordList');
const Quiz = require('./src/model/Quiz');

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Database connected');
}).catch((error) => {
    console.error('Database connection error:', error);
});

async function resetDatabase() {
    await Word.deleteMany({});
    await WordList.deleteMany({});
    await Quiz.deleteMany({});
}

async function createDummyData() {
    // Reset database
    await resetDatabase();

    // Create dummy words
    const words = [
        { originalWord: 'abate', meanings: ['to decrease in force or intensity', 'to become defeated or become null or void'] },
        { originalWord: 'benevolent', meanings: ['marked by or disposed to doing good', 'organized for the purpose of doing good'] },
        { originalWord: 'candid', meanings: ['marked by honest sincere expression', 'indicating or suggesting sincere honesty and absence of deception'] },
        { originalWord: 'diligent', meanings: ['characterized by steady, earnest, and energetic effort'] },
        { originalWord: 'empathy', meanings: ['the action of understanding, being aware of, being sensitive to'] },
        { originalWord: 'fervent', meanings: ['exhibiting or marked by great intensity of feeling'] },
    ];

    const savedWords = await Word.insertMany(words);

    // Create word lists
    const wordLists = [
        { name: 'Basic Vocabulary', words: savedWords.slice(0, 3).map(word => word._id) },
        { name: 'Advanced Vocabulary', words: savedWords.slice(3).map(word => word._id) }
    ];

    const savedWordLists = await WordList.insertMany(wordLists);

    // Create quizzes
    const quizzes = [
        { name: 'Basic Quiz', words: savedWordLists[0].words.map(word => ({ word: word, turn: 1 })) },
        { name: 'Advanced Quiz', words: savedWordLists[1].words.map(word => ({ word: word, turn: 1 })) },
        { name: 'Comprehensive Quiz', words: savedWords.map(word => ({ word: word._id, turn: 1 })) }
    ];

    await Quiz.insertMany(quizzes);

    console.log('Dummy data created successfully');
}

createDummyData().catch(error => {
    console.error('Error creating dummy data:', error);
}).finally(() => {
    mongoose.connection.close();
});
