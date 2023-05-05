/*
    discount service
    1 - Generator discount code [shop, admin]
    2- get discount amount
    3-get all discount code [user, shop]
    4 verify discount code [user]
    5- delete discount code [admin, shop]
    6 - cancel discount code [user]
*/

const { model } = require("mongoose")
const { BadRequestError, NotFoundError } = require("../core/error.response")
const discount = require("../models/discount.model")
const { findAllDiscountCodeUnSelect, checkDiscountExists } = require("../models/repositories/discount.repository")
const { findAllProducts } = require("../models/repositories/product.repository")
const { convertToObjectIdMongoDb } = require("../utils")

class DiscountService {


    static async createDiscountCode(payload) {
        const {
            code, start_date, end_date, is_active, 
            shopId, min_order_value, applies_to,
             name, description, type, value, max_value, max_uses,
            uses_count, max_uses_per_user, users_userd, product_ids
        } = payload
        // kiem tra
        // if(new Date() < new Date(start_date) || new Date() > new Date(end_date)){
        //     throw new BadRequestError('Discount code has expried')
        // }
        if(new Date(start_date) >= new Date(end_date)){
            throw new BadRequestError("Start date must be before end date")
        }

        //create index for discount
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongoDb(shopId)
        }).lean()
        if(foundDiscount && foundDiscount.discount_is_active){
            throw new BadRequestError('Discount exists!')
        }
        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type, //percentage
            discount_value: value,
            discount_code: code,
            discount_start_date:  new Date(start_date),
            discount_end_date: new Date(end_date), //
            discount_max_uses: max_uses, // 
            discount_uses_count:uses_count, //
            discount_users_used:users_userd, 
            discount_max_uses_per_user: max_uses_per_user, //
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_shopId: shopId,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids:  applies_to === 'all' ? [] : product_ids,
        })
        return newDiscount
    }
    static async updateDiscount(){}

    // get all discount codes available with product

    static async getAllDiscountCodesWithProduct({
        code, shopId, userId, limit, page
    }){
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongoDb(shopId)
        }).lean()
        if(!foundDiscount || !foundDiscount.discount_is_active){
            throw new NotFoundError('Discount not exist')
        }
        const {discount_product_ids, discount_applies_to} = foundDiscount
        let products
        if(discount_applies_to === 'all'){
            products = await findAllProducts({
                filter: {
                    product_shop : convertToObjectIdMongoDb(shopId),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }
        if(discount_applies_to === 'specific'){
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }
        return products
    }

    // get all discount  code of shop
    static async getAllDiscountCodeWithShop({limit, page, shopId}) {
        const  discounts = await findAllDiscountCodeUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongoDb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        })
        return discounts
    }

    //get code detail
     // apply discout code

     /*products = [

     ] 
     */
    static async getDiscountAmount({codeId, userId, shopId, products}){
        const foundDiscount = await checkDiscountExists(discount, { discount_code: codeId, discount_shopId: convertToObjectIdMongoDb(shopId)})
        if(!foundDiscount){
            throw new NotFoundError('Discount do not exist')
        }
        const { discount_is_active, discount_max_uses, discount_start_date, discount_end_date,
            discount_min_order_value, discount_max_uses_per_user, discount_users_used, discount_value, discount_type
             } = foundDiscount
        if(!discount_is_active){
            throw new NotFoundError('Discount expried')
        }
        if(!discount_max_uses) throw new NotFoundError('Discount are out 1')
        if(new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)){
            throw new NotFoundError('Discount are out 2')
        }
        // check gia tri toi thieu
        let totalOrder = 0
        if(discount_min_order_value > 0){
            //get total
            totalOrder = products.reduce((acc, product)=>{
                return acc + (product.quantity * product.price)
            }, 0)
            if(totalOrder < discount_min_order_value){
                throw new NotFoundError('Discount requires a minium order value')
            }
        }
        if(discount_max_uses_per_user > 0){
            const userUseDiscount = discount_users_used.find((user)=> user.userId === userId)
            if (userUseDiscount){

            }
        }
        //check discount fix amount
        const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder* (discount_value / 100)
        return {
            totalOrder, 
            discount: amount,
            totalPrice: totalOrder - amount
        }



    }
     static async deleteDiscountCode({shopId, codeId}){
         const deleted = await discount.findOneAndDelete({
             discount_code: codeId,
             discount_shopId: convertToObjectIdMongoDb(shopId)
         })
         return deleted
     }

     static async cancelDiscountCode({codeId, shopId, userId}){
         const foundDiscount = await checkDiscountExists(discount, {
             discount_code: codeId,
             discount_shopId: convertToObjectIdMongoDb(shopId)
         })
         if(!foundDiscount) throw new NotFoundError('Discount do not exist')
         const result = await discount.findByIdAndUpdate(foundDiscount._id, {
             $pull: {
                 discount_users_used: userId
             },
             $inc: {
                 discount_max_uses: 1,
                 discount_uses_count: -1
             }
         })
         return result
     }
}

module.exports = DiscountService