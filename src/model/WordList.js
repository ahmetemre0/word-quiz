const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const wordListSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    words: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Word',
        required: true
    }
});

module.exports = mongoose.model('WordList', wordListSchema);