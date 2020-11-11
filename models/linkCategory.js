const mongoose = require('mongoose');
const linkCategorySchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            unique: true, 
            required: true,
        },
        description: String,
        links: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Link',
            },
        ],
    },
    { timestamps: true, collation: { locale: 'en', strength: 2 } }
);

module.exports = mongoose.model('LinkCategory', linkCategorySchema);