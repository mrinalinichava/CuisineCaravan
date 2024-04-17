const fs = require('fs');
const path = require('path');
const mongoose  = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const OID = mongoose.Types.ObjectId;
const Product = require('./Product');
const Review = require('./Review');
const { genericAcquireMany, genericAcquireOne } = require('../utils/general');

const uploadedLocation = './uploads/';

const storefrontSchema = new mongoose.Schema({
    owners:       { type: [ObjectId], required: true, ref: 'User' },
    name:         { type: String,   required: true  },
    description:  { type: String,   required: false },
    tags:         { type: [String], required: false },
    iconFLID:     { type: String,   required: false },
    bannerFLID:   { type: String,   required: false },
    addresses:    { type: [String], required: true  },
    rating:       {
        count:   { type: Number, required: true, default: 0 },
        average: { type: Number, required: true, default: 0 },
    },
    sales:        {
        count:   { type: Number, required: true, default: 0 },
        revenue: { type: Number, required: true, default: 0 },
    }
}, { timestamps: true });

// Delete products, reviews, icon image, banner image after the storefront is deleted
// storefrontSchema.post('remove', storefront => {
//     Product.deleteMany({ storefront: storefront._id }).exec();
//     Review.deleteMany({ storefront: storefront._id }).exec();
//     storefront.iconFLID && fs.unlink(path.join(uploadedLocation, storefront.iconFLID), err => {});
//     storefront.bannerFLID && fs.unlink(path.join(uploadedLocation, storefront.bannerFLID), err => {});
// });

// Make name, description, and tags searchable
storefrontSchema.index({ name: 'text', description: 'text', tags: 'text' });
// Handle denormalization: update Product.storefrontName when the Storefront.name is updated
storefrontSchema.post('save', storefront => {
    Product.updateMany({ storefront: storefront._id }, { storefrontName: storefront.name }).exec();
});

const schemaPaths = Object.keys(storefrontSchema.paths);
const defaultSort = 'name';

const ComplexesMany = {
    'ownerIn': val => {
        const id = new OID(val);
        return { owners: { $in: [id] } };
    }
};

const Storefront = mongoose.model('Storefront', storefrontSchema);

Storefront.acquireMany = genericAcquireMany(Storefront, ComplexesMany, schemaPaths, defaultSort);
Storefront.acquireOne  = genericAcquireOne(Storefront);

module.exports = Storefront;