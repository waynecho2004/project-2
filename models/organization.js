const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    address: String,
    contacts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contact',
        },
    ],
});

module.exports = mongoose.model('Organization', organizationSchema);