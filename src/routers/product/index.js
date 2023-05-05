const express = require('express')
const asyncHandle = require('../../helpers/syncHandler')
const { authenticationV2 } = require('../../auth/authUtils')
const productController = require('../../controllers/product.controller')
const router = express.Router()

router.get('/search/:keySearch', asyncHandle(productController.getListSearchProduct))
router.get('', asyncHandle(productController.getProducts))
router.get('/:product_id', asyncHandle(productController.getProducts))

//Authentication

router.use(authenticationV2)
router.post('', asyncHandle(productController.createProduct))
router.patch('/:product_id', asyncHandle(productController.updateProduct))
router.post('/publish/:id', asyncHandle(productController.publishProduct))
router.post('/unpublish/:id', asyncHandle(productController.unPublishProduct))
router.get('/draft/all', asyncHandle(productController.getAllDraftForShop))
router.get('/publish/all', asyncHandle(productController.getAllPublishForShop))








module.exports = router