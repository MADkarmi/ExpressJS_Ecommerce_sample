const express = require('express');
const router = express.Router();
const messages = require('../lib/messages');
const authorize = require('../middleware/authorize.js');
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');

router.get('/listallusers', authorize.authenticateAdmin, async (req, res) => {
    try {
        var users = await userController.getAllUsers();
        res.render('listAllUsers', {
            users: users,
            cartsize: req.session.cart.length,
            isloggedin: req.session.valid,
            hasAdminRights: req.session.adminRights
        })
    }
    catch (err) {
        console.log(err);
        res.redirect('/');
    }

});

router.get('/login', (req, res) => {
    res.render('login')
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

router.post('/login', async (req, res) => {
    let { email, password } = req.body;

    var userCredentials = await userController.getUserCredentials(email);

    if (!userCredentials) {
        res.render('login', { message: messages.incorrectEmailOrPasswd });
    } else {
        let isPassProper = await userController.comparePasswords(password, userCredentials.password);
        if (isPassProper) {
            req.session.user = userCredentials.email;
            req.session.userId = userCredentials.id;
            req.session.adminRights = userCredentials.isadmin;
            req.session.valid = true;
            req.session.cart = {};
            res.redirect('/');
        } else {
            res.render('login', { message: messages.incorrectEmailOrPasswd });
        }
    }
});

router.get('/createaccount', (req, res) => {
    res.render('createAccount');
});

router.post('/createaccount',
    validate.validateCreateAccountEmail,
    validate.validateCreateAccountPasswordStrenght,
    async (req, res) => {
        let { email, password, confirmpassword, name, surname, phone, postalcode, city, deliveryadress } = req.body;
        if (password !== confirmpassword) {
            res.render('createAccount', {
                email,
                name,
                surname,
                phone,
                postalcode,
                city,
                deliveryadress,
                message: messages.passwordsMismatch,
                emailNotInDB: true
            })
        } else {
            var response = await userController.createUser({
                email,
                password,
                name,
                surname,
                phone,
                postalcode,
                city,
                deliveryadress,
            })
            if (response) {
                res.redirect('/');
            } else {
                res.render('createAccount', { message: messages.unsuccessfulUserCreation })
            }
        }
    });

module.exports = router;