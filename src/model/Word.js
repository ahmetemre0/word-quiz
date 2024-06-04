const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wordSchema = new Schema({
    originalWord: {
        type: String,
        required: true
    },
    meanings: {
        type: [String],
        required: true
    },
});

module.exports = mongoose.model('Word', wordSchema);