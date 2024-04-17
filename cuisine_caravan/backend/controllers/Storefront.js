const fs = require('fs');
const path = require('path');
const OID = require('mongoose').Types.ObjectId;
const Storefront = require('../models/Storefront');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Report = require('../models/Report');
const User = require('../models/User');
const { CTRLCODES, ROLES, CTRLRES, REQGATE } = require('../utils/general');

const uploadedLocation = './uploads/';

function insertArrayUnique(array, val) {
    if(!array || !Array.isArray(array) || array.length === 0) return [val];
    if(array.findIndex(item => item === val) === -1) array.push(val);
    return array;
}

async function createStorefront(ownerID, name, description, tags, iconFLID, bannerFLID, addresses) {
    const storefront = new Storefront({
        owners:      [new OID(ownerID)],
        name:        name,
        description: description,
        tags:        tags,
        iconFLID:    iconFLID,
        bannerFLID:  bannerFLID,
        addresses:   addresses,
        rating:      { count: 0, average: 0 }
    });
    await storefront.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Storefront created', 200, storefront);
}

async function updateStorefront(storefrontID, ownerID, name, description, tags, iconFLID, bannerFLID, addresses) {
    const storefront = await Storefront.findById(storefrontID);

    if(!storefront) return CTRLRES(CTRLCODES.NOT_OK, 'Storefront not found', 200, -1);
    if(storefront.owners.findIndex(owner => owner.toString() === ownerID) === -1) return CTRLRES(CTRLCODES.NOT_OK, 'User not owner of storefront', 200, -2);

    // if(iconFLID !== storefront.iconFLID)     fs.unlink(path.join(uploadedLocation, storefront.iconFLID), err => {});
    // if(bannerFLID !== storefront.bannerFLID) fs.unlink(path.join(uploadedLocation, storefront.bannerFLID), err => {});

    storefront.name        = name;
    storefront.description = description;
    storefront.tags        = tags;
    storefront.iconFLID    = iconFLID;
    storefront.bannerFLID  = bannerFLID;
    storefront.addresses   = addresses;
    await storefront.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Storefront updated', 200, storefront);
}

async function addCollaborator(storefrontID, ownerID, collaboratorUserName) {
    const storefront = await Storefront.findById(storefrontID);
    if(!storefront) return CTRLRES(CTRLCODES.NOT_OK, 'Storefront not found', 200, -1);
    if(storefront.owners.findIndex(owner => owner.toString() === ownerID) === -1) return CTRLRES(CTRLCODES.NOT_OK, 'User not owner of storefront', 200, -2);

    const user = await User.findOne({ userName: collaboratorUserName });
    if(!user) return CTRLRES(CTRLCODES.NOT_OK, 'User not found', 200, -3);

    if(storefront.owners.findIndex(owner => owner.toString() === user._id.toString()) !== -1) return CTRLRES(CTRLCODES.NOT_OK, 'User already an owner of storefront', 200, -4);

    storefront.owners.push(user._id);
    await storefront.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'User added as collaborator', 200, user);
}

async function removeCollaborator(storefrontID, ownerID, collaboratorID) {
    const storefront = await Storefront.findById(storefrontID);
    if(!storefront) return CTRLRES(CTRLCODES.NOT_OK, 'Storefront not found', 200, -1);
    if(storefront.owners.findIndex(owner => owner.toString() === ownerID) === -1) return CTRLRES(CTRLCODES.NOT_OK, 'User not owner of storefront', 200, -2);

    storefront.owners = storefront.owners.filter(owner => owner.toString() !== collaboratorID);
    await storefront.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'User removed as collaborator', 200, storefront);
}

async function deleteStorefront(storefrontID, ownerID) {
    const storefront = await Storefront.findById(storefrontID);

    if(!storefront) return CTRLRES(CTRLCODES.NOT_OK, 'Storefront not found', 200, -1);
    if(storefront.owners.findIndex(owner => owner.toString() === ownerID) === -1) return CTRLRES(CTRLCODES.NOT_OK, 'User not owner of storefront', 200, -2);


    await storefront.remove();
    return CTRLRES(CTRLCODES.SUCCESS, 'Storefront deleted', 200, storefront);
}

