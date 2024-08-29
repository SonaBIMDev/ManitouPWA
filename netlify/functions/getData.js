const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async (event, context) => {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID_FROM_URL);

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    const { elementId } = JSON.parse(event.body);

    const rows = await sheet.getRows();
    const row = rows.find(r => r.elementId === elementId);

    if (row) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          latitude: row.latitude,
          longitude: row.longitude,
          commentaire: row.commentaire,
          url: row.url,
        }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, message: 'Données non trouvées' }),
      };
    }
  } catch (error) {
    console.error('Erreur dans getData:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
