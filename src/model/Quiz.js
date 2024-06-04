const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const element = new Schema({
    word: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Word',
        required: true
    },
    turn: {
        type: Number,
        required: true,
        default: 1
    }
});

const quizSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    words: {
        type: [element],
        required: true
    }
});

module.exports = mongoose.model('Quiz', quizSchema);