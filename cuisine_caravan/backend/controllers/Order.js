const Order = require('../models/Order');
const Storefront = require('../models/Storefront');
const Product = require('../models/Product');
const User = require('../models/User');
const OID = require('mongoose').Types.ObjectId;
const { CTRLCODES, CTRLRES, REQGATE, extractAG } = require('../utils/general');

const ORDER_STATE_CUSTOMER_ORDERED     = 1 << 0;
const ORDER_STATE_VENDOR_ACCEPTED      = 1 << 1;
const ORDER_STATE_VENDOR_PRODUCT_DONE  = 1 << 2;
const ORDER_STATE_DELIVERER_ACCEPT_JOB = 1 << 3;
const ORDER_STATE_VENDOR_HANDOVER      = 1 << 4;
const ORDER_STATE_DELIVERER_RECEIVE    = 1 << 5;
const ORDER_STATE_DELIVERER_HANDOVER   = 1 << 6;
const ORDER_STATE_CUSTOMER_RECEIVE     = 1 << 7;

const VAT = 0.15;
const REVENUE_PORTION = 0.1;

async function customerSubmitOrder(products, customer, destination) {
    
    let totalBasePrice = 0;
    let totalVat = 0;
    const itemDetails = [];
    
    for (const item of products) {
        const product = await Product.findById(item._id);
        if (!product) {
            return CTRLRES(CTRLCODES.NOT_OK, `Product not found: ${item.product}`, 400);
        }
        if(item.quantity < 1){
             return CTRLRES(CTRLCODES.NOT_OK, 'Quantity must be greater than 0', 200, -1);
        }
        const itemBasePrice = product.price * item.quantity;
        const itemVat = itemBasePrice * VAT;

        itemDetails.push({
            _id: item._id,
            productName: product.name,
            quantity: item.quantity,
            price: product.price,
            subtotal: itemBasePrice,
            vat: itemVat
        });

        totalBasePrice += itemBasePrice;
        totalVat += itemVat;
    }

    const cust = await User.findById(customer);
    if(!cust) return CTRLRES(CTRLCODES.NOT_OK, 'Customer not found', 200, -3);
    // const basePrice    = prod.price * quantity;
    // const vatAmount    = basePrice * VAT;
    let storefront = products[0].storefront;
    let storefrontName = products[0].storefrontName;
    const order = new Order({
        // product:        product,
        productList:        itemDetails,
        // productName:    prod.name,
        // quantity:       quantity,
        storefront:     storefront,
        storefrontName: storefrontName,
        state:          ORDER_STATE_CUSTOMER_ORDERED,
        pickupPoint:    '',
        destination:    destination,
        customer:       customer,
        customerName:   cust.firstName + ' ' + cust.lastName,
        deliverer:      null,
        delivererName:  '',
        paymentBase:    totalBasePrice,
        paymentVat:     totalVat,
    });
    await order.save();

    return CTRLRES(CTRLCODES.SUCCESS, 'Order submitted', 200, order._id);
}

async function customerCancelOrder(order, customer) {
    const ord = await Order.findById(order);
    if(!ord) return CTRLRES(CTRLCODES.NOT_OK, 'Order not found', 200, -1);

    if(ord.customer.toString() !== customer.toString()) return CTRLRES(CTRLCODES.NOT_OK, 'You are not the owner of this order', 200, -2);

    if(ord.state !== ORDER_STATE_CUSTOMER_ORDERED) return CTRLRES(CTRLCODES.NOT_OK, 'Order is processing, cannot cancel now', 200, -3);

    // delete the order
    await Order.deleteOne({ _id: order });
    return CTRLRES(CTRLCODES.SUCCESS, 'Order cancelled', 200, 0);
}

