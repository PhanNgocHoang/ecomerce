const {Schema, model} = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const DOCUMENT_NAME = 'Key';
const COLLECTION_NAME = 'Keys';

const keyTokenSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        require: true,
        ref: 'Shop'
        
    },
    publicKey:{
        type:String,
        required:true,
    },
    privateKey: {
        type: String,
        required: true,
    },
    refreshTokensUsed:{
        type:Array,
        default: []
    },
    refreshToken: {
        type: String, require: true
    }
}, {
    collection: COLLECTION_NAME,
    timestamps: true
});

//Export the model
module.exports =model(DOCUMENT_NAME, keyTokenSchema);