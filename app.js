const elementIdInput = document.getElementById('elementId');
const getDataButton = document.getElementById('getData');
const setDataButton = document.getElementById('setData');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const commentaireInput = document.getElementById('commentaire');
const imagePreview = document.getElementById('imagePreview');
const urlInput = document.getElementById('url');
const supportSelect = document.getElementById('supportSelect');

let map;
let marker;

// Appelez initMap au chargement de la page
window.onload = function() {
    // Appeler la fonction initMap pour initialiser la carte
    initMap();
    loadSupports();    
};

// Fonction pour charger la liste des supports
async function loadSupports() {
    try {
        const response = await fetch(`${apiBaseUrl}/getSupports`);
        const data = await response.json();
        if (data.success && Array.isArray(data.supports)) {
            data.supports.forEach(support => {
                if (support && support.elementId !== undefined && support.commentaire) {
                    const option = document.createElement('option');
                    option.value = support.elementId;
                    option.textContent = support.commentaire;
                    supportSelect.appendChild(option);
                }
            });
        } else {
            console.error('Format de données invalide:', data);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des supports:', error);
    }
}

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
    console.error('googleMapsUrl:', googleMapsUrl);

    // Mettre à jour le champ texte URL avec l'URL générée
    document.getElementById('url').value = googleMapsUrl;

    // Mettez à jour le marqueur sur la carte
    marker.setPosition(latLng);
    map.setCenter(latLng);
}


const isNetlify = window.location.hostname.includes('netlify.app');
const apiBaseUrl = isNetlify ? '/.netlify/functions' : '/api';

getDataButton.addEventListener('click', async () => {
    const selectedElementId = supportSelect.value;
    if (!selectedElementId) {
        alert('Veuillez sélectionner un support');
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/getData`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elementId: selectedElementId }),
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            if (data.success) {
                latitudeInput.value = data.latitude;
                longitudeInput.value = data.longitude;

                updateMap(data.latitude, data.longitude);

                // Afficher l'image si une URL est fournie
                if (data.imageUrl) {
                    imagePreview.src = data.imageUrl;
                    imagePreview.style.display = 'block';
                } else {
                    imagePreview.style.display = 'none';
                }

            } else {
                alert('Données non trouvées');
            }
        } else {
            const text = await response.text();
            console.error('Réponse non-JSON reçue:', text);
            alert('Erreur: Réponse inattendue du serveur');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue');
    }
});

  

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
    const elementId = supportSelect.value; // Utilisez supportSelect au lieu de elementIdInput
    const latitude = latitudeInput.value;
    const longitude = longitudeInput.value;

    try {
        const response = await fetch(`${apiBaseUrl}/setData`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elementId, latitude, longitude }),
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