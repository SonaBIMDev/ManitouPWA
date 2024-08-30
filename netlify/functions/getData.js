const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const firebaseConfig = require('./firebase-config');

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

exports.handler = async (event) => {
  try {
    const { elementId } = JSON.parse(event.body);
    const snapshot = await get(ref(database, `elements/${elementId}`));

    if (snapshot.exists()) {
      const data = snapshot.val();
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
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, message: 'Données non trouvées' })
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
