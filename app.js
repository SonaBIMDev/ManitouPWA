const elementIdInput = document.getElementById('elementId');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const commentaireInput = document.getElementById('commentaire');
const imagePreview = document.getElementById('imagePreview');
const urlInput = document.getElementById('url');
const supportSelect = document.getElementById('supportSelect');
const mapContainer = document.querySelector('.map-container');

const isNetlify = window.location.hostname.includes('netlify.app');
const apiBaseUrl = isNetlify ? '/.netlify/functions' : '/api';

const toggleMapButton = document.getElementById('toggleMap');
const toggleTrackingButton = document.getElementById('toggleTracking');
const logArea = document.getElementById('logArea');
const clearLogButton = document.getElementById('clearLog');


let map;
let marker;
let watchId;

// Appelez initMap au chargement de la page
window.onload = function() {
    startWatchingPosition();
    loadSupports();    
};

function initMap(lat, lon) {
    console.log(`Initialisation de la carte avec lat: ${lat}, lon: ${lon}`);
    map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    marker = L.marker([lat, lon]).addTo(map);
    console.log("Carte initialisée");
}

function updatePosition(position) {
    console.log("Position mise à jour reçue");
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    console.log(`Nouvelles coordonnées : lat ${lat}, lon ${lon}`);

    // Mettre à jour les champs texte avec les coordonnées
    document.getElementById('latitude').textContent = lat;
    document.getElementById('longitude').textContent = lon;

    if (!map) {
        console.log("Première initialisation de la carte");
        initMap(lat, lon);
    } else {
        console.log("Mise à jour de la position sur la carte existante");
        map.setView([lat, lon], 20);
        marker.setLatLng([lat, lon]);
    }

    // Appeler la fonction setData pour mettre à jour les données dans la base
    setData(lat, lon);
}

function handleError(error) {
    console.error("Erreur de géolocalisation:", error.message);
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("L'utilisateur a refusé la demande de géolocalisation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Les informations de localisation sont indisponibles.");
            break;
        case error.TIMEOUT:
            alert("La demande de géolocalisation a expiré.");
            break;
        case error.UNKNOWN_ERROR:
            alert("Une erreur inconnue s'est produite.");
            break;
    }
}

function startWatchingPosition() {
    if ("geolocation" in navigator) {
        console.log("Géolocalisation supportée, démarrage de watchPosition");
        watchId = navigator.geolocation.watchPosition(updatePosition, handleError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    } else {
        console.error("La géolocalisation n'est pas supportée par ce navigateur.");
    }
}

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


supportSelect.addEventListener('change', async () => {
    const selectedElementId = supportSelect.value;
    if (!selectedElementId) {
        alert('Veuillez sélectionner un support');
        console.log('Veuillez sélectionner un support');
        return;
    }
    const selectedOption = supportSelect.options[supportSelect.selectedIndex];
    const selectedSupportName = selectedOption.textContent;
    console.log('Vous avez sélectionné le support: ' + selectedSupportName);
    
});

// Redéfinir console.log pour afficher les logs dans logArea
(function() {
    const originalLog = console.log;
    console.log = function(message) {
        originalLog.apply(console, arguments);
        const logMessage = document.createElement('div');
        logMessage.textContent = message;
        logArea.appendChild(logMessage);
        logArea.scrollTop = logArea.scrollHeight;
    };
})();


async function setData(latitude, longitude) {
    const elementId = supportSelect.value;
    if (!elementId) {
        console.log('Aucun support sélectionné');
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/setData`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elementId, latitude, longitude }),
        });
        const result = await response.json();
        if (result.success) {
            console.log('Données mises à jour avec succès');
        } else {
            console.log('Échec de la mise à jour des données');
        }
    } catch (error) {
        console.error('Erreur:', error);
        console.log('Une erreur est survenue lors de la mise à jour des données');
    }
}

// Écouteur pour le bouton de suivi GPS
toggleTrackingButton.addEventListener('change', function() {
    if (this.checked) {
        startWatchingPosition();
    } else {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
        console.log('Suivi GPS désactivé');
    }
});

function getSelectedInterval() {
    return parseInt(intervalSelect.value);
}


intervalSelect.addEventListener('change', function() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
    startWatchingPosition();
});


// Fonction pour obtenir la position actuelle et mettre à jour les données
async function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            document.getElementById('latitude').textContent = latitude;
            document.getElementById('longitude').textContent = longitude;
            
            updateMap(latitude, longitude);
            await setData(latitude, longitude);
        }, showError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    } else {
        alert("La géolocalisation n'est pas supportée par ce navigateur.");
    }
}


async function updatePositionAndData(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Mettre à jour les champs texte avec les coordonnées
    document.getElementById("latitude").textContent = latitude;
    document.getElementById("longitude").textContent = longitude;

    // Mettre à jour la carte
    updateMap(latitude, longitude);

    // Appeler la fonction setData pour mettre à jour les données dans la base
    await setData(latitude, longitude);
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Afficher les coordonnées ou les utiliser pour autre chose
    console.log("Latitude: " + latitude + ", Longitude: " + longitude);

    // Mettre à jour les champs texte avec les coordonnées
    document.getElementById("latitude").textContent = latitude;
    document.getElementById("longitude").textContent = longitude;
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

clearLogButton.addEventListener('click', () => {
    logArea.innerHTML = '';
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('Service Worker enregistré'))
        .catch(error => console.log('Erreur d\'enregistrement du Service Worker:', error));
}


// Vérification de Leaflet
if (typeof L !== 'undefined') {
    console.log("Leaflet est chargé");
} else {
    console.error("Leaflet n'est pas chargé");
}
