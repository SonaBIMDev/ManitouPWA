const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const firebaseConfig = require('./firebase-config');

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

exports.handler = async (event, context) => {
    try {
        const snapshot = await get(ref(database, 'elements'));
        if (snapshot.exists()) {
            const elements = snapshot.val();
            const supports = elements.filter(el => el && el.elementid && el.commentaire)
                                     .map(el => ({
                                         elementId: el.elementid,
                                         commentaire: el.commentaire
                                     }));
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, supports })
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ success: false, message: 'Aucun support trouvé' })
            };
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des supports:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: 'Erreur serveur' })
        };
    }
};
