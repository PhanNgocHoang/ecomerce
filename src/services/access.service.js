const shopModel = require('../models/shop.model')
const bycrypt = require('bcrypt')
const crypto = require('node:crypto')
const KeyTokenService = require('./keyToken.service')
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response')
const { findByEmail } = require('./shop.service')
const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
}
class AccessService {

    static handleRefreshTokenV2 = async ({ keyStore, user, refreshToken}) => {
        // check this toke used?
        const {userId, email } = user
        if (keyStore.refreshTokensUsed.includes(refreshToken)){
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Some think wrong happend !! Pls reLogin')
        }
        if(keyStore.refreshToken !== refreshToken){
            throw new AuthFailureError('Shop not registeted 1')
        }
        const foundShop = await findByEmail({ email })
        if (!foundShop) {
            throw new AuthFailureError('Shop not registeted 2')
        }
        //create new token
        const tokens = await createTokenPair({ userId: userId, email }, keyStore.publicKey, keyStore.privateKey)
        //update token
        await keyStore.updateOne({
            $set: { refreshToken: tokens.refreshToken }, $addToSet: {
                refreshTokensUsed: refreshToken // da duoc su dung de lay token moi
            }
        })
        return {
            user,
            tokens
        }
        

    }

    static handleRefreshToken = async (refreshToken) => {
        // check this toke used?
        const foundToken = await KeyTokenService.findByRefreshTokenUse(refreshToken)
        if (foundToken) {
            // decode
            const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
            console.log(userId, email)
            // remove
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Some think wrong happend !! Pls reLogin')
        }
        // no
        const holdToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if (!holdToken) {
            throw new AuthFailureError('Shop not registeted 1')

        }
        const { userId, email } = await verifyJWT(refreshToken, holdToken.privateKey)
        //check user Id
        const foundShop = await findByEmail({email})
        if (!foundShop) {
            throw new AuthFailureError('Shop not registeted 2')
        }
        //create new token
        const tokens = await createTokenPair({ userId: userId, email }, holdToken.publicKey, holdToken.privateKey)
        //update token
        await holdToken.updateOne({
            $set: { refreshToken: tokens.refreshToken }, $addToSet: {
                refreshTokensUsed: refreshToken // da duoc su dung de lay token moi
            }
        })
        return {
            user: {
                userId, email
            },
            tokens
        }

    }

    static logout = async (keyStrore) => {
        console.log(keyStrore)
        return await KeyTokenService.removeKeyById(keyStrore._id)
    }

    static login = async ({ email, password, refreshToken = null }) => {

        // check email in dbs
        const foundShop = await findByEmail({ email })
        if (!foundShop) {
            throw new BadRequestError('Shop not registered')
        }
        const matchPassword = bycrypt.compare(password, foundShop.password)
        if (!matchPassword) {
            throw new AuthFailureError('Authentication error')
        }

        //match password
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')
        const tokens = await createTokenPair({ userId: foundShop._id, email }, publicKey, privateKey)
        await KeyTokenService.createKeyToken({
            userId: foundShop._id,
            refreshToken: tokens.refreshToken,
            privateKey, publicKey
        })
        return {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
            tokens
        }

    }

    static signUp = async ({ name, email, password }) => {
        try {
            //check email exist
            const holderShop = await shopModel.findOne({ email: email }).lean()
            if (holderShop) {
                throw new BadRequestError('Error: Shop already registered!')
            }
            const passwordHash = await bycrypt.hash(password, 10)
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })
            if (newShop) {
                //created privateKey, publichKey
                // const {privateKey, publicKey} =  crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     }
                // })
                // console.log({privateKey, publicKey}) // collection Key store
                const privateKey = crypto.randomBytes(64).toString('hex')
                const publicKey = crypto.randomBytes(64).toString('hex')
                const keyStrore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })
                if (!keyStrore) {
                    return {
                        code: 'xxxx',
                        message: 'publicKeyString error'
                    }
                }
                const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
                console.log(`Created Token success`, tokens)
                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
                        tokens
                    }
                }
            }
            return {
                code: 200,
                metadata: null
            }
        } catch (error) {
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        }
    }
}
module.exports = AccessService