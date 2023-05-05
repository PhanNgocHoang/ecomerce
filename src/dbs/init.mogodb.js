const mongoose = require('mongoose')
const {db : {host, name, port}} = require('../configs/config.mongodb')
const connectString = `mongodb://${host}:${port}/${name}`

console.log(connectString)
class DataBase {
    constructor(){
        this.connect()
    }
    connect (type='mongodb') {
        if(1 === 1){
            mongoose.set('debug', true)
            mongoose.set('debug', {color: true})
        }
        mongoose.connect(connectString).then(_ => console.log("connected MongoDB")).catch(err => console.log(err)) 
    }
    static getInstance () {
        if(!DataBase.instance){
            DataBase.instance = new DataBase()
        }
        return DataBase.instance
    }
}
const instanceMongoDb = DataBase.getInstance()
module.exports = instanceMongoDb