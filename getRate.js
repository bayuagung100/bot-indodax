var axios = require('axios');
const { urlPublic } = require('./config');
module.exports.getRate = async function (coin, id_pair) {
    var defaultCoint = 'btc';
    // var defaultPair = coin ? coin + 'idr' : defaultCoint + 'idr';
    var defaultPair = coin ? coin.toLowerCase() + 'idr' : '';
    var config = {
        method: 'get',
        // url: `${urlPublic}/api/ticker/${id_pair ? id_pair : defaultPair}`,
        url: `${urlPublic}/api/ticker/${defaultPair}`,
    };
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