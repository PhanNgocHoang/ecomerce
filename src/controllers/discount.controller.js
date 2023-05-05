const { SuccessResponse } = require("../core/success.response")
const DiscountService = require("../services/discount.service")

class DiscountController {
    createDiscountCOde = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create Code success',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId,
            })
        }).send(res)
    }

    getAllDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create Code success',
            metadata: await DiscountService.getAllDiscountCodeWithShop({
                ...req.query,
                shopId: req.user.userId,
            })
        }).send(res)
    }

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create Code success',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body,
            })
        }).send(res)
    }
    getAllDiscountCodeWithProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create Code success',
            metadata: await DiscountService.getAllDiscountCodesWithProduct({
                ...req.query,
            })
        }).send(res)
    }

}

module.exports = new DiscountController()