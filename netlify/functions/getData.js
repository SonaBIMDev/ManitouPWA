const { google } = require('googleapis');

exports.handler = async (event, context) => {
  try {
    console.log("Début de la fonction getData");

    // Créer un client JWT
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );

    console.log("Client JWT créé");

    // Créer le client sheets
    const sheets = google.sheets({ version: 'v4', auth });

    console.log("Client Sheets créé");

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID_FROM_URL;
    const range = 'COORDINATES!A2:E';  // Ajustez selon votre feuille

    // Faire la requête pour obtenir les données
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    console.log("Données récupérées de la feuille");

    const rows = response.data.values;
    if (rows.length) {
      console.log("Données trouvées");
      // Traitement des données ici
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: "Données récupérées avec succès", data: rows[0] })
      };
    } else {
      console.log("Aucune donnée trouvée");
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, message: "Aucune donnée trouvée" })
      };
    }

  } catch (error) {
    console.error('Erreur générale dans getData:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
