const express = require('express');
const router = express.Router();
const multer = require('multer');
const filestorage = multer.memoryStorage();
const upload = multer({ storage: filestorage });
const sharp = require('sharp');
const authorize = require('../middleware/authorize');
const productController = require('../controllers/productController');
const photosController = require('../controllers/productPhotosController');
const cart = require('../lib/sessionCart');
const editProduct = require('../middleware/editProduct');
const addProducts = require('../middleware/addProduct');

router.get('/', async (req, res) => {
    let products = await productController.getAllProducts();
    req.session.editedProductData = undefined;
    req.session.step = undefined;
    res.render('index', {
        products,
        isloggedin: req.session.valid,
        hasAdminRights: req.session.adminRights,
        cartsize: cart.getCartSize(req.session.cart)
    })
});

router.post('/', async (req, res) => {
    var searchPhrase = req.body.searchPhrase;
    if (!searchPhrase) {
        res.redirect('/');
    } else {
        var foundProducts = await productController.findProductsByNameOrDescription(searchPhrase);
        res.render('index', {
            products: foundProducts,
            isloggedin: req.session.valid,
            hasAdminRights: req.session.adminRights,
            cartsize: cart.getCartSize(req.session.cart)
        })
    }
})

router.get('/product/:id(\\d+)', async (req, res) => {
    var product = await productController.getProductById(req.params.id);
    let { name, description, isavailable, price, photos } = product;
    let currency = '$';
    if (!product || (!isavailable && !req.session.adminRights)) {
        res.render('404', { url: req.url });
    } else {
        res.render('productDetails', {
            id: req.params.id,
            name,
            description,
            price: price.toFixed(2),
            currency,
            isavailable,
            photos,
            isloggedin: req.session.valid,
            hasAdminRights: req.session.adminRights,
            cartsize: cart.getCartSize(req.session.cart)
        });
    }
});

router.get('/product/add', authorize.authenticateAdmin, (req, res) => {
    res.render('addProduct', {
        isloggedin: req.session.valid,
        hasAdminRights: req.session.adminRights,
        cartsize: cart.getCartSize(req.session.cart)
    })
});

router.post('/product/add',
    authorize.authenticateAdmin,
    upload.array('productPhotos', 50),
    addProducts.editProductDataInputs,
    addProducts.verifyProductNameInput,
    addProducts.verifyRestOfInputs,
    (req, res) => {
        let { productname, productdescription, isavailable, productprice } = req.body
        let productPhotosRaw = [],
            productPhotos = [],
            price,
            aviability = isavailable ? true : false;

        if (isNaN(parseFloat(productprice)) || parseFloat(productprice) > 100000 || parseFloat(productprice) < 0) {
            price = 99999.99;
        } else {
            price = parseFloat(productprice).toFixed(2);
        }

        req.files.forEach(file => {
            productPhotosRaw.push({
                buffer: file.buffer
            });
            productPhotos.push(photosController.generateImgSrc(file.mimetype, file.buffer));
        });
        req.session.productPhotos = productPhotosRaw;
        req.session.productData = {
            productname,
            productdescription,
            isavailable: aviability,
            productprice: price
        }
        res.render('addProduct', {
            renderSubmit: true,
            productname,
            productdescription,
            productavaiable: aviability,
            productprice: price,
            productPhotos,
            isloggedin: req.session.valid,
            hasAdminRights: req.session.adminRights,
            cartsize: cart.getCartSize(req.session.cart)
        });
    });

router.post('/product/submitproduct', authorize.authenticateAdmin, async (req, res) => {
    let { productname, productdescription, isavailable, productprice } = req.session.productData;
    let productPhotos = req.session.productPhotos,
        thumbnail = req.body.thumbnail,
        selectedThumbnail,
        blobs = [];

    let thumbnailindex = parseInt(thumbnail);
    if (isNaN(thumbnailindex) || thumbnailindex > productPhotos.length || thumbnailindex < 0) {
        selectedThumbnail = 0;
    } else {
        selectedThumbnail = thumbnailindex;
    }

    for (let i = 0; i < productPhotos.length; i++) {
        const photo = productPhotos[i];
        var resizedPhoto = await sharp(Buffer.from(photo.buffer)).
            resize(400, 400).toFormat('png').toBuffer();
        blobs.push({
            image: photosController.generateImgSrc('jpeg/png', resizedPhoto),
            thumbnail: (selectedThumbnail === i) ? true : false
        });
    }
    req.session.productPhotos = undefined;
    var productId = await productController.createProductWith(productname, productdescription, isavailable, productprice, blobs);
    req.session.productData = undefined
    req.session.productPhotos = undefined;
    res.redirect(`/product/${productId}`);
});

router.post('/addtocart', authorize.authenticateUser, upload.single(), async (req, res) => {
    var productid = req.body.productid;
    if (await productController.isProductAvilable(productid)) {
        if (req.session.cart) {
            if (!req.session.cart[productid]) {
                req.session.cart[productid] = 1;
            } else {
                req.session.cart[productid] += 1;
            }
        }
    }

    if (!cart.isEmpty(req.session.cart)) {
        res.send(`${cart.getCartSize(req.session.cart)}`);
    } else {
        res.send('0');
    }
});

router.post('/product/edit',
    authorize.authenticateAdmin,
    editProduct.rednerEditPage,
    editProduct.deleteProduct,
    editProduct.changeProductData,
    editProduct.deleteProductPhotos,
    upload.array('productPhotos', 50),
    editProduct.addProductPhotos,
    editProduct.thumbnailChoice,
    async (req, res) => {
        res.redirect(`/product/${req.session.productForEdition}`);
        req.session.productForEdition = undefined;
        req.session.productPhotos = undefined;
    });

module.exports = router;