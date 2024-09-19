module.exports = (sequelize, DataTypes) => {
    const OrdersItems = sequelize.define('ordersitems',{
        quantity : {
            type: DataTypes.INTEGER
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        productName : {
            type: DataTypes.STRING(100),
            allowNull: false,
        }
    });

    return OrdersItems;
}