const { Schema, model, Types } = require('mongoose'); // Erase if already required
const slugify = require('slugify');

// Declare the Schema of the Mongo model
const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Products';
const productSchema = new Schema({
    product_name: {type: String, required: true},
    product_thumb: { type: String, required: true },
    product_description: String,
    product_slug: String,
    product_price: {type: Number, required: true},
    product_quantity: {type: Number, required: true},
    product_type: {type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture']},
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'},
    product_attribute: {type: Schema.Types.Mixed, required: true},
    product_ratingAverage : {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be above 5.0'],
        set: (value)=> Math.round(value * 10) / 10
    },
    product_variations: {type: Array, default: []},
    isDraft: {type: Boolean, default: true, index: true, select: false},
    isPublished: { type: Boolean, default: false, index: true, select: false },
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})

//create index for name and description
productSchema.index({ product_name: 'text', product_description: 'text'})

//document middleware: runs before .save() and .create()
productSchema.pre('save', function (next){
    this.product_slug = slugify(this.product_name, { lower: true, })
    next()
})


//define  the product type = clothing
const ClothingSchema = new Schema({
    brand: {type: String, required: true},
    size: String,
    material: String,
     product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
}, {
    collection: 'Clothes',
    timestamps: true
})
const ElectronicsSchema = new Schema({
    manufacturer: { type: String, required: true },
    model: String,
    color: String,
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
}, {
    collection: 'Electronics',
    timestamps: true
})
const FurnitureSchema = new Schema({
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop' },
}, {
    collection: 'Electronics',
    timestamps: true
})
module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    clothing: model('Clothes', ClothingSchema),
    electronics: model('Electronics', ElectronicsSchema),
    furniture: model('Furnitures', FurnitureSchema),
}