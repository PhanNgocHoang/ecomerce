const JWT = require('jsonwebtoken')
const asyncHandle = require('../helpers/syncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const KeyTokenService = require('../services/keyToken.service')
const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization',
    CLIENT_ID: 'x-client-id',
    REFRESH_TOKEN: 'refreshtoken'
}
const createTokenPair = async (paypload, publicKey, privateKey) => {
try {
    const accessToken = await JWT.sign(paypload, publicKey, {
        expiresIn: '2 days'
    })
    const refreshToken = await JWT.sign(paypload, privateKey, {
        expiresIn: '7 days'
    })

    JWT.verify(accessToken, publicKey, (err, decoded) => {
        if(err){
            console.log(err)
        }else{
            console.log(decoded)
        }
    })
    return {accessToken, refreshToken}
} catch (error) {
    
}
}

const authentication = asyncHandle (async (req, res, next)=> {
    // check userId
    // get access token
    // check user in dbs
    //check keyStore with userId
    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId){
        throw new AuthFailureError('Invalid Request')
    }
    const keyStore = await KeyTokenService.findByUserId(userId)
    if (!keyStore) {
        throw new NotFoundError('Not found key store')
    }
    const accessToken =  req.headers[HEADER.AUTHORIZATION]
    if (!accessToken){
        throw new AuthFailureError('Invalid Request')
    }
    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if(userId !== decodeUser.userId){
            throw new AuthFailureError('Invalid user')
        }
        req.keyStore = keyStore
        return next()
    } catch (error) {
        console.log(error)
    }
})

const verifyJWT =  async (token, keyScret) =>{
    return await JWT.verify(token, keyScret)
}

const authenticationV2 = asyncHandle(async (req, res, next) => {
    // check userId
    // get access token
    // check user in dbs
    //check keyStore with userId
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) {
        throw new AuthFailureError('Invalid Request')
    }
    const keyStore = await KeyTokenService.findByUserId(userId)
    if (!keyStore) {
        throw new NotFoundError('Not found key store')
    }
    if(req.headers[HEADER.REFRESH_TOKEN]){
        try {
            const refreshToken = req.headers[HEADER.REFRESH_TOKEN]
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
            if (userId !== decodeUser.userId) {
                throw new AuthFailureError('Invalid user')
            }
            req.keyStore = keyStore
            req.user = decodeUser
            req.refreshToken = refreshToken
            return next()
        } catch (error) {
            throw error
        }
    }
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) {
        throw new AuthFailureError('Invalid Request')
    }
    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if (userId !== decodeUser.userId) {
            throw new AuthFailureError('Invalid user')
        }
        req.keyStore = keyStore
        req.user = decodeUser
        return next()
    } catch (error) {
       throw error
    }
})
module.exports = {
    createTokenPair,
    authentication,
    verifyJWT,
    authenticationV2
}