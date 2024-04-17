const fs = require('fs');
const path = require('path');
const mongoose  = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const OID = mongoose.Types.ObjectId;
const { genericAcquireMany, genericAcquireOne } = require('../utils/general');

const uploadedLocation = '../uploads/';

const productSchema = new mongoose.Schema({
    storefront:     { type: ObjectId, required: true, ref: 'Storefront' },
    storefrontName: { type: String,   required: true },
    name:           { type: String,   required: true  },
    description:    { type: String,   required: false },
    price:          { type: Number,   required: true  },
    available:      { type: Boolean,  required: true  },
    imageFLIDs:     [
        { type: String,  required: false }
    ],
    previewIMG:  { type: String,   required: false },
}, { timestamps: true });

// Make name, description searchable
productSchema.index({ name: 'text', description: 'text' });
const schemaPaths = Object.keys(productSchema.paths);
const defaultSort = 'name';

const Product = mongoose.model('Product', productSchema);

const ComplexesMany = {
    'priceRange': val => {
        const [start, end] = val.split('-').map(Number);
        return { price: { $gte: start, $lte: end } };
    },
    'belongsTo': val => {
        const id = new OID(val);
        return { storefront: id };
    }
};

Product.acquireMany = genericAcquireMany(Product, ComplexesMany, schemaPaths, defaultSort);
Product.acquireOne  = genericAcquireOne(Product);

module.exports = Product;