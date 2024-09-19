module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('products', {
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        isavailable: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        price: {
            type: DataTypes.FLOAT,
            defaultValue: 999.99
        }
    });
    
    return Product;
}