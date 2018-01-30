let datafire = require('datafire');
let sheets = require('@datafire/google_sheets').create(datafire.Project.main().accounts.google_sheets);

let retrieve = require('./retrieve');
let scrape = require('./scrape');

const COLUMNS = require('./columns');

function getColumnLetter(idx) {
  return String.fromCharCode(idx + 64);
}

module.exports = new datafire.Action({
  handler: async (input, context) => {
    let current = await retrieve.run(null, context);
    let next = await scrape.run();
    current.forEach(currency => {
      let update = next.filter(n => n.symbol === currency.symbol).pop();
      if (!update) {
        next.push(currency);
      } else {
        update.notes = currency.notes;
        update.use = currency.use;
        update.institutions = currency.institutions;
      }
    })
    let values = next.map(currency => {
      return COLUMNS.map(key => currency[key] || '');
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: context.variables.spreadsheet_id,
      range: 'A2:' + getColumnLetter(COLUMNS.length) + (next.length + 1),
      body: {values},
      valueInputOption: 'USER_ENTERED',
    }, context)

    return "Success";
  },
});
