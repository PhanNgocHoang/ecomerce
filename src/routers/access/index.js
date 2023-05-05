const express = require('express')
const accessController = require('../../controllers/access.controller')
const asyncHandle = require('../../helpers/syncHandler')
const { authenticationV2 } = require('../../auth/authUtils')
const router = express.Router()

// sign up
router.post('/shop/signUp', asyncHandle(accessController.signUp))
router.post('/shop/login', asyncHandle(accessController.login))


//Authentication

router.use(authenticationV2)

router.post('/shop/logout', asyncHandle(accessController.logout))
router.post('/shop/handleRefreshToken', asyncHandle(accessController.handleRefreshToken))


module.exports = router