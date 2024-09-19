module.exports = (sequelize, DataTypes) => {
    const Orders = sequelize.define('orders',{
        orderuuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true
        },
        ispending: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }

    });
    return Orders
}