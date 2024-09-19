module.exports = (sequelize, DataTypes) => {
    const ProductPhotos = sequelize.define('productsPhotos', {
        image: {
            type: DataTypes.BLOB,
            allowNull: false
        },
        thumbnail: {
            type: DataTypes.BOOLEAN
        }
    });

    return ProductPhotos;
};