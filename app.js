const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');

const express = require('express');

const app = express();
const mongoose = require('mongoose');

// APP CONFIG
mongoose.connect('mongodb://localhost/restful_blog_app', {
  useNewUrlParser: true,
});
mongoose.set('useCreateIndex', true);
app.set('view engine', 'ejs');
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride('_method'));

// MONGO CONFIG
const blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  summary: String,
  body: String,
  created: { type: Date, default: Date.now },
});

const Blog = mongoose.model('Blog', blogSchema);

// RESTFUL ROUTES
app.get('/', function(req, res) {
  res.redirect('/blogs');
});

app.get('/blogs', function(req, res) {
  Blog.find({}, function(err, blogs) {
    if (err) {
      console.log(err);
    } else {
      res.render('index', { blogs });
    }
  });
});

// NEW POST ROUTE
app.get('/blogs/new', function(req, res) {
  res.render('./blogs/new');
});

// CREATE POST ROUTE
app.post('/blogs', function(req, res) {
  // sanitize body
  req.body.blog.body = req.sanitize(req.body.blog.body);
  // create blog
  Blog.create(req.body.blog, function(err, newBlog) {
    if (err) {
      console.log(err);
      res.render('./blogs/new');
    } else {
      res.redirect('/blogs');
    }
  });
});

// SHOW BLOG ROUTE
app.get('/blogs/:id', function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.render('./blogs/show', { blog: foundBlog });
    }
  });
});

// EDIT ROUTE
app.get('/blogs/:id/edit', function(req, res) {
  Blog.findById(req.params.id, function(err, foundBlog) {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.render('./blogs/edit', { blog: foundBlog });
    }
  });
});

// UPDATE ROUTE
app.put('/blogs/:id', function(req, res) {
  // sanitize body
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(
    err,
    updatedBlog
  ) {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.redirect(`/blogs/${req.params.id}`);
    }
  });
});

// DELETE ROUTE
app.delete('/blogs/:id', function(req, res) {
  Blog.findByIdAndRemove(req.params.id, function(err, removedBlog) {
    if (err) {
      res.redirect('/blogs');
    } else {
      res.redirect('/blogs/');
    }
  });
});
app.listen(3000, function() {
  console.log('Server has started');
});
