/*
    Key feature : Cart Service

    - add product to cart
    -reduce product quantity by one
    - increase product quantity by one
    - get cart
    - delete cart
    -delete item
*/

const cart = require("../models/cart.model");

class CartService {

    static async createUserCart({userId, product}){
        const query = {cart_userId: userId, cart_state: 'active'}
        const updateOrInsert = {
            $addToSet: {
                cart_productId: product
            }
        }
        const options = {upsert: true, new: true}
        return await cart.findOneAndUpdate(query, updateOrInsert, options)
    }

    static async updateUserCartQuantity(userId, product){
        const {productId, quantity} = product
        const query = {cart_userId: userId ,
        
            'cart_products.productId': productId,
            cart_state: 'active'
        }
        const updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity
            }
        }
        const options = { upsert: true, new: true }
        return await cart.findOneAndUpdate(query, updateOrInsert, options)
    }

    static async addToCart({userId, product ={}}){
        // check cart

        const userCart = await cart.findOne({cart_userId: userId})
        if(!userCart){
            //create cart
            return await CartService.createUserCart({userId, product})

        }
        // neu co gio hang roi nhung khong co san pham
        if(!userCart.cart_products.length){
            userCart.cart_products = [product]
            return await userCart.save()
        }
        // neu gio hang ton tai va duplicate san pham
        return await CartService.updateUserCartQuantity({userId, product})
    }
}