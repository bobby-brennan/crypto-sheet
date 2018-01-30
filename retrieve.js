let datafire = require('datafire');
let sheets = require('@datafire/google_sheets').create(datafire.Project.main().accounts.google_sheets);

function getColumnLetter(idx) {
  return String.fromCharCode(idx + 64);
}

const PAGE_SIZE = 200;
const START_ROW = 2;
const END_ROW = START_ROW + PAGE_SIZE
const COLUMNS = require('./columns');
const START_COL = getColumnLetter(1);
const END_COL = getColumnLetter(COLUMNS.length);

module.exports = new datafire.Action({
  handler: async (input, context) => {
    let values = await sheets.spreadsheets.values.get({
      spreadsheetId: context.variables.spreadsheet_id,
      range: START_COL + START_ROW + ':' + END_COL + END_ROW,
      valueRenderOption: "UNFORMATTED_VALUE",
    });
    values = values.values.map(vals => {
      let obj = {};
      COLUMNS.forEach((col, idx) => obj[col] = vals[idx] || '');
      return obj;
    });
    return values;
  },
});
