const { Created, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {

    handleRefreshToken = async (req, res, next) => {
        // v1
        // new SuccessResponse({
        //     message: 'Get Token Success',
        //     metadata: await AccessService.handleRefreshToken(req.body.refreshToken)
        // }).send(res)
        //v2
        new SuccessResponse({
            message: 'Get Token Success',
            metadata: await AccessService.handleRefreshTokenV2({
                refreshToken: req.refreshToken , 
                user: req.user,
                keyStore: req.keyStore
            })
        }).send(res)
    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: 'Logout sucess',
            metadata: await AccessService.logout(req.keyStore)
        }).send(res)
    }

    login = async (req, res, next)=> {
        new SuccessResponse({
            metadata: await AccessService.login(req.body)
        }).send(res)
    }

    signUp = async (req, res, next) => {
            // console.log(`[P]::signUp::`, req.body);
            new Created({
                message: 'Registerd Ok!',
                metadata: await AccessService.signUp(req.body)
            }).send(res)
            // return res.status(201).json(await AccessService.signUp(req.body))
    }

}
module.exports = new AccessController()