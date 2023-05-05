const _ = require('lodash')
const { Types } = require('mongoose')
const getInfoData = ({fields= [], object = {}})=> {
    return _.pick(object, fields)
}
const getSelectData = (select = [])=> {
    return Object.fromEntries(select.map(item=> [item, 1]))
}
const getUnSelectData = (select = []) => {
    return Object.fromEntries(select.map(item => [item, 0]))
}
const removeUndefinedObject  = object => {
    Object.keys(object).forEach(key => {
        if(object[key] === null || object[key] === undefined) {
            delete object[key]
        }
    })
    return object
}
const updateNestedObjectParser = object => {
    const final = {}
    Object.keys(object).forEach(key=> {
        if(typeof object[key] === 'Object' && !Array.isArray(object[key])){
        const response = updateNestedObjectParser(object[key])
            Object.keys(response).forEach(a=>{
                final[`${key}.${a}`] = response[a]
            })
        }else{
            final[key] = object[key]
        }
    })
}
const convertToObjectIdMongoDb = id => {
    return  new Types.ObjectId(id)
}
module.exports= {
    getInfoData,
    getSelectData,
    getUnSelectData,
    removeUndefinedObject,
    updateNestedObjectParser,
    convertToObjectIdMongoDb
}