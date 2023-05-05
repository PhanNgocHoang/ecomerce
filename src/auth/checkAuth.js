const { findById } = require("../services/apikey.service")

const HEADER = {
    API_KEY : 'x-api-key',
    AUTHORIZATION: 'authorization'
}
const apiKey = async (req, res, next)=>{
    try {
        const key = req.headers[HEADER.API_KEY]?.toString()
        if(!key){
            return res.status(403).json({
                message: 'Forbidden Error'
            })
        }
        //check object key
        const objectKey = await findById(key)
        if(!objectKey){
            return res.status(403).json({
                message: 'Forbidden Error'
            })
        }
        req.objKey = objectKey
        return next()
    } catch (error) {
        console.log(error)
    }
}

const permission = (permissions) => {
    return (req, res, next)=> {
        const userPermissions = req.objKey.permissions
        if (!userPermissions){
            return res.status(403).json({
                message: 'Permission denied'
            })
        }
        console.log(userPermissions)
        const validPermissions = userPermissions.includes(permissions)
        if (!validPermissions){
            return res.status(403).json({
                message: 'Permission denied'
            })
        }
        return next()
    }
}


module.exports = {
    apiKey,
    permission,
}