const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const firebaseConfig = require('./firebase-config');

console.log('Début de la fonction getData');

const app = initializeApp(firebaseConfig);
console.log('Firebase app initialisée');

const database = getDatabase(app);
console.log('Database récupérée');

exports.handler = async (event) => {
  console.log('Handler appelé avec event:', JSON.stringify(event));
  
  try {
    console.log('Parsing du body de l\'event');
    const { elementId } = JSON.parse(event.body);
    console.log('ElementId reçu:', elementId);

    console.log('Tentative de récupération des données pour elementId:', elementId);
    const snapshot = await get(ref(database, `elements/${elementId}`));
    console.log('Snapshot récupéré');

    if (snapshot.exists()) {
      console.log('Données trouvées pour elementId:', elementId);
      const data = snapshot.val();
      console.log('Données récupérées:', JSON.stringify(data));
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          elementid: data.elementid,
          latitude: data.latitude,
          longitude: data.longitude,
          commentaire: data.commentaire,
          google_maps: data.google_maps
        })
      };
    } else {
      console.log('Aucune donnée trouvée pour elementId:', elementId);
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, message: 'Données non trouvées' })
      };
    }
  } catch (error) {
    console.error('Erreur dans getData:', error);
    console.error('Stack trace:', error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Erreur serveur', details: error.message })
    };
  }
};
