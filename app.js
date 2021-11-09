var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var readline = require("readline");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { getInfo } = require('./getInfo');
const { getRate } = require('./getRate');
const { rupiah } = require('./config');
const { orderHistory } = require('./orderHistory');
const { openOrders } = require('./openOrders');
const { getOrder } = require('./getOrder');
const { trade } = require('./trade');
const { setInterval } = require('timers');

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
app.use(function (req, res, next) {
  next(createError(404));
});

app.listen(app.get('port'), function () {
  console.log('Server started on port ' + app.get('port'));

  setTimeout(async () => {
    console.log('account:')
    let account = await getInfo();
    let name = account.return.name;
    let balance = account.return.balance.idr;
    let coin = 'btc';
    console.log(`Hello, ${name}. Welcome to INDODAX bot!`)
    console.log(`Saldo IDR ${balance}`)

    async function openO(last) {
      let price_precision = 1000; //btc=1000, btt=1
      //percentage
      let min3 = 0.97; // -3 %
      let min2 = 0.98; // -2 %
      let min1 = 0.99; // -1 %
      let plus3 = 1.03; // +3 %
      let plus2 = 1.02; // +2 %
      let plus1 = 1.01; // +1 %
      //rumus Math.floor((ask_price * percentage) / price_precision) * price_precision
      let wantBuy = 10000;
      // let wantBuyOnPrice = Math.floor((last * min1) / price_precision) * price_precision;
      let wantBuyOnPrice = parseInt(last) - price_precision;
      // let wantSell = wantBuy * 2;
      // let wantSellOnPrice = Math.floor((last * plus1) / price_precision) * price_precision;
      let wantSellOnPrice = parseInt(last) + price_precision;
      let coinGetBuy = (wantBuy / wantBuyOnPrice).toFixed(8);
      let coinGetSell = (coinGetBuy * wantSellOnPrice).toFixed(0);
      console.log('----------------------------------')
      console.log(`Trade`)
      console.log(`Want buy: ${rupiah(wantBuy)}`)
      console.log(`Want buy on price: ${rupiah(wantBuyOnPrice)}`)
      console.log(`Coin get buy: ${coinGetBuy}`)
      // console.log(`Want sell: ${rupiah(wantSell)}`)
      console.log(`Want sell on price: ${rupiah(wantSellOnPrice)}`)
      console.log(`Idr get sell: ${rupiah(coinGetSell)}`)
      console.log('----------------------------------')

      console.log('----------------------------------')
      let orderOpen = await openOrders(coin);
      let myOrderOpen = orderOpen.return.orders[0];
      console.log(`Open Order`, myOrderOpen)

      if (!myOrderOpen) {
        clearInterval(intervalRate);
        console.log(`do it buy`);
        let doTrade = await trade(coin, 'buy', wantBuyOnPrice, wantBuy, '')
        console.log('doTrade', doTrade)
        let orderOpen2 = await openOrders(coin);
        let myOrderOpen2 = orderOpen2.return.orders[0];
        console.log(`Open Order2`, myOrderOpen2)
        let intervalGetOrder = setInterval(async () => {
          let orderGet = await getOrder(coin, myOrderOpen2.order_id);
          let myOrderGet = orderGet.return.order;
          console.log('----------------------------------')
          console.log(`Dalam tahap membeli coin. `, myOrderGet)
          console.log('----------------------------------')
          if (myOrderGet.status === 'filled') {
            clearInterval(intervalGetOrder);
            console.log(`do it sell`);
            let doSell = await trade(coin, 'sell', wantSellOnPrice, '', coinGetBuy)
            console.log('doSell', doSell)
            setTimeout(() => {
              intervalRate = setInterval(myFn, 6000);
            }, 2000);
          } else if (myOrderGet.status === 'cancelled') {
            clearInterval(intervalGetOrder);
            setTimeout(() => {
              intervalRate = setInterval(myFn, 6000);
            }, 2000);
          }
        }, 6000);
      } else {
        clearInterval(intervalRate);
        let intervalGetOrder = setInterval(async () => {
          let orderGet = await getOrder(coin, myOrderOpen.order_id);
          let myOrderGet = orderGet.return.order;
          console.log('----------------------------------')
          console.log(`Dalam tahap membeli coin. `, myOrderGet)
          console.log('----------------------------------')
          if (myOrderGet.status === 'filled') {
            clearInterval(intervalGetOrder);
            console.log(`do it sell`);
            let doSell = await trade(coin, 'sell', wantSellOnPrice, '', coinGetBuy)
            console.log('doSell', doSell)
            setTimeout(() => {
              intervalRate = setInterval(myFn, 6000);
            }, 2000);
          } else if (myOrderGet.status === 'cancelled') {
            clearInterval(intervalGetOrder);
            setTimeout(() => {
              intervalRate = setInterval(myFn, 6000);
            }, 2000);
          }
        }, 6000);
      }

      console.log('----------------------------------')
    }

    async function myFn() {
      // console.log('rate: ')
      let rate = await getRate(coin);
      if (rate.ticker) {
        let high = rate.ticker.high
        let low = rate.ticker.low
        let last = rate.ticker.last
        let buy = rate.ticker.buy
        let sell = rate.ticker.sell
        let volCoin = rate.ticker[`vol_${coin}`]
        let volIdr = rate.ticker.vol_idr
        console.log('----------------------------------')
        console.log(`Coin ${coin}`)
        console.log(`HIGH: ${rupiah(high)} || LOW: ${rupiah(low)} || LAST: ${rupiah(last)}`)
        console.log(`Vol`)
        console.log(`Coin: ${volCoin} || IDR: ${rupiah(volIdr)}`)
        console.log(`Market`)
        console.log(`BUY: ${rupiah(buy)} || SELL: ${rupiah(sell)}`)
        console.log('----------------------------------')
        await openO(last);
        // setTimeout(() => {
        //   answerInputNominal()
        // }, 2000);
      } else {
        console.log('Coin tidak ditemukan.')
        // return answerInputCoin();
      }
    }

    var intervalRate = setInterval(myFn, 6000);

  }, 2000);
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
