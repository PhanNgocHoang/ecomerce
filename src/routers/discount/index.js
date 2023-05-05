const express = require('express')
const accessController = require('../../controllers/access.controller')
const asyncHandle = require('../../helpers/syncHandler')
const { authenticationV2 } = require('../../auth/authUtils')
const discountController = require('../../controllers/discount.controller')
const { route } = require('.')
const router = express.Router()



router.post('/amount', asyncHandle(discountController.getDiscountAmount))
router.get('/list_product_code', asyncHandle(discountController.getAllDiscountCodeWithProducts))

//Authentication

router.use(authenticationV2)

router.post('', asyncHandle(discountController.createDiscountCOde))
router.get('', asyncHandle(discountController.getAllDiscountCode))



module.exports = router