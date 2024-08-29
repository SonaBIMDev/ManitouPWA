const express = require('express');
const { google } = require('googleapis');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));


const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '..', 'credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = '1CpczW9Y4ggB1HnUWBn88vG3Gnt-tFiPnLXEZl5s1UXU';
const RANGE = 'COORDINATES!A2:E';

app.post('/api/getData', async (req, res) => {
    const { elementId } = req.body;  // Notez le changement ici de req.query à req.body
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });
        const rows = response.data.values;
        const row = rows.find(r => r[0] === elementId);
        if (row) {
            res.json({
                success: true,
                latitude: row[1],
                longitude: row[2],
                commentaire: row[3],
                url: row[4],
            });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});


app.post('/api/setData', async (req, res) => {
    const { elementId, latitude, longitude, commentaire, url } = req.body;
    try {
        // 1. Récupérer toutes les lignes
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;
        const rowIndex = rows.findIndex(r => r[0] === elementId);

        // 2. Vérifier si la ligne existe
        if (rowIndex === -1) {
            return res.json({ success: false, message: "Element ID non trouvé" });
        }

        // 3. Déterminer la plage spécifique à mettre à jour
        const rowNumber = rowIndex + 2; // +2 parce que les index commencent à 0 et que RANGE commence à la ligne 2
        const updateRange = `COORDINATES!A${rowNumber}:E${rowNumber}`;

        // 4. Mettre à jour la ligne spécifique
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: updateRange,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[elementId, latitude, longitude, commentaire, url]],
            },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  });

  
  const fs = require('fs');

  app.use((req, res) => {
    const filePath = path.join(__dirname, '..', req.url);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).sendFile(path.join(__dirname, '..', 'index.html'));
    }
  });
  

  
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});