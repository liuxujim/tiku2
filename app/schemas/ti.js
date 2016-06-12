var mongoose = require('mongoose')
var Tag = require('../models/Tag')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var TiSchema = new Schema({
  index: String,
  textContent: String,
  imageContent:String,
  category: {
    type: ObjectId,
    ref: 'Category'
  },
  tags:[{
    type: String,
    ref: 'Tag'
  }],
  pv: {
    type: Number,
    default: 0
  },
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})

// var ObjectId = mongoose.Schema.Types.ObjectId
TiSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next()
})

TiSchema.post('save', function(ti) {
  for(var i=0;i<this.tags.length;i++){
    Tag.findById(this.tags[i], function(err,tag){
      if(err){
        console.log(err)
      }
      else{
        var tis = tag.tis;
        tis.push(ti._id)
        tag.update({tis: tis}, function(err,t){
          if(err){
            console.log(err)
          }
        })
      }
    })
  }
})

TiSchema.statics = {
  fetch: function(cb) {
    return this
      .find({})
      .sort('meta.updateAt')
      .exec(cb)
  },
  findById: function(id, cb) {
    return this
      .findOne({_id: id})
      .populate('category', 'name')
      .exec(cb)
  }
}

module.exports = TiSchema