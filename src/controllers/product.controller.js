const { SuccessResponse } = require("../core/success.response")
const ProductFactory = require("../services/product.service")
const ProductFactoryV2 = require("../services/product.service.v2")

class ProductController {
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create product success',
            metadata: await ProductFactoryV2.createProduct(req.body.product_type, { ...req.body, product_shop: req.user.userId})
        }).send(res)
    }

    // update product

    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update product success',
            metadata: await ProductFactoryV2.updateProduct(req.body.product_type, req.params.product_id,{
               ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }
    //
    publishProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update product success',
            metadata: await ProductFactoryV2.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res)
    }
    unPublishProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Update product success',
            metadata: await ProductFactoryV2.unPublishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id
            })
        }).send(res)
    }


    //Query
    getAllDraftForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list success',
            metadata: await ProductFactoryV2.findAllDraftForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }
    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list success',
            metadata: await ProductFactoryV2.findAllPublishForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }
    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Search Product',
            metadata: await ProductFactoryV2.searchProducts(req.params)
        }).send(res)
    }
    getProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list findAllProducts',
            metadata: await ProductFactoryV2.findAllProducts(req.query)
        }).send(res)
    }
     getProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list findAllProducts',
            metadata: await ProductFactoryV2.findProduct({
                product_id: req.params.product_id
            })
        }).send(res)
    }
}

module.exports = new ProductController()