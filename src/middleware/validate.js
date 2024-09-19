const orderHelpers = require("../lib/order");
const userController = require('../controllers/userController');
const messages = require('../lib/messages');

module.exports = {
    validateCreateAccountEmail: async (req, res, next) => {
        let { email } = req.body;        
        if (!userController.validateEmail(email)) {
            res.render('createAccount', { message: messages.incorectEmailFormat });
        } else{
            var emailsCount = await userController.getCountOfEmails(req.body.email);
            if (!emailsCount) {
                next();
            } else {
                res.render('createAccount', { message: messages.assignedAccountExists });
            }
        } 
    },

    validateCreateAccountPasswordStrenght : async (req,res,next) => {
        let {email, password, name, surname, phone, postalcode, city, deliveryadress} = req.body;
        if(!password){
            res.render('createAccount', { email, emailNotInDB: true });
        } else if(!userController.validatePasswordStrenght(password)){
            res.render('createAccount', {
                email,
                emailNotInDB: true,
                name,
                surname,
                phone,
                postalcode,
                city,
                deliveryadress,
                message : messages.passwordIsTooWeak
            })
        } else {
            next();
        }
    },

    validateOrder: async (req, res, next) => {
        if (!orderHelpers.orderHasProducts(req.body.productids, req.body.quantities)) {
            res.redirect('/');
        } else {
            var message = orderHelpers.orderDataIsCorect(req.body);
            if (!message) {
                next();
            } else {
                var properData = orderHelpers.removeProductsWhereQuantityIsZero(req.body.productids, req.body.quantities);

                var products = await orderHelpers.getProducts(properData.productids);
                var userDeliveryData = {
                    recipientEmail: req.body.recipientEmail,
                    recipientName: req.body.recipientName,
                    recipientSurname: req.body.recipientSurname,
                    recipientPhone: req.body.recipientPhone,
                    recipientPostalcode: req.body.recipientPostalcode,
                    recipientCity: req.body.recipientCity,
                    recipientDeliveryadress: req.body.recipientDeliveryadress
                }
                res.render('orderSummary', { products, userDeliveryData, message, productsQuantities: properData.productsQuantities })
            }
        }
    }
}