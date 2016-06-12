var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var tagCloud = require('tag-cloud');
var promise = require('bluebird');

var TagSchema = new Schema({
    _id: String,
    tis: [{
        type: ObjectId,
        ref: 'Ti'
    }],
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
TagSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now()
    }
    else {
        this.meta.updateAt = Date.now()
    }

    next()
})

TagSchema.statics = {
    fetch: function (cb) {
        return this
            .find({})
            .sort('meta.updateAt')
            .exec(cb)
    },
    findById: function (id, cb) {
        return this
            .findOne({_id: id})
            .exec(cb)
    },

    getTagCloud: function (cb) {

        var tags = [];
        this.find({}).exec(function (err, allTags) {
            for (var i = 0; i < allTags.length; i++) {
                tags.push({tagName: allTags[i]._id, count: allTags[i].tis.length})
            }
            promise.promisifyAll(tagCloud);
            tagCloud.tagCloudAsync(tags, cb, {htmlTag: 'a', additionalAttributes:{href: '/results?tag={{tag}}'}});
        })
    }
}

module.exports = TagSchema