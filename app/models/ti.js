var mongoose = require('mongoose')
var TiSchema = require('../schemas/ti')
var Ti = mongoose.model('Ti', TiSchema)

module.exports = Ti