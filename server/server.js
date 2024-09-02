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

app.get('/api/getSupports', async (req, res) => {
    try {
        const snapshot = await get(ref(database, 'elements'));
        if (snapshot.exists()) {
            const elements = snapshot.val();
            const supports = elements.filter(el => el && el.elementid && el.commentaire)
                                     .map(el => ({
                                         elementId: el.elementid,
                                         commentaire: el.commentaire
                                     }));
            res.json({ success: true, supports });
        } else {
            res.json({ success: false, message: 'Aucun support trouvé' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des supports:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});


app.post('/api/getData', async (req, res) => {
    console.log('Requête reçue sur /api/getData');
    const { elementId } = req.body;
    console.log('ElementId reçu:', elementId);
    try {
        console.log('Tentative de récupération des données pour elementId:', elementId);
        const snapshot = await get(ref(database, 'elements'));
        console.log('Snapshot récupéré');
        
        if (snapshot.exists()) {
            const elements = snapshot.val();
            console.log('Données trouvées:', elements);
            
            // Recherche de l'élément avec l'elementId correspondant
            const element = elements.find(el => el && el.elementid === parseInt(elementId));
            
            if (element) {
                console.log('Élément trouvé:', element);
                res.json({
                    success: true,
                    latitude: element.latitude,
                    longitude: element.longitude,
                    imageUrl: element.image_url
                });
            } else {
                console.log('Aucun élément trouvé pour elementId:', elementId);
                res.json({ success: false, message: 'Données non trouvées' });
            }
        } else {
            console.log('Aucune donnée trouvée dans la base');
            res.json({ success: false, message: 'Aucune donnée dans la base' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});


app.post('/api/setData', async (req, res) => {
    console.log('Requête reçue sur /api/setData');
    const { elementId, latitude, longitude } = req.body;
    console.log('Données reçues:', { elementId, latitude, longitude });
    try {
        const snapshot = await get(ref(database, 'elements'));
        console.log('Snapshot récupéré:', snapshot.val());
        let elements = snapshot.val() || [];
        if (!Array.isArray(elements)) {
            console.error('Les éléments ne sont pas un tableau:', elements);
            return res.status(500).json({ success: false, error: 'Structure de données invalide' });
        }
        
        const index = elements.findIndex(el => el && el.elementid === parseInt(elementId));
        console.log('Index trouvé:', index);
        
        const updatedElement = {
            elementid: parseInt(elementId),
            latitude,
            longitude
        };        

        if (index !== -1) {
            elements[index] = updatedElement;
            console.log('Élément mis à jour:', elements[index]);
        } else {
            elements.push(updatedElement);
            console.log('Nouvel élément ajouté:', elements[elements.length - 1]);
        }
        
        await set(ref(database, 'elements'), elements);
        console.log('Données écrites avec succès');
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de l\'écriture des données:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur', details: error.message });
    }
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});

console.log('Configuration du serveur terminée');