const mongoose  = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const OID = mongoose.Types.ObjectId;
const { genericAcquireMany, genericAcquireOne } = require('../utils/general');

const reviewSchema = new mongoose.Schema({
    storefront:  { type: ObjectId, required: true, ref: 'Storefront' },
    by:          { type: ObjectId, required: true, ref: 'User' },
    byName:      { type: String,   required: true },
    rating:      { type: Number,   required: true },
    title:       { type: String,   required: true },
    description: { type: String,   required: true },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
const schemaPaths = Object.keys(reviewSchema.paths);
const defaultSort = 'createdAt';

const ComplexesMany = { 'storefront': val => { const _id = new OID(val); return { storefront: _id }; } };

Review.acquireMany = genericAcquireMany(Review, ComplexesMany, schemaPaths, defaultSort);
Review.acquireOne  = genericAcquireOne(Review);

module.exports = Review;