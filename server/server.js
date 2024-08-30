const express = require('express');
const path = require('path');
const { getDatabase, ref, get, set } = require('firebase/database');

console.log('Modules chargés');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

console.log('Express configuré');

// Configuration Firebase
const { app: firebaseApp, firebaseConfig } = require('../firebase-config');
console.log('Configuration Firebase chargée:', firebaseConfig);

const database = getDatabase(firebaseApp);
console.log('Base de données Firebase obtenue');

app.post('/api/getData', async (req, res) => {
    console.log('Requête reçue sur /api/getData');
    const { elementId } = req.body;
    console.log('ElementId reçu:', elementId);
    try {
        console.log('Tentative de récupération des données pour elementId:', elementId);
        const snapshot = await get(ref(database, `elements/${elementId}`));
        console.log('Snapshot récupéré');
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log('Données trouvées:', data);
            res.json({
                success: true,
                latitude: data.latitude,
                longitude: data.longitude,
                commentaire: data.commentaire,
                google_maps: data.google_maps
            });
        } else {
            console.log('Aucune donnée trouvée pour elementId:', elementId);
            res.json({ success: false, message: 'Données non trouvées' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

app.post('/api/setData', async (req, res) => {
    console.log('Requête reçue sur /api/setData');
    const { elementId, latitude, longitude, commentaire, google_maps } = req.body;
    console.log('Données reçues:', { elementId, latitude, longitude, commentaire, google_maps });
    try {
        console.log('Tentative d\'écriture des données pour elementId:', elementId);
        await set(ref(database, `elements/${elementId}`), {
            elementid: elementId,
            latitude,
            longitude,
            commentaire,
            google_maps
        });
        console.log('Données écrites avec succès');
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de l\'écriture des données:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});

console.log('Configuration du serveur terminée');