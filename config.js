var crypto = require("crypto");
module.exports.key = '0SEYXYVS-KRWMXNO4-JLZZWRQ5-VZDP2DKU-UOELGJEN';
module.exports.secretKey = '0e153feafc43bbed896e80d5dd942862dbc2a444952ca6c6dd8978c6a859821f78d8738161d5626b';
module.exports.urlPrivate = 'https://indodax.com/tapi';
module.exports.urlPublic = 'https://indodax.com';

module.exports.signHmacSha512 = (secret, str) => {
    let hmac = crypto.createHmac("sha512", secret);
    let signed = hmac.update(Buffer.from(str, 'utf-8')).digest("hex");
    return signed
}
/* Fungsi formatRupiah */
module.exports.rupiah = (angka) => {
    var rupiah = '';
    var angkarev = angka.toString().split('').reverse().join('');
    for (var i = 0; i < angkarev.length; i++) if (i % 3 === 0) rupiah += angkarev.substr(i, 3) + '.';
    return 'Rp ' + rupiah.split('', rupiah.length - 1).reverse().join('');
}

// 939.925.000
// doTrade {
//     success: 1,
//     return: {
//       receive_btc: '0.00000000',
//       spend_rp: 0,
//       fee: 0,
//       remain_rp: 10000,
//       order_id: 134612930
//     }
//   }