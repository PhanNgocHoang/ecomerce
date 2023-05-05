//define Factory class to create product

const { BadRequestError } = require("../core/error.response")
const { product, clothing, electronics } = require("../models/product.model")

class ProductFactory {
    //type : 'clothing
    static async createProduct(type, payload) {
        switch (type) {
            case 'Electronics':
                return new Electronics(payload).createProduct()
            case 'Clothing':
                return new Clothing(payload).createProduct()
        
            default:
                throw new BadRequestError('Invalid Product type', type)
        }
     }

}

//define base product class

class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attribute
    })
    {
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attribute = product_attribute
    }

    //create product
    async createProduct(product_id){
        return await product.create({ ...this, _id: product_id})
    }
}

//define sub-class for different products type Clothing

class Clothing extends Product {
    async createProduct(){
        const newClothing = await clothing.create({ ...this.product_attribute, product_shop: this.product_shop })
        if(!newClothing){
            throw new BadRequestError('create new clothing error')
        }
        const newProduct = await super.createProduct(newClothing._id)
        if(!newProduct) {
            throw new  BadRequestError('create new product error')
        }
        return newProduct
    }
}

class Electronics extends Product {
    async createProduct() {
        const newElectronics = await electronics.create({ ...this.product_attribute, product_shop: this.product_shop})
        if (!newElectronics) {
            throw new BadRequestError('create new electronics error')
        }
        const newProduct = await super.createProduct(newElectronics._id)
        if (!newProduct) {
            throw new BadRequestError('create new product error')
        }
        return newProduct
    }
}

module.exports = ProductFactory