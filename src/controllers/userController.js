const bcrypt = require('bcrypt');
const db = require("../models")
const User = db.users;

/**
 * hash password
 * @param {string} password 
 */
async function getPasswordHash(password) {
    var hash = await bcrypt.hash(password, 12);
    return hash;
}

/**
 * create compact delivery adress for db
 * @param {string} postalcode 
 * @param {string} city 
 * @param {string} deliveryadress 
 */
function createAdress(postalcode, city, deliveryadress) {
    return postalcode + '_' + city + '_' + deliveryadress;
}

function getShipingAdress(adressData) {    
    let data = adressData.split('_');
    return {
        postalcode: data[0],
        city: data[1],
        deliveryadress: data[2]
    }
}

module.exports = {
    /**
     * save user to database
     * @param {User} user 
     */
    createUser: async (user) => {
        var hashedPassword = await getPasswordHash(user.password);
        var adress = createAdress(user.postalcode, user.city, user.deliveryadress);
        try {
            var response = await User.create({
                email: user.email,
                password: hashedPassword,
                name: user.name,
                surname: user.surname,
                phone: user.phone,
                adress: adress
            })
            return response;
        } catch (err) {
            console.log(err);
            return undefined;
        }
    },

    /**
     * get count of users with the same email
     * @param {string} email 
     */
    getCountOfEmails: async (email) => {
        try {
            var response = await User.count({
                where: {
                    email: email
                }
            });
            return response;
        } catch (err) {
            console.log(err);
        }
    },

    getUserDeliveryData: async (id) => {
        try{
            var deliveryData = await User.findByPk(id,
                {
                    attributes: ['email', 'name', 'surname', 'phone', 'adress']
                }
            );
            let deliveryAdress = getShipingAdress(deliveryData.adress);
            return {
                recipientEmail: deliveryData.email,
                recipientName: deliveryData.name,
                recipientSurname: deliveryData.surname,
                recipientPhone: deliveryData.phone,
                recipientPostalcode: deliveryAdress.postalcode,
                recipientCity: deliveryAdress.city,
                recipientDeliveryadress: deliveryAdress.deliveryadress
            }
        }catch(err){
            console.log(err);
            return;
        }
    },

    /**
     * get user data
     * @param {string} email 
     */
    getUserCredentials: async (email) => {
        try {
            var response = await User.findOne({
                where: {
                    email: email
                }
            })
            return response;
        }
        catch (err) {
            console.log(err);
            return;
        }
    },
    
    /** 
     * compare given password with hash 
     * @param {string} attemptedPassword 
     * @param {string} hash 
     */
    comparePasswords: async (attemptedPassword, hash) => {
        var result = await bcrypt.compare(attemptedPassword, hash);
        return result;
    },

    /**
     * 
     * @param {string} email 
     */
    validateEmail: (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },

    validatePasswordStrenght : (password) => {
        const re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
        return re.test(password);
    },

    getAllUsers: async () => {
        try{
            var users = await User.findAll();
            return users;
        }catch(err){
            console.log(err);
            return;
        }
        

    }
};