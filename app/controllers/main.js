var mongoose = require('mongoose'),
  Article = mongoose.model('Article');

exports.index = function(req, res){
  Article.find(function(err, articles){
    if(err) throw new Error(err);
    console.log('articles:', articles.map(function (article) {
    	return article.date;
    }));
    res.render('main/index', {
      title: 'Generator-Express MVC',
      articles: articles
    });
  });
};