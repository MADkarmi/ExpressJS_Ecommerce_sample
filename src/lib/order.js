const messages = require("./messages");
const productController = require("../controllers/productController");

module.exports = {    
    getProducts: async (productsid) => {
        var products
        if (productsid.length === 1) {
            var tmp = await productController.getProductByIdWithThumbnail(productsid[0]);
            products = [tmp];
        }
        else {
            products = await productController.getMultipleProductsByIdWithThumbnail(productsid);
        }
        return products;
    },

    orderDataIsCorect: (requestBody) => {
        var message = '';
        if (!orderHasValidNames(requestBody.recipientName, requestBody.recipientSurname)) {
            message += messages.emptyNameOrSurname;
        }
        if (!orderHasValidEmail(requestBody.recipientEmail)) {
            message += messages.invalidEmail;
        }
        if (!orderHasDeliveryData(requestBody.recipientCity, requestBody.recipientDeliveryadress, requestBody.recipientPostalcode, requestBody.recipientPhone)) {
            message += messages.fieldValuesMustNotBeEmpty;
        }
        return message;
    },

    orderHasProducts : (products, quantities) => {
        if (products.length === 1) {
            if (!JSON.parse(quantities))
                return false;
        } else {
            var result = false;
            quantities.forEach(quantity => {
                if (JSON.parse(quantity)) {
                    result = true;
                }
            });
            return result;
        }
        return true;
    },

    removeProductsWhereQuantityIsZero: (productsid, quantities) => {
        var properproducts = [], productsQuantities = {};
        if(!Array.isArray(productsid)){
            productsid = [productsid];
            quantities = [quantities];
        }
        for (let i = 0; i < productsid.length; i++) {
            if (quantities[i] != 0) {
                properproducts.push(productsid[i])
                productsQuantities[productsid[i]] = quantities[i];
            }
        }
        return {
            productids: properproducts,
            productsQuantities: productsQuantities
        };
    },

    calculateTotalPrice : (order) => {
        let total = 0;
        order.forEach(item => {
            total += item.quantity * item.price;
        });
        return total;
    },

    calculateSubTotal : (price,quantity) => {
        return price*quantity;
    }

}

function orderHasDeliveryData(city, adress, postalcode, phone) {
    if (!city || !adress || !postalcode || !phone) {
        return false;
    }
    return true;
}

function orderHasValidNames(name, surname) {
    if (!name || !surname) {
        return false;
    }
    return true;
}

function orderHasValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}