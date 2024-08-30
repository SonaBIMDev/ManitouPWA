const elementIdInput = document.getElementById('elementId');
const getDataButton = document.getElementById('getData');
const setDataButton = document.getElementById('setData');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const commentaireInput = document.getElementById('commentaire');
const urlInput = document.getElementById('url');
let map;
let marker;

// Appelez initMap au chargement de la page
window.onload = function() {
    // Appeler la fonction initMap pour initialiser la carte
    initMap();

    // Pré-remplir le champ elementId avec la valeur 272207
    document.getElementById('elementId').value = '272207';
};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0, lng: 0 },
        zoom: 2,
        mapTypeId: 'satellite',
        tilt: 0, // Assure une vue de dessus (2D)
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
    });

    marker = new google.maps.Marker({
        map: map,
        position: { lat: 0, lng: 0 }
    });

    // Ajoutez un écouteur pour le clic droit sur la carte
    map.addListener('rightclick', function(e) {
        showContextMenu(e.domEvent, e.latLng, map);
    });
}

function updateMap(lat, lng) {
    const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
    map.setCenter(position);
    map.setZoom(20);
    marker.setPosition(position);
}

function showContextMenu(event, latLng, map) {
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.innerHTML = '<div class="context-menu-item">Utiliser ces coordonnées</div>';

    // Positionnez le menu à l'endroit du clic
    const mapDiv = map.getDiv();
    const mapRect = mapDiv.getBoundingClientRect();
    
    contextMenu.style.position = 'absolute';
    contextMenu.style.left = (event.clientX - mapRect.left) + 'px';
    contextMenu.style.top = (event.clientY - mapRect.top) + 'px';

    // Ajoutez le menu directement au conteneur de la carte
    mapDiv.appendChild(contextMenu);

    // Gérez le clic sur l'option du menu
    contextMenu.querySelector('.context-menu-item').addEventListener('click', function() {
        updateCoordinates(latLng);
        mapDiv.removeChild(contextMenu);
    });

    // Supprimez le menu après un court délai si aucune action n'est effectuée
    setTimeout(() => {
        if (mapDiv.contains(contextMenu)) {
            mapDiv.removeChild(contextMenu);
        }
    }, 3000);

    // Fermez le menu si on clique ailleurs sur la carte
    map.addListener('click', function() {
        if (mapDiv.contains(contextMenu)) {
            mapDiv.removeChild(contextMenu);
        }
    });
}

function updateCoordinates(latLng) {
    const latitude = latLng.lat().toFixed(6);  // Obtenez la valeur numérique de la latitude
    const longitude = latLng.lng().toFixed(6);  // Obtenez la valeur numérique de la longitude

    // Mettre à jour les champs texte avec les coordonnées
    document.getElementById('latitude').value = latitude;
    document.getElementById('longitude').value = longitude;

    // Générer l'URL Google Maps
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    // Mettre à jour le champ texte URL avec l'URL générée
    document.getElementById('url').value = googleMapsUrl;

    // Mettez à jour le marqueur sur la carte
    marker.setPosition(latLng);
    map.setCenter(latLng);
}


const isNetlify = window.location.hostname.includes('netlify.app');
const apiBaseUrl = isNetlify ? '/.netlify/functions' : '/api';

getDataButton.addEventListener('click', async () => {
    const elementId = elementIdInput.value;
    try {
        const response = await fetch(`${apiBaseUrl}/getData`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elementId }),
        });

        // Vérifiez d'abord le type de contenu de la réponse
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            if (data.success) {
                latitudeInput.value = data.latitude;
                longitudeInput.value = data.longitude;
                commentaireInput.value = data.commentaire;
                urlInput.value = data.google_maps;  

                updateMap(data.latitude, data.longitude);
                
            } else {
                alert('Données non trouvées');
            }
        } else {
            // Si ce n'est pas du JSON, affichez le texte brut
            const text = await response.text();
            console.error('Réponse non-JSON reçue:', text);
            alert('Erreur: Réponse inattendue du serveur');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue');
    }
});



/*
const isNetlify = window.location.hostname.includes('netlify.app');
const apiUrl = isNetlify ? '/.netlify/functions/getData' : '/api/getData';

getDataButton.addEventListener('click', async () => {
    const elementId = elementIdInput.value;
    try {
        let response;
        if (isNetlify) {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ elementId }),
            });
        } else {
            response = await fetch(`${apiUrl}?elementId=${elementId}`);
        }
        const data = await response.json();
        if (data.success) {
            latitudeInput.value = data.latitude;
            longitudeInput.value = data.longitude;
            commentaireInput.value = data.commentaire;
            urlInput.value = data.url;

            updateMap(data.latitude, data.longitude);
        } else {
            alert('Données non trouvées');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue');
    }
});
*/


/*getDataButton.addEventListener('click', async () => {
    const elementId = elementIdInput.value;
    try {
        const response = await fetch('/.netlify/functions/getData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ elementId }),
        });
        const data = await response.json();
        if (data.success) {
            latitudeInput.value = data.latitude;
            longitudeInput.value = data.longitude;
            commentaireInput.value = data.commentaire;
            urlInput.value = data.url;

            // Mettez à jour la carte avec les nouvelles coordonnées
            updateMap(data.latitude, data.longitude);
        } else {
            alert('Données non trouvées');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue');
    }
});
*/

/*getDataButton.addEventListener('click', async () => {
    const elementId = elementIdInput.value;
    try {
        const response = await fetch(`/api/getData?elementId=${elementId}`);
        const data = await response.json();
        if (data.success) {
            latitudeInput.value = data.latitude;
            longitudeInput.value = data.longitude;
            commentaireInput.value = data.commentaire;
            urlInput.value = data.url;

            // Mettez à jour la carte avec les nouvelles coordonnées
            updateMap(data.latitude, data.longitude);

        } else {
            alert('Données non trouvées');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue');
    }
});
*/

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Afficher les coordonnées ou les utiliser pour autre chose
    console.log("Latitude: " + latitude + ", Longitude: " + longitude);

    // Mettre à jour les champs texte avec les coordonnées
    document.getElementById("latitude").value = latitude;
    document.getElementById("longitude").value = longitude;
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

setDataButton.addEventListener('click', async () => {
    const elementId = elementIdInput.value;
    const latitude = latitudeInput.value;
    const longitude = longitudeInput.value;
    const commentaire = commentaireInput.value;
    const url = urlInput.value;

    try {
        const response = await fetch('/api/setData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ elementId, latitude, longitude, commentaire, url }),
        });
        const result = await response.json();
        if (result.success) {
            alert('Données mises à jour avec succès');
        } else {
            alert('Échec de la mise à jour des données');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue');
    }
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('Service Worker enregistré'))
        .catch(error => console.log('Erreur d\'enregistrement du Service Worker:', error));
}