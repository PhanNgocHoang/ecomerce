const express = require('express')
const app = express()


const morgan = require('morgan')
const helmet = require('helmet')
const compression = require('compression')

//init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))


// init db

require('./dbs/init.mogodb')

// const { checkOverLoadConnect } = require('./helpers/check.connect')
// checkOverLoadConnect()

//init router

app.use('', require('./routers'))



//error handling

app.use((req, res, next)=> {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next)=> {
    const statusCode = error.status || 500

    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error'
    })
})



module.exports = app