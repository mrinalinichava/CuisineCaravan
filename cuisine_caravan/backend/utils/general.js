const mongoose = require('mongoose');
const OID = mongoose.Types.ObjectId;
const MongooseError = mongoose.Error;

const CTRLCODES = {
    SUCCESS: 0,
    NOT_OK: 1,
    FAILURE: 2,
    WARNING: 3,
    DB_ERROR: 4,
    SUCCESS_HTTP: 5,
    FAILURE_HTTP: 6,
};

Object.freeze(CTRLCODES);

const ROLES = {
    CUSTOMER:  1,
    VENDOR:    2,
    DELIVERER: 3,
    ADMIN:     4,
};

Object.freeze(ROLES);

// Encapsulate Database Operations
async function EDBI(instruction) {
    try {
        return await instruction();
    } catch (err) {
        return [CTRLCODES.DB_ERROR, err];
    }
}

function EDB_IS_ERROR(result) {
    return Array.isArray(result) && result[0] === CTRLCODES.DB_ERROR;
}

function IS_ERROR(result) {
    return Array.isArray(result) && (result[0] === CTRLCODES.FAILURE || result[0] === CTRLCODES.FAILURE_HTTP);
}

const STD_DB_ERROR = [CTRLCODES.FAILURE_HTTP, 'The server encountered an error while processing your request', 500];
const STD_OK       = [CTRLCODES.SUCCESS_HTTP, null, 200];

class ControllerResult {
    constructor(code, msg, httpCode, data, ...misc) {
        this.code = code;
        this.msg = msg;
        this.httpCode = httpCode;
        this.data = data;
        this.misc = misc;
    }
}

function CTRLRES(code, msg, httpCode, data, ...misc) {
    return new ControllerResult(code, msg, httpCode, data, ...misc);
}

function verifyBody(body, props) {
    if(!body) return false;
    if(typeof body !== 'object') return false;
    for(let i = 0; i < props.length; i++) {
        if(!(props[i] in body)) return false;
    }
    return true;
}

function catchMongooseError(func) {
    const wrapper = async (req, res) => {
        try {
            await func(req, res);
        } catch(e) {
            if(e instanceof MongooseError) {
                res.status(500).json({
                    message: 'The server encountered database error while processing your request',
                    serverCode: 5001,
                    serverOK: false
                });
                console.log('Mongoose Error: ' + e.message);
            } else {
                res.status(500).json({
                    message: 'The server encountered an error while processing your request',
                    serverCode: 5002,
                    serverOK: false
                });
                console.log('Unknown Error: ' + e.message);
            }
        }
    }
    return wrapper;
}

class KeyCache {
    constructor() {
        this.cache = new Map();
    }

    insert(key, value) {
        if(this.cache.has(key)) {
            if(!this.cache.get(key).includes(value)) {
                this.cache.get(key).push(value);
            }
        } else {
            this.cache.set(key, [value]);
        }
    }

    deleteKey(key) {
        this.cache.delete(key);
    }

    deleteValue(value) {
        for(let [key, values] of this.cache) {
            let index = values.indexOf(value);
            if(index > -1) {
                values.splice(index, 1);
            }
            if(values.length === 0) {
                this.cache.delete(key);
            }
        }
    }

    getValues(key) {
        return this.cache.get(key);
    }
}

function REQGATE(options) {
    if(!options.func) { throw new Error('REQGATE no function supplied'); }
    if(typeof options.func !== 'function') { throw new Error('REQGATE function supplied is not a function'); }
    const func = options.func; // actual function to be called

    let args = 'args' in options ? options.args : []; // arguments to be passed to func
    if(!Array.isArray(args)) {
        if(typeof args === 'string') {
            args = args.length > 0 ? args.split(',').map(v => v.trim()) : [];
        } else {
            throw new Error('REQGATE args must be an array or string');
        }
    }
    // const auth = 'auth' in options ? options.auth : true;
    const resfunc = 'resfunc' in options ? options.resfunc : null; // result transformation function

    // if(typeof func !== 'function') { throw new Error('REQGATE func must be a function'); }
    // if(!Array.isArray(args)) { throw new Error('REQGATE args must be an array'); }
    // if(typeof auth !== 'boolean') { throw new Error('REQGATE auth must be a boolean'); }
    if(resfunc != null && typeof resfunc !== 'function') { throw new Error('REQGATE resfunc must be a function'); }

    const dtArgs = [];

    const RGX = /(\x2A)?([_$a-zA-Z][_$a-zA-Z0-9]*)(:([_$a-zA-Z][_$a-zA-Z0-9]*))?/;

    for(let i in args) {
        if(!RGX.test(args[i])) { throw new Error('REQGATE invalid argument: ' + args[i]); }
        let matches = RGX.exec(args[i]);

        const mandatory  = matches[1] === '*';
        const identifier = matches[2];
        const doCapture  = matches[3] !== undefined;
        const captureVal = matches[4];

        dtArgs.push({ mandatory, identifier, doCapture, captureVal });
    }

    // console.log(dtArgs);

    const expressfn = async (req, res) => {
        const body = req.body;
        const query = req.query;
        const argVals = [];

        for(let i in dtArgs) {
            const arg = dtArgs[i];
            if(arg.mandatory && !arg.doCapture) {
                if(!(arg.identifier in body || arg.identifier in query)) {
                    return res.status(400).json({
                        message: `Bad Request, missing mandatory deliverable: ${arg.identifier}`,
                        serverCode: 4001,
                        serverOK: true
                    });
                }
            }
            let val = null;
            if(arg.doCapture) {
                val = req[arg.captureVal];
            } else {
                val = body[arg.identifier] || query[arg.identifier] || null;
            }
            argVals.push(val);
        }
        // TODO: pass generic errors
        try {
            const result = await func(...argVals);
            // console.log(result);
            if(result.code === CTRLCODES.SUCCESS) {
                try {
                    const respLoad = resfunc ? resfunc(result.data) : result.data;
                    return res.status(200).json({
                        message: 'Success',
                        serverCode: 2000,
                        serverOK: true,
                        payload: respLoad
                    });
                } catch(e) {
                    console.log('Error executing transformer function: ' + e.message);
                    return res.status(500).json({
                        message: 'The server encountered an error while processing your request',
                        serverCode: 5002,
                        serverOK: false
                    });
                }
            } else if(result.code === CTRLCODES.NOT_OK) {
                return res.status(400).json({
                    message: result.msg,
                    serverCode: 2301,
                    serverOK: true
                });
            } else {
                // console.log(result);
                return res.status(500).json({
                    message: 'Internal Server Error',
                    serverCode: 5001,
                    serverOK: false
                });
            }
        } catch(e) {
            if(e instanceof MongooseError) {
                res.status(500).json({
                    message: 'The server encountered database error while processing your request',
                    serverCode: 5001,
                    serverOK: false
                });
                console.log('Mongoose Error: ' + e.message);
                console.log(e.stack);
            } else {
                res.status(500).json({
                    message: 'The server encountered an error while processing your request',
                    serverCode: 5002,
                    serverOK: false
                });
                console.log('Unknown Error: ' + e.message);
                console.log(e.stack);
            }
            return;
        }
    };

    return expressfn;
}

