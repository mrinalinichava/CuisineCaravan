const mongoose  = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const OID = mongoose.Types.ObjectId;
const { genericAcquireMany, genericAcquireOne } = require('../utils/general');

const reportSchema = new mongoose.Schema({
    storefront:  { type: ObjectId, required: true, ref: 'Storefront' },
    by:          { type: ObjectId, required: true, ref: 'User' },
    byName:      { type: String,   required: true },
    title:       { type: String,   required: true },
    description: { type: String,   required: true },
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
const schemaPaths = Object.keys(reportSchema.paths);
const defaultSort = 'createdAt';

const ComplexesMany = {
    'storefront': val => { const _id = new OID(val); return { storefront: _id }; },
    'customer':   val => { const _id = new OID(val); return { 'by': _id }; }
};

Report.acquireMany = genericAcquireMany(Report, ComplexesMany, schemaPaths, defaultSort);
Report.acquireOne  = genericAcquireOne(Report);

module.exports = Report;