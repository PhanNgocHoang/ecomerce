const { Types } = require('mongoose')
const {product, electronics, clothing, furniture} = require('../product.model')
const { getSelectData, getUnSelectData } = require('../../utils')
const publishProductByShop = async ({product_shop, product_id})=>{
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if(!foundShop){
        return null
    }
    foundShop.isDraft = false
    foundShop.isPublished = true
    const {modifiedCount} = await foundShop.updateOne(foundShop)
    return modifiedCount
}
const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if (!foundShop) {
        return null
    }
    foundShop.isDraft = true
    foundShop.isPublished = false
    const { modifiedCount } = await foundShop.updateOne(foundShop)
    return modifiedCount
}

const queryProduct =  async ({ query, limit, skip }) => {
    return await product.find(query).populate('product_shop', 'name email -_id').sort({ updatedAt: -1 }).skip(skip).limit(limit).lean().exec()
}

const searchProductByUser = async ({ keySearch, limit, skip }) => {
    const regexSearch = new RegExp(keySearch)
    return await product.find({ isPublished: true , $text: { $search: regexSearch } }, { score: { $meta: 'textScore' }}).sort({$score: {$meta: 'textScore'}}).lean()
}

const findAllProducts = async({limit, page, sort, filter, select }) =>{
    const skip = (page -1) * limit
    const sortBy = sort === 'ctime' ? {_id: -1}: {_id: 1}
    const products = await product.find(filter).sort(sortBy).skip(skip).limit(limit).select(getSelectData(select)).lean()
    return products
}
const findProduct = async({product_id, unSelect}) => {
    return await product.findById(product_id).select(getUnSelectData(unSelect))
}

const updateProductById = async({product_id, payload, model, isNew = true}) =>{
    return await model.findByIdAndUpdate(product_id, payload, {new: isNew})
}




module.exports = { queryProduct, publishProductByShop, unPublishProductByShop, searchProductByUser, findAllProducts, findProduct, updateProductById }