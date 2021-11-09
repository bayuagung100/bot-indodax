var axios = require('axios');
var qs = require('qs');
const { signHmacSha512, secretKey, key, urlPrivate } = require('./config');
module.exports.orderHistory = async function (coin) {
    var data = qs.stringify({
        'method': 'orderHistory',
        'timestamp': '1578304294000',
        'recvWindow': '1578303937000',
        'pair': `${coin ? coin + '_idr' : 'btc_idr'}`,
        'count': '1',
        'from': ''
    });
    var config = {
        method: 'post',
        url: urlPrivate,
        headers: {
            'Key': key,
            'Sign': signHmacSha512(secretKey, data),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    }
    return new Promise((resolve, rejects) => {
        axios(config)
            .then(function (response) {
                // console.log(JSON.stringify(response.data));
                resolve(response.data);
            })
            .catch(function (error) {
                console.log(error);
            });
    })
}