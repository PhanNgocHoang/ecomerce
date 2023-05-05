const { Schema, Types, model } = require("mongoose")

const DOCUMENT_NAME = 'Inventory'
const COLLECTION_NAME = 'Inventories'

const inventorySchema = new Schema({
    inven_productId: {type: Types.ObjectId, ref: 'Product'},
    inven_location: {type: String, default: 'unKnown'},
    inven_stock: {type: Number, require: true},
    inven_shopId: {type: Types.ObjectId, ref: 'Shop'},
    inven_reservations: {type: Array, default: []}
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, inventorySchema)