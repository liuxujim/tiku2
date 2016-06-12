var mongoose = require('mongoose')
var Ti = mongoose.model('Ti')
var Tag = mongoose.model('Tag')
var Category = mongoose.model('Category')
var Comment = mongoose.model('Comment')
var _ = require('underscore')
var fs = require('fs')
var path = require('path')

// detail page
exports.detail = function (req, res) {
    var id = req.params.id

    Ti.update({_id: id}, {$inc: {pv: 1}}, function (err) {
        if (err) {
            console.log(err)
        }
    })

    Tag.getTagCloud(function(err, html){
        if(err){
            console.log(err)
            return;
        }
        Ti.findById(id, function (err, ti) {
            Comment
                .find({ti: id})
                .populate('from', 'name')
                .populate('reply.from reply.to', 'name')
                .exec(function (err, comments) {
                    res.render('detail', {
                        title: '题目详情页',
                        ti: ti,
                        comments: comments,
                        tagCloud:html
                    })
                })
        })
    })
}

// admin new page
exports.new = function (req, res) {
    Category.find({}, function (err, categories) {
        res.render('admin', {
            title: '题库后台录入页',
            categories: categories,
            ti: {}
        })
    })
}

// admin update page
exports.update = function (req, res) {
    var id = req.params.id

    if (id) {
        Ti.findById(id, function (err, ti) {
            Category.find({}, function (err, categories) {
                res.render('admin', {
                    title: 'imooc 后台更新页',
                    ti: ti,
                    categories: categories
                })
            })
        })
    }
}

// admin imageContent
exports.saveImageContent = function (req, res, next) {
    var posterData = req.files.uploadImageContent
    var filePath = posterData.path
    var originalFilename = posterData.originalFilename

    if (originalFilename) {
        fs.readFile(filePath, function (err, data) {
            var timestamp = Date.now()
            var type = posterData.type.split('/')[1]
            var imageContent = timestamp + '.' + type
            var newPath = path.join(__dirname, '../../', '/public/upload/' + imageContent)

            fs.writeFile(newPath, data, function (err) {
                req.imageContent = imageContent
                next()
            })
        })
    }
    else {
        next()
    }
}

// admin tags
exports.saveTags = function (req, res, next) {
    //var tid = req.params.ti._id
    var tags = req.body.ti.tags
    req.tags = []

    if (tags) {
        var tagArray = tags.trim().split(" ");
        for (var i = 0; i < tagArray.length; i++) {
            Tag.findOneAndUpdate({_id: tagArray[i]}, {_id: tagArray[i]}, {upsert: true}, function (err, tag) {
                if (err) {
                    console.log(err)
                }
                else {
                    req.tags.push(tag._id)
                    if (tag._id == tagArray[tagArray.length - 1])
                        next();
                }
            })
        }
    }
}

// admin post ti
exports.save = function (req, res) {
    var id = req.body.ti._id
    var tiObj = req.body.ti
    var _ti

    if (req.imageContent) {
        tiObj.imageContent = req.imageContent
    }
    if (req.tags) {
        tiObj.tags = req.tags
    }

    if (id) {
        Ti.findById(id, function (err, ti) {
            if (err) {
                console.log(err)
            }

            _ti = _.extend(ti, tiObj)
            _ti.save(function (err, ti) {
                if (err) {
                    console.log(err)
                }

                res.redirect('/ti/' + ti._id)
            })
        })
    }
    else {
        _ti = new Ti(tiObj)

        var categoryId = tiObj.category
        var categoryName = tiObj.categoryName

        _ti.save(function (err, ti) {
            if (err) {
                console.log(err)
            }
            if (categoryId) {
                Category.findById(categoryId, function (err, category) {
                    category.tis.push(ti._id)
                    category.save(function (err, category) {
                        res.redirect('/ti/' + ti._id)
                    })
                })
            }
            else if (categoryName) {
                var category = new Category({
                    name: categoryName,
                    tis: [ti._id]
                })

                category.save(function (err, category) {
                    ti.category = category._id
                    ti.save(function (err, ti) {
                        res.redirect('/ti/' + ti._id)
                    })
                })
            }
        })
    }
}

// list page
exports.list = function (req, res) {
    Ti.find({})
        .populate('category', 'name')
        .exec(function (err, tis) {
            if (err) {
                console.log(err)
            }

            res.render('list', {
                title: '题目列表页',
                tis: tis
            })
        })
}

// list page
exports.del = function (req, res) {
    var id = req.query.id

    if (id) {
        Ti.remove({_id: id}, function (err, ti) {
            if (err) {
                console.log(err)
                res.json({success: 0})
            }
            else {
                res.json({success: 1})
            }
        })
    }
}