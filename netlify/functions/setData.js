const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set } = require('firebase/database');
const firebaseConfig = require('./firebase-config');

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { elementId, latitude, longitude, commentaire, google_maps } = JSON.parse(event.body);
    console.log('Données reçues:', { elementId, latitude, longitude, commentaire, google_maps });

    const snapshot = await get(ref(database, 'elements'));
    let elements = snapshot.val() || [];
    
    const index = elements.findIndex(el => el && el.elementid === parseInt(elementId));
    
    const updatedElement = {
      elementid: parseInt(elementId),
      latitude,
      longitude,
      commentaire
    };

    if (google_maps !== undefined) {
      updatedElement.google_maps = google_maps;
    }

    if (index !== -1) {
      elements[index] = updatedElement;
      console.log('Élément mis à jour:', elements[index]);
    } else {
      elements.push(updatedElement);
      console.log('Nouvel élément ajouté:', elements[elements.length - 1]);
    }
    
    await set(ref(database, 'elements'), elements);
    console.log('Données écrites avec succès');

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Erreur lors de l\'écriture des données:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Erreur serveur' })
    };
  }
};
