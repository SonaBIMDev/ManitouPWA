const express = require('express');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set } = require('firebase/database');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Configuration Firebase
const firebaseConfig = require('../firebase-config');
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

app.post('/api/getData', async (req, res) => {
    const { elementId } = req.body;
    try {
        const snapshot = await get(ref(database, `elements/${elementId}`));
        if (snapshot.exists()) {
            const data = snapshot.val();
            res.json({
                success: true,
                latitude: data.latitude,
                longitude: data.longitude,
                commentaire: data.commentaire,
                google_maps: data.google_maps
            });
        } else {
            res.json({ success: false, message: 'Données non trouvées' });
        }
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

app.post('/api/setData', async (req, res) => {
    const { elementId, latitude, longitude, commentaire, google_maps } = req.body;
    try {
        await set(ref(database, `elements/${elementId}`), {
            elementid: elementId,
            latitude,
            longitude,
            commentaire,
            google_maps
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
