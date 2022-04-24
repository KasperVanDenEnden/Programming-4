var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const res = require('express/lib/response');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!")
})

module.exports = app;

// set responds
app.get("/user", (req,res) => {
  console.log(req)
  res.send("Got a GET all users request")
})

app.get("/user/{id}", (req,res) => {
  console.log(req)
  res.send("Got a GET an user request")
})

app.post("/", (req,res) => {
  console.log(req)
  res.send("Got a POST request")
})

app.put("/user", (req,res) => {
  console.log(req)
  res.send("Got a PUT request as /user")
})

app.delete("/user/{id}", (req,res) => {
  console.log(req)
  res.send("Got a DELETE request as /user")
})

app.put("/api/user", (req,res) => {
  console.log(req)
  res.send("Got a Create user request")
})

// serving static files in express
express.static(root, [options])
app.use(express.static('public'))
app.use(express.static('files'))
app.use("/static", express.static('public'))
