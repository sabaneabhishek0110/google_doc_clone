const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    _id : {
        type:String,
        required : true,
    },
    data : {
        type : Object,
    }
})

const Document = mongoose.model('Document',documentSchema);
module.exports = Document;