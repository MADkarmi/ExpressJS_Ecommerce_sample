const productController = require('../controllers/productController');
const messages = require("../lib/messages");
const cart = require('../lib/sessionCart');

module.exports = {
    editProductDataInputs: (req, res, next) => {
        if (req.body.edit && req.body.edit==='true') {
            let { productname, productdescription, isavailable, productprice } = req.session.productData;
            res.render('addProduct', {
                productNotInDB: true,
                productname,
                productdescription,
                isavailable,
                productprice,
                isloggedin: req.session.valid,
                hasAdminRights: req.session.adminRights,
                cartsize: cart.getCartSize(req.session.cart)
            });
        }
        else {
            next();
        }
    },

    verifyProductNameInput: async (req, res, next) => {
        var isloggedin = req.session.valid, hasAdminRights = req.session.adminRights;
        let cartsize = cart.getCartSize(req.session.cart);
        if (req.body.productname === '') {
            res.render('addProduct', {
                message: messages.fieldValuesMustNotBeEmpty,
                isloggedin,
                hasAdminRights,
                cartsize
            });
        } else {
            var productInDB = await productController.getProductsCount(req.body.productname);
            if (!productInDB) {
                next();
            } else {
                res.render('addProduct', {
                    message: messages.productWithThisNameExists,
                    isloggedin,
                    hasAdminRights,
                    cartsize
                });
            }
        }
    },

    verifyRestOfInputs: (req, res, next) => {
        var isloggedin = req.session.valid,
            hasAdminRights = req.session.adminRights,
            cartsize = cart.getCartSize(req.session.cart);

        if (req.body.productname && !req.body.productdescription) {
            res.render('addProduct', {
                productNotInDB: true,
                productname: req.body.productname,
                isloggedin,
                hasAdminRights,
                cartsize
            });
        } else if (req.body.productdescription  === '' || req.files.length === 0) {
            res.render('addProduct', {
                productNotInDB: true,
                productname: req.body.productname,
                productdescription: req.body.productdescription,
                isavailable: req.body.isavailable,
                productprice: req.body.productprice,
                message: messages.fieldValuesMustNotBeEmpty,
                isloggedin,
                hasAdminRights,
                cartsize
            });
        } else {
            next();
        }
    }
}