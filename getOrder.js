var axios = require('axios');
var qs = require('qs');
const { signHmacSha512, secretKey, key, urlPrivate } = require('./config');
module.exports.getOrder = async function (coin, order_id) {
    var data = qs.stringify({
        'method': 'getOrder',
        'timestamp': '1578304294000',
        'recvWindow': '1578303937000',
        'pair': `${coin ? coin + '_idr' : 'btc_idr'}`,
        'order_id': order_id
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