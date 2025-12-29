const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: String,
    basePrice: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },
    image: String,
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });       

module.exports = mongoose.model('Product', productSchema);