async function addReview(storefrontID, by, rating, title, description) {
    const storefront = await Storefront.findById(storefrontID);
    if(!storefront) return CTRLRES(CTRLCODES.NOT_OK, 'Storefront not found', 200, -1);

    const reviewer = await User.findById(by);
    if(!reviewer) return CTRLRES(CTRLCODES.NOT_OK, 'User not found', 200, -2);

    const review = new Review({
        storefront:  storefrontID,
        by:          by,
        byName:      reviewer.firstName + ' ' + reviewer.lastName,
        rating:      rating,
        title:       title,
        description: description || ''
    });
    await review.save();
    storefront.rating.count++;
    storefront.rating.average = (storefront.rating.average * (storefront.rating.count - 1) + rating) / storefront.rating.count;
    await storefront.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Review created', 200, review);
}

async function addReport(storefrontID, by, title, description) {
    const storefront = await Storefront.findById(storefrontID);
    if(!storefront) return CTRLRES(CTRLCODES.NOT_OK, 'Storefront not found', 200, -1);

    const reporter = await User.findById(by);
    if(!reporter) return CTRLRES(CTRLCODES.NOT_OK, 'User not found', 200, -2);

    const report = new Report({
        storefront:  storefrontID,
        by:          by,
        byName:      reporter.firstName + ' ' + reporter.lastName,
        title:       title,
        description: description || ''
    });
    await report.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Report created', 200, report);
}

async function updateReview(reviewID, by, rating, title, description) {
    const review = await Review.findById(reviewID);
    if(!review)                     return CTRLRES(CTRLCODES.NOT_OK, 'Review not found', 200, -1);
    if(review.by.toString() !== by) return CTRLRES(CTRLCODES.NOT_OK, 'User not owner of review', 200, -2);
    const storefront = await Storefront.findById(review.storefront);
    if(!storefront)                 return CTRLRES(CTRLCODES.NOT_OK, 'Storefront not found', 200, -3);

    const _oldRating = review.rating;

    review.rating      = rating;
    review.title       = title;
    review.description = description;
    await review.save();
    // storefront.count stays unchanged
    // but average is updated
    storefront.rating.average = (storefront.rating.average * storefront.rating.count + rating - _oldRating) / storefront.rating.count;
    await storefront.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Review updated', 200, review);
}

async function deleteReview(reviewID, by) {
    const review = await Review.findById(reviewID);
    if(!review)                                return CTRLRES(CTRLCODES.NOT_OK, 'Review not found', 200, -1);
    if(review.by.toString() !== by)            return CTRLRES(CTRLCODES.NOT_OK, 'User not owner of review', 200, -2);
    const storefront = await Storefront.findById(review.storefront);
    if(!storefront)                            return CTRLRES(CTRLCODES.NOT_OK, 'Storefront not found', 200, -3);

    storefront.rating.count--;
    storefront.rating.average = (storefront.rating.average * (storefront.rating.count + 1) - review.rating) / storefront.rating.count;
    await review.remove();
    await storefront.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Review deleted', 200, review);
}

async function addProduct(storefrontID, ownerID, name, description, price, available, imageFLIDs, previewIMG) {
    const storefront = await Storefront.findById(storefrontID);

    if(!storefront) return CTRLRES(CTRLCODES.NOT_OK, 'Storefront not found', 200, -1);
    if(storefront.owners.findIndex(owner => owner.toString() === ownerID) === -1) return CTRLRES(CTRLCODES.NOT_OK, 'User not owner of storefront', 200, -2);
    if(imageFLIDs && !Array.isArray(imageFLIDs)) return CTRLRES(CTRLCODES.NOT_OK, 'ImageFLIDs must be an array',  200, -4);

    const product = new Product({
        storefront:     storefrontID,
        storefrontName: storefront.name,
        name:           name,
        description:    description,
        price:          price,
        available:      available,
        imageFLIDs:     imageFLIDs || [],
        previewIMG:     previewIMG || ''
    });
    await product.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Product created', 200, product);
}

