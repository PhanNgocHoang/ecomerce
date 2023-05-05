//define Factory class to create product

const { model } = require("mongoose")
const { BadRequestError } = require("../core/error.response")
const { product, clothing, electronics, furniture } = require("../models/product.model")
const { queryProduct, publishProductByShop, unPublishProductByShop, searchProductByUser, findAllProducts, findProduct, updateProductById }  = require('../models/repositories/product.repository')
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils")
const { insertInventory } = require("../models/repositories/inventory.repository")

class ProductFactory {
    //type : 'clothing
    // static async createProduct(type, payload) {
    //     switch (type) {
    //         case 'Electronics':
    //             return new Electronics(payload).createProduct()
    //         case 'Clothing':
    //             return new Clothing(payload).createProduct()
        
    //         default:
    //             throw new BadRequestError('Invalid Product type', type)
    //     }
    //  }
    static productRegistry = {}
    static registerProductType(type, classRef){
        ProductFactory.productRegistry[type] = classRef
    }
    
    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass){
            throw new BadRequestError(`Invalid Product Type ${type}`)
        }
        return new productClass(payload).createProduct()
     }

     //put

    static updateProduct(type, product_id, payload){
        const productClass = ProductFactory.productRegistry[type]
        if (!productClass) {
            throw new BadRequestError(`Invalid Product Type ${type}`)
        }
        return new productClass(payload).updateProduct(product_id)
    }
     static async publishProductByShop({product_shop, product_id}){
         return await publishProductByShop({ product_shop, product_id })
     }
    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id })
    }
   



     //query
     static async findAllDraftForShop({product_shop, limit = 50, skip = 0}) {
         const query = {product_shop, isDraft: true}
         return await queryProduct({query, limit, skip})
     }
    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true }
        return await queryProduct({ query, limit, skip })
    }

    static async searchProducts({ keySearch, limit = 50, skip = 0 }){
        return await searchProductByUser({ keySearch })
    }
    static async findAllProducts({ limit = 50, page = 1, sort = 'ctime', filter = { isPublished: true } }){
        return await findAllProducts({limit, sort, filter, page, select: ['product_name', 'product_price', 'product_thumb']})
    }
    static async findProduct({product_id,}) {
        return await findProduct({product_id, unSelect: ['__v']})
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
        const newProduct =  await product.create({ ...this, _id: product_id})
        if(newProduct){
            await insertInventory({
                productId: newProduct._id,
                shopId: newProduct.product_shop,
                stock: newProduct.product_quantity
            })
        }
        return newProduct
    }

    //update
    async updateProduct(product_id){
        return await updateProductById({ product_id, payload: this, model: product })
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
    static async updateProduct(productId) {
        // remove attr has null underfined
        //check update
        const objectParams = removeUndefinedObject(this)
        if (objectParams.product_attribute) {
            //update chill
            await updateProductById({ product_id: productId, payload: updateNestedObjectParser(objectParams.product_attribute), model: clothing })
        }
        const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams))
        return updateProduct


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

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({ ...this.product_attribute, product_shop: this.product_shop })
        if (!newFurniture) {
            throw new BadRequestError('create new furniture error')
        }
        const newProduct = await super.createProduct(newFurniture._id)
        if (!newProduct) {
            throw new BadRequestError('create new product error')
        }
        return newProduct
    }
}

//register product type
ProductFactory.registerProductType('Electronics', Electronics)
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Furniture', Furniture)
module.exports = ProductFactory