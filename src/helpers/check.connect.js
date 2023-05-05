const mongoose = require('mongoose')
const os = require('os')
const process = require('process')
const countConnect = ()=> {
    const numConnection = mongoose.connections.length
    console.log(`Number of connection :: ${numConnection}`)

}

const checkOverLoadConnect = () => {
    setInterval(()=> {
        const numConnections = mongoose.connections.length
        const numCor = os.cpus().length
        const memoryUse = process.memoryUsage().rss
        //example maximun number of connections based on number  of core
        const maxConnections = numCor * 5

        console.log(`Active connection : ${numConnections}`)

        console.log(`Memory usage :: ${memoryUse / 1024 /1024} MB`)
        if(numConnections > maxConnections) {
            console.log("connection  overload detected")
        }
    }, 5000) // monitor every 5 seconds
}
module.exports = {
    countConnect, 
    checkOverLoadConnect
}