async function updateProduct(productID, ownerID, name, description, price, available, imageFLIDs, previewIMG) {
    const product = await Product.findById(productID);
    if(!product)                                return CTRLRES(CTRLCODES.NOT_OK, 'Product not found', 200, -1);
    const storefront = await Storefront.findById(product.storefront);
    if(!storefront)                             return CTRLRES(CTRLCODES.NOT_OK, 'Storefront not found', 200, -2);
    if(storefront.owners.findIndex(owner => owner.toString() === ownerID) === -1) return CTRLRES(CTRLCODES.NOT_OK, 'User not owner of storefront', 200, -2);
    if(!Array.isArray(imageFLIDs))              return CTRLRES(CTRLCODES.NOT_OK, 'ImageFLIDs must be an array', 200, -4);

    // product.imageFLIDs.forEach(imageFLID => {
    //     if(!imageFLIDs.includes(imageFLID)) fs.unlink(path.join(uploadedLocation, imageFLID), err => {});
    // });
    // if(product.previewIMG !== previewIMG) fs.unlink(path.join(uploadedLocation, product.previewIMG), err => {});

    product.name        = name;
    product.description = description;
    product.price       = price;
    product.available   = available;
    product.imageFLIDs  = imageFLIDs;
    product.previewIMG  = previewIMG;
    await product.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Product updated', 200, product);
}

async function deleteProduct(productID, ownerID) {
    const product = await Product.findById(productID);
    if(!product)                                return CTRLRES(CTRLCODES.NOT_OK, 'Product not found', 200, -1);
    const storefront = await Storefront.findById(product.storefront);
    if(!storefront)                             return CTRLRES(CTRLCODES.NOT_OK, 'Storefront not found', 200, -2);
    if(storefront.owners.findIndex(owner => owner.toString() === ownerID) === -1) return CTRLRES(CTRLCODES.NOT_OK, 'User not owner of storefront', 200, -2);
    
    await product.remove();
    return CTRLRES(CTRLCODES.SUCCESS, 'Product deleted', 200, product);
}

async function acquireStorefrontMany(search, sortBy, asc, skip, limit, complexKey, complexVal, suppress) {
    suppress = insertArrayUnique(suppress, 'owners');
    const [results, error] = await Storefront.acquireMany(search, sortBy, asc, skip, limit, complexKey, complexVal, suppress);
    if(error) return CTRLRES(CTRLCODES.NOT_OK, error, 200, -1);
    return CTRLRES(CTRLCODES.SUCCESS, 'OK', 200, results);
}

async function acquireStorefrontOne(userID, userCAT, id, suppress) {
    const [result, error] = await Storefront.acquireOne(id, suppress);
    if(error || !result) return CTRLRES(CTRLCODES.NOT_OK, error, 200, -1);

    if(!userID) return CTRLRES(CTRLCODES.SUCCESS, 'OK', 200, result);

    const isVendor = userCAT === ROLES.VENDOR;
    const isOwner  = result.owners.map(owner => owner.toString()).includes(userID);

    if(!(isVendor && isOwner)) {
        result.owners = undefined;
    }

    return CTRLRES(CTRLCODES.SUCCESS, 'OK', 200, result);
}

async function acquireProductMany(search, sortBy, asc, skip, limit, complexKey, complexVal, suppress) {
    const [results, error] = await Product.acquireMany(search, sortBy, asc, skip, limit, complexKey, complexVal, suppress);
    if(error) return CTRLRES(CTRLCODES.NOT_OK, error, 200, -1);
    return CTRLRES(CTRLCODES.SUCCESS, 'OK', 200, results);
}

async function acquireProductOne(id, suppress) {
    const [result, error] = await Product.acquireOne(id, suppress);
    if(error || !result) return CTRLRES(CTRLCODES.NOT_OK, error, 200, -1);
    return CTRLRES(CTRLCODES.SUCCESS, 'OK', 200, result);
}

async function acquireReviewMany(search, sortBy, asc, skip, limit, complexKey, complexVal, suppress) {
    const [results, error] = await Review.acquireMany(search, sortBy, asc, skip, limit, complexKey, complexVal, suppress);
    if(error) return CTRLRES(CTRLCODES.NOT_OK, error, 200, -1);
    return CTRLRES(CTRLCODES.SUCCESS, 'OK', 200, results);
}

