const { Types } = require("mongoose");
const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            // level 0
            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // })
            // return tokens ? tokens.publicKey : null

            //level xxx
            const filter = { user: userId }
            const update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken }
            const options = { upsert: true, new: true }
            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)
            return tokens ? tokens.publicKey : null
        } catch (error) {
            console.log(error)
            return error
        }
    }
    static findByUserId = async (userId) => {
        return await keytokenModel.findOne({ user: userId })
    }

    static removeKeyById = async (id) => {
        return await keytokenModel.deleteOne({ _id: id }).lean()
    }
    static findByRefreshTokenUse = async (refreshToken) => {
        return await keytokenModel.findOne({
            refreshTokensUsed: refreshToken
        }).lean()
    }
    static deleteKeyById = async (userId) => {
        return await keytokenModel.deleteOne({ user: userId }).lean()
    }
    static findByRefreshToken = async (refreshToken) => {
        return await keytokenModel.findOne({
            refreshToken: refreshToken
        })
    }
}
module.exports = KeyTokenService