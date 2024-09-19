module.exports = (sequelize, DataTypes) => {
    const userDeliveryData = sequelize.define('userDeliveryData',{
        recipientEmail: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        recipientName:{
            type: DataTypes.STRING(50),
            allowNull: false
        },
        recipientSurname:{
            type: DataTypes.STRING(50),
            allowNull: false
        },
        recipientPhone: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        recipientPostalcode: {
            type: DataTypes.STRING(7),
            allowNull: false
        },
        recipientCity: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        recipientDeliveryadress: {
            type: DataTypes.STRING(100),
            allowNull: false
        }

    });
    return userDeliveryData;
}