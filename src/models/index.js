const dbConfig = require('../config/db.config.js');
const dbDevConfig = require('../config/dbdev.config');
const Sequelize = require('sequelize');

let sequelize;
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        logging: false,
        dialect: dbConfig.dialect,
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        pool: {
            max: dbConfig.pool.max,
            min: dbConfig.pool.min,
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle
        }
    });
} else {
    sequelize = new Sequelize(dbDevConfig.DB, dbDevConfig.USER, dbDevConfig.PASSWORD, {        
        host: dbDevConfig.host,
        dialect: dbDevConfig.dialect,
        pool: {
            max: dbDevConfig.pool.max,
            min: dbDevConfig.pool.min,
            acquire: dbDevConfig.pool.acquire,
            idle: dbDevConfig.pool.idle
        }
    });
}

//use only to initialize database
//     (async () => {
//         await sequelize.sync({force: true});
//     })();

const db = {
    Sequelize: Sequelize,
    sequelize: sequelize,

    users: require('./user.model.js')(sequelize, Sequelize),
    products: require('./product.model.js')(sequelize, Sequelize),
    productPhotos: require('./productPhotos.model.js')(sequelize, Sequelize),
    orders: require('./orders.model.js')(sequelize, Sequelize),
    ordersItems: require('./ordersItems.model.js')(sequelize, Sequelize),
    userDeliveryAdresses: require('./userDeliveryAdresses.model.js')(sequelize, Sequelize)
};

db.products.hasMany(db.productPhotos, { as: 'photos', onDelete: 'CASCADE' });
db.productPhotos.belongsTo(db.products, {
    foreignKey: "productId",
    as: "product"
});

db.users.hasMany(db.orders, { as: 'orders' });
db.orders.belongsTo(db.users, {
    foreignKey: "userId",
    as: "user"
});

db.orders.hasMany(db.ordersItems, { as: 'items' });
db.ordersItems.belongsTo(db.orders);

db.orders.hasOne(db.userDeliveryAdresses, { as: 'deliveryaddresses' });
db.userDeliveryAdresses.belongsTo(db.orders);

module.exports = db;