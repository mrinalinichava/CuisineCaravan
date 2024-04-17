const User = require('../models/User');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { CTRLCODES, CTRLRES, REQGATE } = require('../utils/general');

const JWT_SECRET  = process.env.JWT_SECRET || "eyJhbGciOiJIUzI1NiJ9-keyy-asd";;
const SALT_ROUNDS = 10;

async function register(firstName, lastName, userName, email, password, category) {
    const existingUsername = await User.findOne({ userName: userName });
    if(existingUsername) {
        return CTRLRES(CTRLCODES.NOT_OK, 'Username already exists', 200, -1);
    }
    
    password = bcrypt.hashSync(password, SALT_ROUNDS);

    const user = new User({ firstName, lastName, userName, email, password, category });
    await user.save();
    delete user.password;
    return CTRLRES(CTRLCODES.SUCCESS, 'User created', 200, {
        userID: user._id
    });
}

async function login(userName, password) {
    const user = await User.findOne({ userName: userName });

    if(!user) return CTRLRES(CTRLCODES.NOT_OK, 'User not found', 200, -1);

    // if(password !== user.password) return CTRLRES(CTRLCODES.NOT_OK, 'Incorrect password', 200, -2);
    if(!bcrypt.compareSync(password, user.password)) return CTRLRES(CTRLCODES.NOT_OK, 'Incorrect password', 200, -2);

    const payload = `${user.category}|${user._id}`;
    let token;
    try { token = jwt.sign(payload, JWT_SECRET) ; }
    catch(e) { return CTRLRES(CTRLCODES.FAILURE, 'Token generation failed', 500, -3); }

    delete user.password;

    return CTRLRES(CTRLCODES.SUCCESS, 'Login successful', 200, {
        token: `Bearer ${token}`,
        userName:  user.userName,
        firstName: user.firstName,
        lastName:  user.lastName,
        category:  user.category,
        userID:    user._id,
        email:     user.email
    });
}

async function forgotPassword(id, newPassword) {
    const user = await User.findById(id);
    if(!user) return CTRLRES(CTRLCODES.NOT_OK, 'User not found', 200, -1);

    user.password = newPassword;
    await user.save();
    return CTRLRES(CTRLCODES.SUCCESS, 'Password changed', 200, null);
}

async function getUserInfo(id) {
    const user = await User.findById(id);
    if(!user) return CTRLRES(CTRLCODES.NOT_OK, 'User not found', 200, -1);
    delete user.password;
    return CTRLRES(CTRLCODES.SUCCESS, 'User found', 200, {
        firstName: user.firstName,
        lastName:  user.lastName,
        userName:  user.userName,
        email:     user.email,
        category:  user.category
    });
}

function verifyJWT(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if(!bearerHeader) {
        return res.status(401).json({
            message: 'Unauthorized Access, no Authorization header found or empty token',
            serverCode: 4010,
            serverOK: true
        });
    }

    const fields = bearerHeader.split(' ');

    if(fields.length < 2 || fields[0] !== 'Bearer') {
        return res.status(401).json({
            message: 'Unauthorized Access, invalid Authorization header format',
            serverCode: 4010,
            serverOK: true
        });
    }

    const token = fields[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const [category, id] = payload.split('|');
        req.USER_CATEGORY = parseInt(category);
        req.USER_ID = id;
        next();
    } catch(e) {
        console.log(e);
        return res.status(401).json({
            message: 'Unauthorized Access, invalid token',
            serverCode: 4011,
            serverOK: true
        });
    }
}

const post_register       = REQGATE({ func: register,       args: '*firstName, *lastName, *userName, *email, *password, *category' });
const post_login          = REQGATE({ func: login,          args: '*userName, *password' });
const post_forgotPassword = REQGATE({ func: forgotPassword, args: 'id:USER_ID, *newPassword' });
const get_userInfo        = REQGATE({ func: getUserInfo,    args: 'id:USER_ID' });

module.exports = {
    verifyJWT,
    post_register,
    post_login,
    post_forgotPassword,
    get_userInfo
};