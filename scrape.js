let cheerio = require('cheerio');
let datafire = require('datafire');
let http = require('@datafire/http').create();

const SITE = 'https://coinmarketcap.com';
const URL = SITE + '/all/views/all/';
const NUM_CURRENCIES = 200;

function parseNumber(str) {
  let isPercent = str.indexOf('%') !== -1;
  str = str.trim();
  str = str.replace(/\$/g, '');
  str = str.replace(/\%/g, '');
  str = str.replace(/,/g, '');
  let val = null;
  if (str.indexOf('.') === -1) {
    val = parseInt(str);
  } else {
    val = parseFloat(str);
  }
  if (isPercent) val /= 100;
  return val;
}

module.exports = new datafire.Action({
  handler: async (input) => {
    let page = await http.get({url: URL});
    let $ = cheerio.load(page.body);
    let table = $('#currencies-all tbody');
    let currencies = [];
    table.find('tr').each(function() {
      if (currencies.length > NUM_CURRENCIES) return;
      let row = $(this);
      let currency = {};
      currency.name = row.find('.currency-name-container').text().trim();
      currency.link = SITE + row.find('.currency-name-container').attr('href');
      currency.symbol = row.find('.currency-symbol').text().trim();
      currency.market_cap = parseNumber(row.find('.market-cap').text());
      currency.price = parseNumber(row.find('.price').text());
      currency.week_change = parseNumber(row.find('.percent-change[data-timespan="7d"]').text());
      currencies.push(currency);
    })
    return currencies;
  },
});