async function vendorAcceptOrder(order, vendor) {
    const ord = await Order.findById(order);
    if(!ord) return CTRLRES(CTRLCODES.NOT_OK, 'Order not found', 200, -1);

    const store = await Storefront.findById(ord.storefront);
    if(!store) return CTRLRES(CTRLCODES.NOT_OK, 'Storefront not found', 200, -2);

    // check if vendor owner of storefront. Each storefront has an array of owners
    let isOwned = false;
    const ownedStores = await Storefront.find({ owners: { $in: [new OID(vendor)] } });
    for(const storefront of ownedStores) {
        if(storefront._id.toString() === store._id.toString()) {
            isOwned = true;
            break;
        }
    }

    if(!isOwned) return CTRLRES(CTRLCODES.NOT_OK, 'You are not the owner of this storefront', 200, -3);

    ord.state = ord.state | ORDER_STATE_VENDOR_ACCEPTED;
    await ord.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Order accepted', 200, ord.state);
}

async function vendorProductIsReady(order, vendor, pickupPoint) {
    const ord = await Order.findById(order);
    if(!ord) return CTRLRES(CTRLCODES.NOT_OK, 'Order not found', 200, -1);

    const store = await Storefront.findById(ord.storefront);
    if(!store) return CTRLRES(CTRLCODES.NOT_OK, 'Storefront not found', 200, -2);

    // check if vendor owner of storefront. Each storefront has an array of owners
    let isOwned = false;
    const ownedStores = await Storefront.find({ owners: { $in: [new OID(vendor)] } });
    for(const storefront of ownedStores) {
        if(storefront._id.toString() === store._id.toString()) {
            isOwned = true;
            break;
        }
    }

    if(!isOwned) return CTRLRES(CTRLCODES.NOT_OK, 'You are not the owner of this storefront', 200, -3);

    const siteRevenue = ord.paymentBase * REVENUE_PORTION;

    store.sales.count++;
    store.sales.revenue += ord.paymentBase - siteRevenue;

    ord.state = ord.state | ORDER_STATE_VENDOR_PRODUCT_DONE | ORDER_STATE_VENDOR_ACCEPTED;
    ord.pickupPoint = pickupPoint;

    await store.save();
    await ord.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Product is ready', 200, ord.state);
}

async function delivererAcceptDeliveryJob(order, deliverer) {
    const ord = await Order.findById(order);
    if(!ord) return CTRLRES(CTRLCODES.NOT_OK, 'Order not found', 200, -1);

    const dlvr = await User.findById(deliverer);
    if(!dlvr) return CTRLRES(CTRLCODES.NOT_OK, 'Deliverer not found', 200, -2);

    ord.deliverer     = deliverer;
    ord.delivererName = dlvr.firstName + ' ' + dlvr.lastName;
    ord.state = ord.state | ORDER_STATE_DELIVERER_ACCEPT_JOB;
    await ord.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Delivery job accepted', 200, ord.state);
}

async function vendorHandover(order, vendor) {
    const ord = await Order.findById(order);
    if(!ord) return CTRLRES(CTRLCODES.NOT_OK, 'Order not found', 200, -1);

    const store = await Storefront.findById(ord.storefront);
    if(!store) return CTRLRES(CTRLCODES.NOT_OK, 'Storefront not found', 200, -2);

    // check if vendor owner of storefront. Each storefront has an array of owners
    let isOwned = false;
    const ownedStores = await Storefront.find({ owners: { $in: [new OID(vendor)] } });
    for(const storefront of ownedStores) {
        if(storefront._id.toString() === store._id.toString()) {
            isOwned = true;
            break;
        }
    }

    if(!isOwned) return CTRLRES(CTRLCODES.NOT_OK, 'You are not the owner of this storefront', 200, -3);

    ord.state = ord.state | ORDER_STATE_VENDOR_HANDOVER;
    await ord.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Vendor handover done', 200, ord.state);
}

