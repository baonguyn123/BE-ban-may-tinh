var createError = require('http-errors');
var methodOverride = require('method-override');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var cors = require('cors');

var app = express();

app.use(cors());
app.use(methodOverride('_method'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const categoryRouter = require('./routes/category');
const computerRouter = require('./routes/computer');
const roleRouter = require('./routes/role');
const cartRouter = require('./routes/cart');
const orderRouter = require('./routes/order');
const admin = require('./controllers/createAdminController');
const authRouter = require('./routes/auth');
admin();
app.use('/api/auth', authRouter);
app.use('/api/roles', roleRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/computers', computerRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);

mongoose.connect('mongodb://localhost:27017/may_tinh');
mongoose.connection.on('connected', function () {
  console.log("connected");
})
mongoose.connection.on('disconnecting', function () {
  console.log("disconnected");
})


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