async function acquireReportMany(search, sortBy, asc, skip, limit, complexKey, complexVal, suppress) {
    const [results, error] = await Report.acquireMany(search, sortBy, asc, skip, limit, complexKey, complexVal, suppress);
    if(error) return CTRLRES(CTRLCODES.NOT_OK, error, 200, -1);
    return CTRLRES(CTRLCODES.SUCCESS, 'OK', 200, results);
}

async function acquireReviewOne(id, suppress) {
    const [result, error] = await Review.acquireOne(id, suppress);
    if(error || !result) return CTRLRES(CTRLCODES.NOT_OK, error, 200, -1);
    return CTRLRES(CTRLCODES.SUCCESS, 'OK', 200, result);
}

const post_createStorefront   = REQGATE({ func: createStorefront,   args: 'ownerID:USER_ID, *name, description, tags, iconFLID, bannerFLID, *addresses' });
const post_updateStorefront   = REQGATE({ func: updateStorefront,   args: '*storefrontID, ownerID:USER_ID, *name, description, tags, iconFLID, bannerFLID, *addresses' });
const post_deleteStorefront   = REQGATE({ func: deleteStorefront,   args: '*storefrontID, ownerID:USER_ID' });
const post_addReview          = REQGATE({ func: addReview,          args: '*storefrontID, by:USER_ID, *rating, *title, description' });
const post_addReport          = REQGATE({ func: addReport,          args: '*storefrontID, by:USER_ID,          *title, description' });
const post_updateReview       = REQGATE({ func: updateReview,       args: '*reviewID,     by:USER_ID, *rating, *title, description' });
const post_deleteReview       = REQGATE({ func: deleteReview,       args: '*reviewID,     by:USER_ID' });
const post_addProduct         = REQGATE({ func: addProduct,         args: '*storefrontID, ownerID:USER_ID, *name, description, *price, *available, imageFLIDs, previewIMG' });
const post_updateProduct      = REQGATE({ func: updateProduct,      args: '*productID,    ownerID:USER_ID, *name, description, *price, *available, imageFLIDs, previewIMG' });
const post_deleteProduct      = REQGATE({ func: deleteProduct,      args: '*productID,    ownerID:USER_ID' });
const post_addCollaborator    = REQGATE({ func: addCollaborator,    args: '*storefrontID, ownerID:USER_ID, *collaboratorUserName' });
const post_removeCollaborator = REQGATE({ func: removeCollaborator, args: '*storefrontID, ownerID:USER_ID, *collaboratorID' });

const get_acquireStorefrontMany = REQGATE({ func: acquireStorefrontMany, args: '*search, *sortBy, *asc, *skip, *limit, *complexKey, *complexVal, *suppress' });
const get_acquireStorefrontOne  = REQGATE({ func: acquireStorefrontOne,  args: 'userID:USER_ID, userCAT:USER_CATEGORY, *id, *suppress' });
const get_acquireProductMany    = REQGATE({ func: acquireProductMany,    args: '*search, *sortBy, *asc, *skip, *limit, *complexKey, *complexVal, *suppress' });
const get_acquireProductOne     = REQGATE({ func: acquireProductOne,     args: '*id, *suppress' });
const get_acquireReviewMany     = REQGATE({ func: acquireReviewMany,     args: '*search, *sortBy, *asc, *skip, *limit, *complexKey, *complexVal, *suppress' });
const get_acquireReviewOne      = REQGATE({ func: acquireReviewOne,      args: '*id, *suppress' });
const get_acquireReportMany     = REQGATE({ func: acquireReportMany,     args: '*search, *sortBy, *asc, *skip, *limit, *complexKey, *complexVal, *suppress' });

module.exports = {
    post_createStorefront,
    post_updateStorefront,
    post_deleteStorefront,
    post_addReview,
    post_addReport,
    post_updateReview,
    post_deleteReview,
    post_addProduct,
    post_updateProduct,
    post_deleteProduct,
    post_addCollaborator,
    post_removeCollaborator,

    get_acquireStorefrontMany,
    get_acquireStorefrontOne,
    get_acquireProductMany,
    get_acquireProductOne,
    get_acquireReviewMany,
    get_acquireReviewOne,
    get_acquireReportMany
};