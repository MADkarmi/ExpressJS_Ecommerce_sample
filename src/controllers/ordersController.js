const db = require('../models');
const Order = db.orders;
const OrderItems = db.ordersItems;
const DeliveryAdress = db.userDeliveryAdresses;
const { Op } = require("sequelize");

module.exports = {
    createOrder: async (orderItemsTable, orderDeliveryData, userId) => {
        try {
            var order = await Order.create({                
                ispending: true,
                userId
            });
            await DeliveryAdress.create({
                recipientEmail: orderDeliveryData.recipientEmail,
                recipientName: orderDeliveryData.recipientName,
                recipientSurname: orderDeliveryData.recipientSurname,
                recipientPhone: orderDeliveryData.recipientPhone,
                recipientPostalcode: orderDeliveryData.recipientPostalcode,
                recipientCity: orderDeliveryData.recipientCity,
                recipientDeliveryadress: orderDeliveryData.recipientDeliveryadress,
                deliveryaddressOrderuuid: order.orderuuid
            })

            orderItemsTable.forEach(item => {
                item['orderOrderuuid'] = order.orderuuid
            });

            await OrderItems.bulkCreate(orderItemsTable);

            return order.orderuuid;
        } catch (err) {
            console.log(err);
            return;
        }
    },

    closeOrderWithUUID: async (uuid) =>{
        try{
            await Order.update({ispending : false},{
                where: {
                    orderuuid : uuid
                }
            })
            return uuid;
        }catch(err){
            console.log(err);
            return;
        }

    },

    getAllOrders: async () => {
        try {
            var orders = await Order.findAll({
                attributes: ['orderuuid', 'createdAt', 'ispending', 'userId'],
                order: ['createdAt'],
                include: [
                    {
                        model: DeliveryAdress, as: "deliveryaddresses",
                        attributes : ['recipientName','recipientEmail','recipientPhone']                        
                    }
                ]
            });
            return orders
        } catch (err) {
            console.log(err);
            return;
        }
    },

    getAllOrdersForUser: async (user) => {
        try {
            var orders = await Order.findAll({
                attributes: ['orderuuid', 'createdAt', 'ispending'],
                order: [['createdAt', 'DESC']],
                where: { 'userId': user }
            });
            return orders
        } catch (err) {
            console.log(err);
            return;
        }
    },

    getOrderByUUID: async (uuid) => {
        try {
            var orders = await Order.findByPk(
                uuid,
                {
                    attributes: ['orderuuid', 'createdAt', 'ispending'],
                    include: [{
                        model: OrderItems, as: "items"                        
                    }, {
                        model: DeliveryAdress, as: "deliveryaddresses"
                    }]
                });
            return orders;
        }
        catch (err) {
            console.log(err);
            return;
        }
    },

    getUserIdForOrder: async (uuid) => {
        try {
            var userid = await Order.findByPk(uuid, { attributes: ['userId'] });
            return userid.userId;
        } catch (err) {
            console.log(err);
            return;
        }

    },

    getAllPendingOrders: async () => {
        try {
            var orders = await Order.findAll({
                attributes: ['orderuuid', 'createdAt', 'ispending', 'userId'],
                order: ['createdAt'],
                where: { 'ispending': true },
                include: [
                    {
                        model: DeliveryAdress, as: "deliveryaddresses",
                        attributes : ['recipientName','recipientEmail','recipientPhone']
                    }
                ]
            });
            return orders
        } catch (err) {
            console.log(err);
            return;
        }
    },

    getAllPendingOrdersForUser: async (user) => {
        try {
            var orders = await Order.findAll({
                attributes: ['orderuuid', 'createdAt', 'ispending'],
                order: [['createdAt', 'DESC']],
                where: {
                    [Op.and]: [
                        { 'ispending': true },
                        { 'userId': user }
                    ]
                }
            });
            return orders
        } catch (err) {
            console.log(err);
            return;
        }
    },
}