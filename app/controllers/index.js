var mongoose = require('mongoose')
var Ti = mongoose.model('Ti')
var Category = mongoose.model('Category')

// index page
exports.index = function(req, res) {
  Category
    .find({})
    .populate({
      path: 'tis',
      select: 'index title textContent imageContent',
      options: { limit: 6 }
    })
    .sort({"updateAt":-1})
    .exec(function(err, categories) {
      if (err) {
        console.log(err)
      }

      res.render('index', {
        title: '题库',
        categories: categories
      })
    })
}

// search page
exports.search = function(req, res) {
  var catId = req.query.cat
  var tag = req.query.tag
  var q = req.query.q
  var page = parseInt(req.query.p, 10) || 0
  var count = 6
  var index = page * count

  if (catId) {
    Category
      .find({_id: catId})
      .populate({
        path: 'tis',
        select: 'index imageContent textContent'
      })
      .exec(function(err, categories) {
        if (err) {
          console.log(err)
        }
        var category = categories[0] || {}
        var tis = category.tis || []
        var results = tis.slice(index, index + count)

        res.render('results', {
          title: '分类结果列表页面',
          keyword: category.name,
          currentPage: (page + 1),
          query: 'cat=' + catId,
          totalPage: Math.ceil(tis.length / count),
          tis: results
        })
      })
  }
  else if(tag){
    Ti
        .find({tags: tag})
        .exec(function(err, ts) {
          if (err) {
            console.log(err)
          }
          var tis = ts || {}
          var results = tis.slice(index, index + count)
          res.render('results', {
            title: '标签搜索结果列表页面',
            currentPage: (page + 1),
            query: 'tag=' + tag,
            keyword: tag,
            totalPage: Math.ceil(tis.length / count),
            tis: results
          })
        })
  }
  else {
    Ti
      .find()
      .or([
          { $or: [{index: new RegExp(q + '.*', 'i')}] },

      ])
        .or([
          { $or: [{textContent: new RegExp(q + '.*', 'i')}] },
        ])
        .or([
          { $or: [{tags: new RegExp(q + '.*', 'i')}] },
        ])
      .exec(function(err, tis) {
        if (err) {
          console.log(err)
        }
        var results = tis.slice(index, index + count)
        console.log("2222...." + results.length);
        res.render('results', {
          title: '搜索结果列表页面',
          keyword: q,
          currentPage: (page + 1),
          query: 'q=' + q,
          totalPage: Math.ceil(tis.length / count),
          tis: results
        })
      })
  }
}