const extractAG = (field) => {
    if(!field) return null;
    if(typeof field === 'object' && field.hasOwnProperty('0')) {
        return field['0'];
    } else {
        return null;
    }
    // if(Array.isArray(field)) {
    //     return field.length > 0 ? field[0] : null;
    // } else 
};

function validateCmplx(_key, _val) {
    let keyType = typeof _key;
    let valType = typeof _val;
    keyType = Array.isArray(_key) ? 'array' : keyType;
    valType = Array.isArray(_val) ? 'array' : valType;

    let ok  = false;
    let str = false;
    let msg = 'mismatched types';

    if(keyType === 'string' && valType === 'string') {
        ok  = true;
        str = true;
        msg = null;
    } else if(keyType === 'array' && valType === 'array') {
        if(_key.length === _val.length) {
            ok  = true;
            str = false;
            msg = null;
        }
    }

    return { ok, str, msg };
}

function genericAcquireMany(Model, ComplexesMany, schemaPaths, defaultSort) {
    return async (search, sortBy, asc, skip, limit, complexKey, complexVal, suppress) => {
        const searchOrMatch = search ? { $text: { $search: search } } : null;
        const agList = [];
    
        let _order    = 1;
        let _skip     = 0;
        let _limit    = 20;
        let _complex  = [];
        let _sorting  = null;
        let _suppress = null;
    
        try {
            _skip = Number(skip);
            _skip = _skip < 0 ? 0 : _skip;
    
            _limit = Number(limit);
            _limit = _limit <= 0 ? 20 : _limit;
    
            _order = Boolean(asc) ? 1 : -1;
                
            const validation = validateCmplx(complexKey, complexVal);

            if(!validation.ok) {
                return [null, validation.msg];
            } else {
                if(validation.str) {
                    if(complexVal && complexKey in ComplexesMany) {
                        _complex.push(ComplexesMany[complexKey](complexVal));
                    }
                } else {
                    complexKey.forEach((key, i) => {
                        if(complexVal[i] && key in ComplexesMany) {
                            _complex.push(ComplexesMany[key](complexVal[i]));
                        }
                    });
                }
            }

            if(suppress && Array.isArray(suppress) && suppress.length > 0) {
                _suppress = Object.assign({}, ...suppress.map(key => ({ [key]: 0 })));
            }
        } catch(e) {
            console.error(e);
            return [null, 'malformed query criteria'];
        }
    
        if(schemaPaths.includes(sortBy)) {
            _sorting = { [sortBy]: _order };
        } else {
            _sorting = { [defaultSort]: _order };
        }
    
        if(searchOrMatch) agList.push({ $match:   searchOrMatch });
        _complex.forEach(complex => agList.push({ $match: complex }));
        if(_sorting)      agList.push({ $sort:    _sorting });
        if(_suppress)     agList.push({ $project: _suppress });
        agList.push({ $skip: _skip });
        agList.push({ $limit: _limit });

        // console.log(_complex);
        
        const results = await Model.aggregate(agList);
        return [results, null];
    };
}

function genericAcquireOne(Model) {
    return async (id, suppress) => {
        let _id = null;
        let _suppress = null;
    
        try {
            _id = new OID(id);
            if(suppress && Array.isArray(suppress) && suppress.length > 0) {
                _suppress = Object.assign({}, ...suppress.map(key => ({ [key]: 0 })));
            }
        } catch(e) {
            return [null, 'malformed id or suppression'];
        }
    
        const agList = [{ $match: { _id: _id } }];
        if(_suppress) agList.push({ $project: _suppress });
    
    
        const result = await Model.aggregate(agList);
        return [result.length ? result[0] : null, null];
    };
}

module.exports = {
    CTRLCODES,
    ROLES,
    EDBI,
    EDB_IS_ERROR,
    IS_ERROR,
    STD_DB_ERROR,
    STD_OK,
    ControllerResult,
    CTRLRES,
    verifyBody,
    catchMongooseError,
    KeyCache,
    REQGATE,
    extractAG,
    genericAcquireMany,
    genericAcquireOne
};