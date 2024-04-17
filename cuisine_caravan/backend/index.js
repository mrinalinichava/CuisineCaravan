const express = require('express')
const bodyParser = require('body-parser')
const connectDB = require('./db')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const uuidv4 = require('uuid').v4

const { verifyJWT, post_register, post_login, post_forgotPassword, get_userInfo } = require('./controllers/User')
const {
    post_createStorefront, post_updateStorefront, post_deleteStorefront,
    post_addReview, post_updateReview, post_deleteReview, post_addReport,
    post_addProduct, post_updateProduct, post_deleteProduct,
    post_addCollaborator, post_removeCollaborator,
    get_acquireStorefrontMany,
    get_acquireStorefrontOne,
    get_acquireProductMany,
    get_acquireProductOne,
    get_acquireReviewMany,
    get_acquireReviewOne,
    get_acquireReportMany
} = require('./controllers/Storefront')
const {
    post_customerSubmitOrder, post_customerCancelOrder, post_vendorAcceptOrder, post_vendorProductIsReady, post_delivererAcceptDeliveryJob,
    post_vendorHandover, post_delivererReceive, post_delivererHandover, post_customerReceive,
    get_acquireOrderMany,
    get_acquireOrderOne
} = require('./controllers/Order')

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const DBLINK = process.env.DBLINK
const port   = parseInt(process.env.PORT) || 8080
const REACT_BUILD_FOLDER = "build"

const app = express()
const upload = multer({
    limits: { fileSize: 8 * 1024 * 1024 },
    storage: multer.diskStorage({
        filename: (_, file, cb) => {
            cb(null, uuidv4() + path.extname(file.originalname))
        },
        destination: (_, __, cb) => {
            cb(null, 'uploads/')
        }
    })
})
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/imgs',   express.static('uploads'))
app.use('/photos', express.static('imgstatic'))
app.use(express.static(path.join(__dirname, REACT_BUILD_FOLDER)));


app.post('/register',       post_register)
app.post('/signin',         post_login)
app.post('/forgotPassword', verifyJWT, post_forgotPassword)
app.get('/userInfo',        verifyJWT, get_userInfo)

app.post('/cstore',        verifyJWT, post_createStorefront)
app.post('/ustore',        verifyJWT, post_updateStorefront)
app.post('/dstore',        verifyJWT, post_deleteStorefront)
app.post('/addProduct',    verifyJWT, post_addProduct)
app.post('/updateProduct', verifyJWT, post_updateProduct)
app.post('/deleteProduct', verifyJWT, post_deleteProduct)
app.post('/addReview',     verifyJWT, post_addReview)
app.post('/addReport',     verifyJWT, post_addReport)
app.post('/updateReview',  verifyJWT, post_updateReview)
app.post('/deleteReview',  verifyJWT, post_deleteReview)
app.post('/addCollab',     verifyJWT, post_addCollaborator)
app.post('/removeCollab',  verifyJWT, post_removeCollaborator)

app.post('/acquireStorefrontMany',      get_acquireStorefrontMany)
app.post('/acquireStorefrontOneAuth',   verifyJWT, get_acquireStorefrontOne)
app.post('/acquireStorefrontOne',       get_acquireStorefrontOne)
app.post('/acquireProductMany',         get_acquireProductMany)
app.post('/acquireProductOne',          get_acquireProductOne)
app.post('/acquireReviewMany',          get_acquireReviewMany)
app.post('/acquireReviewOne',           get_acquireReviewOne)
app.post('/acquireReportMany',          get_acquireReportMany)

app.post('/cSubOrder',          verifyJWT, post_customerSubmitOrder)
app.post('/cCancelOrder',       verifyJWT, post_customerCancelOrder)
app.post('/vAcceptOrder',       verifyJWT, post_vendorAcceptOrder)
app.post('/vProductIsReady',    verifyJWT, post_vendorProductIsReady)
app.post('/dAcceptDeliveryJob', verifyJWT, post_delivererAcceptDeliveryJob)
app.post('/vHandover',          verifyJWT, post_vendorHandover)
app.post('/dReceive',           verifyJWT, post_delivererReceive)
app.post('/dHandover',          verifyJWT, post_delivererHandover)
app.post('/cReceive',           verifyJWT, post_customerReceive)

app.post('/acquireOrderMany', verifyJWT, get_acquireOrderMany)
app.post('/acquireOrderOne',  verifyJWT, get_acquireOrderOne)

app.post('/photos', upload.array('image', 8), (req, res) => {
    console.log(req.files)
    res.send({ message: 'Files uploaded successfully', files: req.files })
})

app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, REACT_BUILD_FOLDER, 'index.html'));
})

connectDB(DBLINK).then(() => {
    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`)
    })
})