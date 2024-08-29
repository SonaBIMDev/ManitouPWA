const { google } = require('googleapis');

exports.handler = async (event, context) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const SPREADSHEET_ID = '1CpczW9Y4ggB1HnUWBn88vG3Gnt-tFiPnLXEZl5s1UXU';
  const RANGE = 'COORDINATES!A2:E';

  try {
    const { elementId } = JSON.parse(event.body);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    const row = rows.find(r => r[0] === elementId);

    if (row) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          latitude: row[1],
          longitude: row[2],
          commentaire: row[3],
          url: row[4],
        })
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false })
      };
    }
  } catch (error) {
    console.error('Erreur:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Erreur serveur' })
    };
  }
};
