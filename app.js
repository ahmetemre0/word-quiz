const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});

const ListRouter = require('./src/route/List');
const WordRouter = require('./src/route/Word');
const QuizRouter = require('./src/route/Quiz');


app.use('/api/v1/list', ListRouter);
app.use('/api/v1/word', WordRouter);
app.use('/api/v1/quiz', QuizRouter);

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
    console.log('Error:', error);
});