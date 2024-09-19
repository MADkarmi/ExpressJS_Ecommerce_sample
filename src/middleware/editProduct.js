
const productController = require('../controllers/productController');
const photosController = require('../controllers/productPhotosController');
const messages = require("../lib/messages");
const sharp = require('sharp');

module.exports = {
    rednerEditPage: async (req, res, next) => {
        if (req.body.productid) {
            req.session.productForEdition = req.body.productid;
            res.render('editProduct', {
                renderButtons: true,
                canDeletePhoto: (await photosController.countProductPhotos(req.session.productForEdition) > 1)
            });
        } else {
            next();
        }
    },

    changeProductData: async (req, res, next) => {
        if (req.body.editProductData === 'true') {
            if (req.body.productname === undefined) {
                var product = await productController.getProductById(req.session.productForEdition);
                res.render('editProduct', {
                    productname: product.name,
                    productdescription: product.description,
                    isavailable: product.isavailable,
                    productprice: product.price,
                    renderEditProductData: true
                });
            } else {
                var message = await validate(req);
                if (message) {
                    res.render('editProduct', {
                        productname: req.body.productname,
                        productdescription: req.body.productdescription,
                        isavailable: req.body.isavailable,
                        productprice: req.body.productprice,
                        message: message,
                        renderEditProductData: true
                    });
                } else {
                    await productController.updateProductData(req.session.productForEdition,
                        req.body.productname,
                        req.body.productdescription,
                        req.body.isavailable ? true : false,
                        req.body.productprice);
                    res.redirect(`/product/${req.session.productForEdition}`);
                    req.session.productPhotos = undefined;
                    req.session.productForEdition = undefined;
                }
            }
        } else {
            next();
        }
    },

    deleteProduct: async (req, res, next) => {
        if(req.body.deleteProduct ==='true'){
            await productController.dropProduct(req.session.productForEdition);
            req.session.productForEdition = undefined;
            res.redirect('/');            
        }else{
            next();
        }
    },

    deleteProductPhotos: async (req, res, next) => {
        if (req.body.deletePhotos === 'true') {
            if (req.body.photosToDelete === undefined) {
                var productPhotos = await photosController.getAllPhotosForProduct(req.session.productForEdition);
                req.session.productPhotosLength = productPhotos.length;
                res.render('editProduct', {
                    productPhotos,
                    renderDeletePhotos: true
                });
            } else {
                if (req.body.photosToDelete.length === req.session.productPhotosLength) {
                    res.render('editProduct', {
                        productPhotos: await photosController.getAllPhotosForProduct(req.session.productForEdition),
                        renderDeletePhotos: true,
                        message: messages.cantDeleteAllPhotos
                    });
                } else {
                    await photosController.deletePhotos(req.body.photosToDelete);
                    req.body.thumbnailChoice = 'true';
                    req.session.productPhotosLength = undefined;
                    next();
                }
            }
        }
        else {
            next();
        }
    },

    addProductPhotos: async (req, res, next) => {
        if (req.body.addPhotos === 'true') {
            if (req.files === undefined) {
                res.render('editProduct', {
                    renderAddPhotos: true
                });
            } else {
                var blobs = [];
                for (var i = 0; i < req.files.length; i++) {
                    var resisedPhoto = await sharp(req.files[i].buffer).resize(400, 400).toFormat('png').toBuffer();
                    blobs.push({
                        image: photosController.generateImgSrc('jpeg/png', resisedPhoto),
                        thumbnail: false,
                        productId: req.session.productForEdition
                    });
                }
                await photosController.addPhotosForProduct(blobs);
                req.body.thumbnailChoice = 'true';
                next();
            }
        } else {
            next();
        }
    },

    thumbnailChoice: async (req, res, next) => {
        if (req.body.thumbnailChoice === 'true') {
            if (req.body.thumbnail === undefined) {
                var productPhotos = await photosController.getAllPhotosForProduct(req.session.productForEdition);
                req.session.photosids = [];
                productPhotos.forEach(photo => {
                    req.session.photosids.push(photo.id);
                });

                res.render('editProduct', {
                    productPhotos,
                    renderThumbnailChoice: true
                });
            } else {
                let selectedThumbnail = req.body.thumbnail ? parseInt(req.body.thumbnail) : 0;
                await photosController.setNewThumbNail(req.session.photosids[selectedThumbnail]);
                req.session.photosids = undefined;
                next();
            }
        } else {
            next();
        }
    },

}

async function validate(req) {
    if (req.body.productname === '' || req.body.productdescription === '' || req.body.productprice === '') {
        return messages.fieldValuesMustNotBeEmpty;
    }
    var isNameTaken = await productController.isNameAvailableForChange(req.body.productname, req.session.productForEdition);
    if (isNameTaken) {
        return messages.unavailableProductName;
    }
    return;
}