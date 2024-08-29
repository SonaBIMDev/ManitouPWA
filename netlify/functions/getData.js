const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async (event, context) => {
  try {
    console.log("Début de la fonction getData");
    
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID_FROM_URL);
    console.log("GoogleSpreadsheet initialisé");

    console.log("Email du compte de service:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log("ID de la feuille de calcul:", process.env.GOOGLE_SPREADSHEET_ID_FROM_URL);
    
    try {
      await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
      console.log("Authentification réussie");
    } catch (authError) {
      console.error("Erreur d'authentification détaillée:", authError);
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: "Erreur d'authentification", details: authError.message }),
      };
    }

    // Le reste de votre code...

  } catch (error) {
    console.error('Erreur générale dans getData:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
