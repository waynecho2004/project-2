const mongoose = require('mongoose');

// Using collation: { locale: 'en', strength: 2 } to keep the sort order right
const linkSchema = new mongoose.Schema(
    {
        title: { 
            type: String, 
            unique: true, 
            required: true,
        },
        url: { 
            type: String, 
            required: true,
        },
        description: String,
    },
    { timestamps: true, collation: { locale: 'en', strength: 2 } }
);

module.exports = mongoose.model('Link', linkSchema);