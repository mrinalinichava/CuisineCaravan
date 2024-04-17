const mongoose  = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const OID = mongoose.Types.ObjectId;
const { genericAcquireMany, genericAcquireOne } = require('../utils/general');

const productList = new mongoose.Schema({
    _id: { type: String, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
});
const orderSchema = new mongoose.Schema({
    // product:        { type: ObjectId, ref: 'Product', required: true },
    // productName:    { type: String, required: true },

    // quantity:       { type: Number, required: true },
    productList: [productList],

    storefront:     { type: ObjectId, ref: 'Storefront', required: true },
    storefrontName: { type: String, required: true },

    state:          { type: Number, required: true },

    pickupPoint:    { type: String, required: false, default: '' },
    destination:    { type: String, required: true,  default: '' },

    customer:       { type: ObjectId, ref: 'User', required: true },
    customerName:   { type: String, required: true },

    deliverer:      { type: ObjectId, ref: 'User', required: false, default: null },
    delivererName:  { type: String, required: false, default: '' },
    
    paymentBase:    { type: Number, required: true },
    paymentVat:     { type: Number, required: true },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

const schemaPaths = Object.keys(orderSchema.paths);
const defaultSort = 'createdAt';

const ComplexesMany = {
    'bitsAllClear': val => { const _num =  Number(val); return { state: { $bitsAllClear: _num } }; },
    'bitsAllSet':   val => { const _num =  Number(val); return { state: { $bitsAllSet:   _num } }; },
    'bitsAnyClear': val => { const _num =  Number(val); return { state: { $bitsAnyClear: _num } }; },
    'bitsAnySet':   val => { const _num =  Number(val); return { state: { $bitsAnySet:   _num } }; },
    'stateGTE':     val => { const _num =  Number(val); return { state: { $gte: _num } }; },
    'stateLTE':     val => { const _num =  Number(val); return { state: { $lte: _num } }; },
    'stateGT':      val => { const _num =  Number(val); return { state: { $gt:  _num } }; },
    'stateLT':      val => { const _num =  Number(val); return { state: { $lt:  _num } }; },
    'stateNE':      val => { const _num =  Number(val); return { state: { $ne:  _num } }; },
    'stateEQ':      val => { const _num =  Number(val); return { state:         _num }; },
    'product':      val => { const _id  = new OID(val); return { product:        _id }; },
    'storefront':   val => { const _id  = new OID(val); return { storefront:     _id }; },
    'customer':     val => { const _id  = new OID(val); return { customer:       _id }; },
    'deliverer':    val => { const _id  = new OID(val); return { deliverer:      _id }; },
    'qrange':       val => { const [start, end] = val.split('-').map(Number); return { quantity: { $gte: start, $lte: end } }; },
    // 'c_all':        val => {
    //     const customerID = new OID(val);
    //     return {}
    // },
};

Order.acquireMany = genericAcquireMany(Order, ComplexesMany, schemaPaths, defaultSort);
Order.acquireOne  = genericAcquireOne(Order);

module.exports = Order;