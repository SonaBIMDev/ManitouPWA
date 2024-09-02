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
