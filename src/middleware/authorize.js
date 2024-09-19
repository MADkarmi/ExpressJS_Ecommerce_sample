const orderController = require('../controllers/ordersController');

module.exports = {
    authenticateAdmin: (req, res, next) => {
        if (req.session.adminRights && req.session.valid) {
            next();
        } else {
            res.redirect('/login');
        }
    },

    authenticateUser: (req, res, next) => {
        if (req.session.valid) {
            next();
        }
        else {
            res.redirect('/login');            
        }
    },

    authenticateUserForOrder: async(req,res,next) =>{
        if (req.session.adminRights && req.session.valid) {
            next();
        }else if(req.session.valid){
            var userid = await orderController.getUserIdForOrder(req.params.uuid)
            if(userid === req.session.userId){
                next();
            }else{
                res.redirect('/');
            }
        }else{
            res.redirect('/login'); 
        }
    }

}