async function delivererReceive(order, deliverer) {
    const ord = await Order.findById(order);
    if(!ord) return CTRLRES(CTRLCODES.NOT_OK, 'Order not found', 200, -1);

    if(ord.deliverer.toString() !== deliverer.toString()) return CTRLRES(CTRLCODES.NOT_OK, 'You are not the deliverer of this order', 200, -2);

    ord.state = ord.state | ORDER_STATE_DELIVERER_RECEIVE;
    await ord.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Deliverer received product', 200, ord.state);
}

async function delivererHandover(order, deliverer) {
    const ord = await Order.findById(order);
    if(!ord) return CTRLRES(CTRLCODES.NOT_OK, 'Order not found', 200, -1);

    if(ord.deliverer.toString() !== deliverer.toString()) return CTRLRES(CTRLCODES.NOT_OK, 'You are not the deliverer of this order', 200, -2);

    ord.state = ord.state | ORDER_STATE_DELIVERER_HANDOVER;
    await ord.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Deliverer handover done', 200, ord.state);
}

async function customerReceive(order, customer) {
    const ord = await Order.findById(order);
    if(!ord) return CTRLRES(CTRLCODES.NOT_OK, 'Order not found', 200, -1);

    if(ord.customer.toString() !== customer.toString()) return CTRLRES(CTRLCODES.NOT_OK, 'You are not the customer of this order', 200, -2);

    ord.state = ord.state | ORDER_STATE_CUSTOMER_RECEIVE;
    await ord.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Customer received product', 200, ord.state);
}

async function acquireOrderMany(search, sortBy, asc, skip, limit, complexKey, complexVal, suppress) {
    const [results, error] = await Order.acquireMany(search, sortBy, asc, skip, limit, complexKey, complexVal, suppress);
    if(error) return CTRLRES(CTRLCODES.NOT_OK, error, 200, -1);
    return CTRLRES(CTRLCODES.SUCCESS, 'OK', 200, results);
}

async function acquireOrderOne(id, suppress) {
    const [result, error] = await Order.acquireOne(id, suppress);
    if(error) return CTRLRES(CTRLCODES.NOT_OK, error, 200, -1);
    return CTRLRES(CTRLCODES.SUCCESS, 'OK', 200, result);
}

const post_customerSubmitOrder        = REQGATE({ func: customerSubmitOrder,        args: '*products, customer:USER_ID, *destination' });
const post_customerCancelOrder        = REQGATE({ func: customerCancelOrder,        args: '*order, customer:USER_ID' });
const post_customerReceive            = REQGATE({ func: customerReceive,            args: '*order, customer:USER_ID' });
const post_vendorAcceptOrder          = REQGATE({ func: vendorAcceptOrder,          args: '*order, vendor:USER_ID' });
const post_vendorProductIsReady       = REQGATE({ func: vendorProductIsReady,       args: '*order, vendor:USER_ID, *pickupPoint' });
const post_vendorHandover             = REQGATE({ func: vendorHandover,             args: '*order, vendor:USER_ID' });
const post_delivererAcceptDeliveryJob = REQGATE({ func: delivererAcceptDeliveryJob, args: '*order, deliverer:USER_ID' });
const post_delivererReceive           = REQGATE({ func: delivererReceive,           args: '*order, deliverer:USER_ID' });
const post_delivererHandover          = REQGATE({ func: delivererHandover,          args: '*order, deliverer:USER_ID' });

const get_acquireOrderMany            = REQGATE({ func: acquireOrderMany,           args: '*search, *sortBy, *asc, *skip, *limit, *complexKey, *complexVal, *suppress' });
const get_acquireOrderOne             = REQGATE({ func: acquireOrderOne,            args: '*id, *suppress' });

module.exports = {
    post_customerSubmitOrder,
    post_customerCancelOrder,
    post_vendorAcceptOrder,
    post_vendorProductIsReady,
    post_delivererAcceptDeliveryJob,
    post_vendorHandover,
    post_delivererReceive,
    post_delivererHandover,
    post_customerReceive,
    
    get_acquireOrderMany,
    get_acquireOrderOne
};