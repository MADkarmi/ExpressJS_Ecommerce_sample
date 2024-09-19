const db = require('../models');
const ProductPhotos = db.productPhotos;
const { Op } = require("sequelize");

module.exports = {
    /**
     * 
     * @param {[{image,thumbnail,productId}]]} blobs 
     */
    addPhotosForProduct : async (blobs) =>{
        try{
            return await ProductPhotos.bulkCreate(blobs);
        }catch(err){
            console.log(err);
            return;
        }
    },

    deletePhotos: async (photos) => {
        try {
            var deleted;
            if (Array.isArray(photos)) {
                var ids = [];
                photos.forEach(photo => {
                    ids.push({ id: photo })
                })
                deleted = await ProductPhotos.destroy({
                    where: {
                        [Op.or]: ids
                    }
                });

            } else {
                deleted = await ProductPhotos.destroy({
                    where: {
                        id: photos
                    }
                })
            }
            return deleted;
        } catch (err) {
            console.log(err);
            return;
        }
    },

    setNewThumbNail: async (photoid) => {
        try {
            var product = await ProductPhotos.findByPk(photoid, {
                attributes: ['productId']                
            })
            await ProductPhotos.update(
                {thumbnail : false},
                {where : {
                    thumbnail : true,
                    productId: product.productId
                }});

            var updatedThumbnail = await ProductPhotos.update({thumbnail : true}, {where : {id : photoid}});

            return updatedThumbnail;
        } catch (err) {
            console.log(err);
            return;
        }

    },

    getAllPhotosForProduct: async (productid) => {
        try {
            var photos = await ProductPhotos.findAll({
                attributes: ['id', 'image', 'thumbnail'],
                where: {
                    productId: productid
                }
            });
            return photos
        } catch (err) {
            console.log(err);
            return;
        }
    },

    countProductPhotos: async (productid) => {
        try {
            var count = await ProductPhotos.count({
                where: {
                    productId: productid
                }
            });
            return count;
        } catch (err) {
            console.log(err);
            return 0;
        }
    },

    /**
     * Returns source for img html tag
     * @param {Mimetype} mimetype 
     * @param {Buffer} buffer 
     * @returns {string} source for img html tag
     */
    generateImgSrc: (mimetype, buffer) => {
        return `data:${mimetype};base64,${buffer.toString('base64')}`;
    }
}