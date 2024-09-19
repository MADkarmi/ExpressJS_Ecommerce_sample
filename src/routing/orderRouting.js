const express = require('express');
const router = express.Router();
const messages = require('../lib/messages');
const authorize = require('../middleware/authorize.js');
const validate = require('../middleware/validate');
const productController = require('../controllers/productController');
const userController = require('../controllers/userController');
const orderController = require('../controllers/ordersController');
const orderHelpers = require("../lib/order");
const shoppingcart = require("../lib/sessionCart");


router.get('/orders', authorize.authenticateUser, async(req,res) =>{
    var orders, message;
    if(req.session.adminRights){
        orders = await orderController.getAllOrders();
    }else{
        orders = await orderController.getAllOrdersForUser(req.session.userId);
    }
    if(orders.length === 0){
        message = messages.noAvailableOrders;
    }
    res.render('orders', {orders, message, hasAdminRights : req.session.adminRights, isloggedin : req.session.valid });
});

router.get('/orders/pending', authorize.authenticateUser, async(req,res) =>{
    var orders, message;
    if(req.session.adminRights){
        orders = await orderController.getAllPendingOrders();
    }else{
        orders = await orderController.getAllPendingOrdersForUser(req.session.userId);
    }
    if(orders.length === 0){
        message = messages.noAvailableOrders;
    }
    res.render('orders', {orders, message, hasAdminRights : req.session.adminRights, isloggedin : req.session.valid});
});

router.get('/orders/:uuid', authorize.authenticateUserForOrder, async(req, res) => {
    var order = await orderController.getOrderByUUID(req.params.uuid)
    res.render('orderDetails', {order, isloggedin : req.session.valid, hasAdminRights : req.session.adminRights});
})

router.post('/closeOrder', authorize.authenticateAdmin, async(req,res) => {    
    var response = await orderController.closeOrderWithUUID(req.body.uuid)
    res.redirect(`/orders/${response}`);
})

router.post('/ordersummary', authorize.authenticateUser, async (req, res) => {
    var userDeliveryData = await userController.getUserDeliveryData(req.session.userId);
    if (req.body.buyNow !== undefined) {
        if (JSON.parse(req.body.buyNow.toLowerCase())) {
            var productData = await productController.getProductByIdWithThumbnail(req.body.productid);
            if (!productData || !productData.isavailable) {
                res.render('404');
            } else {
                var productsQuantities = {};
                productsQuantities[req.body.productid] = 1;
                req.session.order = [];
                req.session.orderDeliveryData = [];
                res.render('orderSummary', { products: [productData], productsQuantities, userDeliveryData });
            }
        }
    } else {
        if (shoppingcart.isEmpty(req.session.cart)) {
            res.redirect('/');
        } else {             
            var products = await orderHelpers.getProducts(Object.keys(req.session.cart));
            res.render('orderSummary', { products, productsQuantities: req.session.cart, userDeliveryData });
        }
    }
});

router.post('/verifyorder', authorize.authenticateUser, validate.validateOrder, async (req, res) => {
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
    req.session.order = [];
    req.session.orderDeliveryData = userDeliveryData;

    for (let i = 0; i < products.length; i++) {
        let orderItem = {
            productName: products[i].name,
            quantity: parseInt(properData.productsQuantities[products[i].id]),
            price: products[i].price
        }
        req.session.order.push(orderItem);
    }
    var totalPrice = orderHelpers.calculateTotalPrice(req.session.order);
    res.render('validateOrder', {
        products,
        userDeliveryData,
        productsQuantities: properData.productsQuantities,
        totalPrice
    });
})

router.post('/createorder', async(req, res) => {
    var orderUUID = await orderController.createOrder(req.session.order, req.session.orderDeliveryData, req.session.userId);    
    req.session.cart = {};
    req.session.order = undefined;
    req.session.orderDeliveryData = undefined;
    res.redirect(`/orders/${orderUUID}`);
})

module.exports = router;