var getCartSize = (cart) => {
    if(cart){
        if(!isEmpty(cart)){
            var sum = 0;
            for(var product in cart){
                sum+=cart[product];
            }
            return sum;
        }
    }
    return;    
}

var isEmpty = (obj) => {
    for(var key in obj) {
        if(Object.prototype.hasOwnProperty.call(obj, key))
            return false;
    }
    return true;
}

module.exports = {getCartSize, isEmpty}