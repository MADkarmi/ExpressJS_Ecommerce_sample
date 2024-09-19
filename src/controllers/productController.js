const db = require('../models');
const Product = db.products;
const ProductPhotos = db.productPhotos;
const { Op } = require("sequelize");

module.exports = {
    /**
     * Save to database product with photos
     * @param {string} name product name
     * @param {string} description product description
     * @param {boolean} availability product availability
     * @param {number} price product price
     * @param {Object[]} photos
     * @returns productid
     */
    createProductWith: async (name, description, availability, price, photos) => {
        try {
            var response = await Product.create({
                name,
                description,
                isavailable: availability,
                price
            });

            photos.forEach(photo => {
                photo['productId']=response.id
            })
            await ProductPhotos.bulkCreate(photos);
            return response.id
        } catch (err) {
            console.log(err);
            return;
        }
    },

    dropProduct: async(productId) => {
        try{
            return Product.destroy({
                where: {
                    id : productId
                },
            })
        }catch(err){
            console.log(err);
            return;
        }
    },

    /**
     * 
     * @param {string} searchPhrase 
     */
    findProductsByNameOrDescription: async (searchPhrase) => {
        try {
            var products = await Product.findAll({
                attributes: ['id', 'name', 'description', 'isavailable', 'price'],
                order: ['name'],
                where: {
                    [Op.or]: [
                        {
                            name: {
                                [Op.iLike]: `%${searchPhrase}%`
                            }
                        },
                        {
                            description: {
                                [Op.iLike]: `%${searchPhrase}%`
                            }
                        }
                    ]
                },
                include: [{
                    model: ProductPhotos, as: "photos",
                    where: { thumbnail: true }
                }]
            })
            return products;
        } catch (err) {
            console.log(err);
            return null;
        }
    },

    getAllProducts: async () => {
        try {
            var products = await Product.findAll({
                attributes: ['id', 'name', 'description', 'isavailable', 'price'],
                order: ['name'],
                include: [{
                    model: ProductPhotos, as: "photos",
                    where: { thumbnail: true }
                }]
            });
            return products
        } catch (err) {
            console.log(err);
            return null;
        }
    },

    /**
     * 
     * @param {string} productName 
     */
    getProductsCount: async (productName) => {
        try {
            var count = await Product.count({
                where: {
                    name: productName
                }
            })
            return count;
        } catch (err) {
            console.log(err);
            return 1;
        }
    },

    /**
     * get product by id
     * @param {number} id 
     */
    getProductById: async (id) => {
        try {
            var product = await Product.findByPk(
                id,
                {
                    attributes: ['name', 'description', 'isavailable', 'price'],
                    include: [{
                        model: ProductPhotos, as: "photos"
                    }],
                    order : [['photos', 'thumbnail', 'DESC']]
                }
            );
            return product;
        } catch (err) {
            console.log(err);
            return;
        }
    },
    
    /**
     * get product by id
     * @param {number} id 
     */
    getProductByIdWithThumbnail: async (id) => {
        try {
            var product = await Product.findByPk(
                id,
                {
                    attributes: ['id', 'name', 'description', 'isavailable', 'price'],
                    include: [{
                        model: ProductPhotos, as: "photos",
                        where: { thumbnail: true }
                    }],
                }
            );
            return product;
        } catch (err) {
            console.log(err);
            return;
        }
    },

    isProductAvilable: async (id) => {
        try {
            var response = await Product.findByPk(id,
                {
                    attributes: ['isavailable']
                });
            return response.isavailable;
        } catch (err) {
            console.log(err);
            return false;
        }
    },

    /**
     * 
     * @param {Array} arrayOfIds 
     */
    getMultipleProductsByIdWithThumbnail: async (ids) => {
        var idsForQuery = [];
        ids.forEach(qid => {
            idsForQuery.push({ id: qid });
        });
        try {
            var product = await Product.findAll({
                attributes: ['id', 'name', 'description', 'isavailable', 'price'],
                where: {
                    [Op.or]: idsForQuery
                },
                include: [{
                    model: ProductPhotos, as: "photos",
                    where: { thumbnail: true }
                }],
            }
            );
            return product;
        } catch (err) {
            console.log(err);
            return;
        }
    },

    updateProductData: async (uid, uname, udescription, uisavailable, uprice) => {
        try {
            var update = await Product.update(
                {
                    name: uname, description: udescription, isavailable: uisavailable, price: uprice
                }, {
                    where: { id: uid }
                }
            )
            return update;
        } catch (err) {
            console.log(err);
            return 0;
        }
    },

    isNameAvailableForChange: async (name, id) => {
        try {
            var response = await Product.findAll({
                attributes: ['id'],
                where: {
                    [Op.and]: [
                        { name: name },
                        {
                            id: {
                                [Op.ne]: id
                            }
                        }
                    ]
                }
            });
            return response.length;
        } catch (err) {
            console.log(err);
            return true;
        }
    }
}