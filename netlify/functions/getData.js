const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async (event, context) => {
  try {
    console.log("Début de la fonction getData");
    
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID_FROM_URL);
    console.log("GoogleSpreadsheet initialisé");

    // Vérification des variables d'environnement
    console.log("Email du compte de service:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    console.log("ID de la feuille de calcul:", process.env.GOOGLE_SPREADSHEET_ID_FROM_URL);
    
    // Tentative d'authentification
    try {
      await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
      console.log("Authentification réussie");
    } catch (authError) {
      console.error("Erreur d'authentification:", authError);
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: "Erreur d'authentification" }),
      };
    }

    // Tentative de chargement des informations du document
    try {
      await doc.loadInfo();
      console.log("Informations du document chargées");
      console.log("Titre du document:", doc.title);
    } catch (loadError) {
      console.error("Erreur de chargement des informations:", loadError);
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: "Erreur de chargement des informations du document" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Connexion à la Google Sheet réussie" }),
    };

  } catch (error) {
    console.error('Erreur générale dans getData:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
