/**
 * Contact and Child is embbed
 */
const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
    name: String,
    age: String
})

const contactSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        phone: { type: String, required: true },
        email: String,
        children: [childSchema],
    },
    { timestamps: true }
);

const Child = mongoose.model('Child', childSchema);
const Contact = mongoose.model('Contact', contactSchema);

module.exports = { Contact, Child }