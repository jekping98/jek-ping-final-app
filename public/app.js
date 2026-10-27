// ============================================================
// 1. FIREBASE CONFIG
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyCQIRIHrFZUow9Sz_QEYwQ-FQnmdYxMuqg",
    authDomain: "jek-ping-app.firebaseapp.com",
    databaseURL: "https://jek-ping-app-default-rtdb.firebaseio.com",
    projectId: "jek-ping-app",
    storageBucket: "jek-ping-app.firebasestorage.app",
    messagingSenderId: "873715422867",
    appId: "1:873715422867:web:f4f70b2d090abad15f5f66"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// ============================================================
// 2. GOOGLE AUTH
// ============================================================
let currentUser = null;
let lastOrderId = null;

function handleGoogleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        currentUser = result.user;
        saveUserToDatabase(currentUser);
        updateUserUI(currentUser);
        showToast('success', 'Login Berhasil', `Selamat datang, ${currentUser.displayName}!`);
    }).catch((error) => {
        showToast('error', 'Login Gagal', error.message);
    });
}

function handleGoogleLogout() {
    if (confirm('Yakin ingin logout?')) {
        auth.signOut().then(() => {
            currentUser = null;
            localStorage.removeItem('jekping_user');
            updateUserUI(null);
            closeAllPages();
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.querySelector('.nav-item').classList.add('active');
            showToast('info', 'Logout', 'Anda sudah logout.');
        });
    }
}

function saveUserToDatabase(user) {
    db.ref('users/' + user.uid).set({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        lastLogin: firebase.database.ServerValue.TIMESTAMP
    });
    localStorage.setItem('jekping_user', JSON.stringify({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
    }));
}

function updateUserUI(user) {
    const btnText = document.getElementById('googleBtnText');
    const profileCard = document.getElementById('userProfileCard');
    const logoutItem = document.getElementById('profileLogoutItem');

    if (user) {
        btnText.textContent = user.displayName.split(' ')[0];
        profileCard.style.display = 'flex';
        logoutItem.style.display = 'flex';
        document.getElementById('userName').textContent = user.displayName;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('profileName').textContent = user.displayName;
        document.getElementById('profileEmail').textContent = user.email;
        if (user.photoURL) {
            document.getElementById('userAvatar').innerHTML = `<img src="${user.photoURL}" style="width:100%;height:100%;border-radius:50%;">`;
            document.getElementById('profileAvatarLarge').innerHTML = `<img src="${user.photoURL}">`;
        }
    } else {
        btnText.textContent = 'Login';
        profileCard.style.display = 'none';
        logoutItem.style.display = 'none';
        document.getElementById('profileName').textContent = 'Pelanggan';
        document.getElementById('profileEmail').textContent = 'Silakan login terlebih dahulu';
        document.getElementById('profileAvatarLarge').innerHTML = '👤';
    }
}

function checkLoginAndOpen(service) {
    if (!currentUser) {
        if (confirm('🔐 Anda perlu login terlebih dahulu.\n\nLogin dengan Google sekarang?')) {
            handleGoogleLogin();
        }
        return;
    }
    if (service === 'belanja') openBelanja();
    else openServicePage(service);
}

function checkSavedUser() {
    const savedUser = localStorage.getItem('jekping_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUserUI(currentUser);
        } catch (e) {
            console.error(e);
        }
    }
}

// ============================================================
// 3. TOAST NOTIFICATION
// ============================================================
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        toast.style.transition = 'all 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================================
// 4. GOOGLE MAPS
// ============================================================
let customerMap, driverMap, trackingMap;
let customerMarker, driverMarker, destinationMarker, trackingDriverMarker;
let directionsService, directionsRenderer;
let userLocation = { lat: -8.185, lng: 111.185 };
let currentRouteDistance = 0;

function initMaps() {
    initCustomerMap();
    initDriverMap();
}

function initCustomerMap() {
    customerMap = new google.maps.Map(document.getElementById('customerMap'), {
        center: userLocation, zoom: 14,
        mapTypeControl: false, streetViewControl: false, fullscreenControl: false
    });
    customerMarker = new google.maps.Marker({
        position: userLocation, map: customerMap, title: 'Lokasi Anda',
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#4CAF50', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }
    });
    destinationMarker = new google.maps.Marker({
        map: customerMap, visible: false,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#FF3B30', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }
    });
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map: customerMap, suppressMarkers: true });
}

function initDriverMap() {
    driverMap = new google.maps.Map(document.getElementById('driverMap'), {
        center: userLocation, zoom: 14,
        mapTypeControl: false, streetViewControl: false, fullscreenControl: false
    });
    driverMarker = new google.maps.Marker({
        position: userLocation, map: driverMap,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: '#FFB800', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }
    });
    setInterval(updateDriverLocation, 5000);
}

function initTrackingMap() {
    if (trackingMap) return;
    trackingMap = new google.maps.Map(document.getElementById('trackingMap'), {
        center: userLocation, zoom: 15,
        mapTypeControl: false, streetViewControl: false, fullscreenControl: false
    });
    trackingDriverMarker = new google.maps.Marker({
        position: userLocation, map: trackingMap, title: 'Driver',
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: '#FFB800', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }
    });
    simulateDriverMovement();
}

function simulateDriverMovement() {
    let offset = 0;
    setInterval(() => {
        if (!trackingMap) return;
        offset += 0.0005;
        trackingDriverMarker.setPosition({
            lat: userLocation.lat + Math.sin(offset) * 0.005,
            lng: userLocation.lng + Math.cos(offset) * 0.005
        });
    }, 2000);
}

function calculateRoute(serviceType) {
    let origin, destination;
    if (serviceType === 'ride') {
        origin = document.getElementById('ridePickup').value;
        destination = document.getElementById('rideDestination').value;
    } else if (serviceType === 'food') {
        origin = document.getElementById('foodFrom').value;
        destination = document.getElementById('foodTo').value;
    } else if (serviceType === 'send') {
        origin = document.getElementById('sendFrom').value;
        destination = document.getElementById('sendTo').value;
    }

    if (!origin || !destination) {
        showToast('warning', 'Data Kurang', 'Mohon isi lokasi asal dan tujuan!');
        return;
    }

    showLoading(true);
    directionsService.route({ origin, destination, travelMode: google.maps.TravelMode.DRIVING }, (result, status) => {
        showLoading(false);
        if (status === 'OK') {
            const route = result.routes[0].legs[0];
            const distance = route.distance.value / 1000;
            currentRouteDistance = distance;
            document.getElementById(`${serviceType}RouteInfo`).style.display = 'flex';
            document.getElementById(`${serviceType}RouteDistance`).textContent = `Jarak: ${route.distance.text}`;
            document.getElementById(`${serviceType}RouteDuration`).textContent = `Estimasi: ${route.duration.text}`;
            updatePriceBasedOnDistance(serviceType, distance);
            showToast('success', 'Rute Dihitung', `Jarak: ${route.distance.text}, ${route.duration.text}`);
        } else {
            showToast('error', 'Gagal', 'Gagal menghitung rute. Pastikan alamat valid.');
        }
    });
}

function updatePriceBasedOnDistance(serviceType, distance) {
    let base, perKm;
    if (serviceType === 'ride') { base = appSettings.rideBase; perKm = appSettings.rideKm; }
    else if (serviceType === 'food') { base = appSettings.foodBase; perKm = appSettings.foodKm; }
    else if (serviceType === 'send') { base = appSettings.sendBase; perKm = appSettings.sendKm; }

    const distanceCost = Math.round(distance * perKm);
    const subtotal = base + distanceCost;
    const commission = Math.round(subtotal * (appSettings.commissionPercent / 100));
    const total = subtotal + commission;

    document.getElementById(`${serviceType}BaseDisplay`).textContent = `Rp ${base.toLocaleString('id-ID')}`;
    document.getElementById(`${serviceType}DistanceCost`).textContent = `Rp ${distanceCost.toLocaleString('id-ID')} (${distance.toFixed(1)} km)`;
    document.getElementById(`${serviceType}CommissionDisplay`).textContent = `Rp ${commission.toLocaleString('id-ID')} (${appSettings.commissionPercent}%)`;
    document.getElementById(`${serviceType}Total`).textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

function centerMapOnUser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
            customerMap.setCenter(userLocation);
            customerMarker.setPosition(userLocation);
            customerMap.setZoom(16);
        }, () => showToast('error', 'GPS', 'Gagal mendapatkan lokasi.'));
    }
}

function updateDriverLocation() {
    if (navigator.geolocation && driverMap) {
        navigator.geolocation.getCurrentPosition((position) => {
            const newLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
            driverMarker.setPosition(newLoc);
            db.ref('drivers/driverpinggir/location').set({
                lat: newLoc.lat, lng: newLoc.lng,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
        });
    }
}

function centerDriverMap() {
    if (navigator.geolocation && driverMap) {
        navigator.geolocation.getCurrentPosition((position) => {
            driverMap.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
            driverMap.setZoom(16);
        });
    }
}

function startNavigation() {
    const dest = document.getElementById('rideDestination')?.value
        || document.getElementById('foodTo')?.value
        || document.getElementById('sendTo')?.value;
    if (!dest) {
        showToast('warning', 'Tujuan', 'Silakan pilih tujuan terlebih dahulu!');
        return;
    }
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`, '_blank');
}

// ============================================================
// 5. DATA TEMPAT (48 Tempat di 8 Desa)
// ============================================================
const allPlaces = [
    // BANDAR
    { id: 1, name: 'Toko Makmur Jaya', type: 'supermarket', typeLabel: 'Supermarket', desa: 'bandar', desaLabel: 'Desa Bandar', address: 'Jl. Raya Bandar No. 12', distance: '0.5 km', rating: 4.8, reviews: 124, status: 'open', img: '🏬' },
    { id: 2, name: 'Warung Bu Siti', type: 'warung', typeLabel: 'Warung Makan', desa: 'bandar', desaLabel: 'Desa Bandar', address: 'Jl. Pasar Bandar', distance: '0.3 km', rating: 4.9, reviews: 89, status: 'open', img: '🍳' },
    { id: 3, name: 'Supermarket Bandar', type: 'supermarket', typeLabel: 'Supermarket', desa: 'bandar', desaLabel: 'Desa Bandar', address: 'Jl. Utama Bandar No. 5', distance: '0.8 km', rating: 4.7, reviews: 203, status: 'open', img: '🏬' },
    { id: 4, name: 'Warung Nasi Bu Yati', type: 'warung', typeLabel: 'Warung Makan', desa: 'bandar', desaLabel: 'Desa Bandar', address: 'Jl. Pasar Bandar Blok C', distance: '0.4 km', rating: 4.8, reviews: 93, status: 'open', img: '🍳' },
    { id: 5, name: 'Toko Sembako Pak Harto', type: 'toko', typeLabel: 'Toko Sembako', desa: 'bandar', desaLabel: 'Desa Bandar', address: 'Jl. Raya Bandar No. 28', distance: '0.6 km', rating: 4.6, reviews: 78, status: 'open', img: '🛍️' },
    { id: 6, name: 'Warung Kopi Pak Bro', type: 'warung', typeLabel: 'Warung Kopi', desa: 'bandar', desaLabel: 'Desa Bandar', address: 'Jl. Pasar Bandar Timur', distance: '0.5 km', rating: 4.7, reviews: 64, status: 'open', img: '☕' },
    { id: 7, name: 'Toko Obat Sehat', type: 'toko', typeLabel: 'Toko Obat', desa: 'bandar', desaLabel: 'Desa Bandar', address: 'Jl. Raya Bandar No. 15', distance: '0.7 km', rating: 4.5, reviews: 41, status: 'open', img: '💊' },
    { id: 8, name: 'Toko Fresh Sayur', type: 'fresh', typeLabel: 'Sayur Segar', desa: 'bandar', desaLabel: 'Desa Bandar', address: 'Jl. Pasar Bandar Barat', distance: '0.4 km', rating: 4.6, reviews: 55, status: 'open', img: '🥬' },
    { id: 101, name: 'SDN 1 Bandar', type: 'sekolah', typeLabel: 'SD Negeri', desa: 'bandar', desaLabel: 'Desa Bandar', address: 'Jl. Pendidikan No. 1', distance: '0.7 km', rating: 4.7, reviews: 156, status: 'open', img: '🏫' },
    { id: 102, name: 'SMPN 1 Bandar', type: 'sekolah', typeLabel: 'SMP Negeri', desa: 'bandar', desaLabel: 'Desa Bandar', address: 'Jl. Pendidikan Raya', distance: '1.0 km', rating: 4.8, reviews: 245, status: 'open', img: '🏫' },
    { id: 201, name: 'Driver Hub Pusat', type: 'driver', typeLabel: 'Driver Hub', desa: 'bandar', desaLabel: 'Desa Bandar', address: 'Jl. Raya Bandar No. 50', distance: '0.4 km', rating: 4.9, reviews: 234, status: 'online', img: '🚗' },
    { id: 202, name: 'Driver Hub Pasar', type: 'driver', typeLabel: 'Driver Hub', desa: 'bandar', desaLabel: 'Desa Bandar', address: 'Jl. Pasar Bandar Timur', distance: '0.6 km', rating: 4.8, reviews: 198, status: 'online', img: '🚗' },
    // BANGUNSARI
    { id: 9, name: 'Toko Bangunsari Jaya', type: 'toko', typeLabel: 'Toko Sembako', desa: 'bangunsari', desaLabel: 'Desa Bangunsari', address: 'Jl. Bangunsari Raya', distance: '1.2 km', rating: 4.5, reviews: 52, status: 'open', img: '🛍️' },
    { id: 10, name: 'Warung Bu Tini', type: 'warung', typeLabel: 'Warung Makan', desa: 'bangunsari', desaLabel: 'Desa Bangunsari', address: 'Jl. Bangunsari Tengah', distance: '1.4 km', rating: 4.6, reviews: 48, status: 'open', img: '🍳' },
    { id: 11, name: 'Minimarket Bangunsari', type: 'supermarket', typeLabel: 'Minimarket', desa: 'bangunsari', desaLabel: 'Desa Bangunsari', address: 'Jl. Bangunsari No. 8', distance: '1.5 km', rating: 4.4, reviews: 67, status: 'open', img: '🏬' },
    { id: 12, name: 'Toko Buah Segar', type: 'fresh', typeLabel: 'Buah Segar', desa: 'bangunsari', desaLabel: 'Desa Bangunsari', address: 'Jl. Bangunsari Market', distance: '1.6 km', rating: 4.3, reviews: 29, status: 'open', img: '🍎' },
    { id: 13, name: 'Warung Bakso Pak Slamet', type: 'warung', typeLabel: 'Warung Bakso', desa: 'bangunsari', desaLabel: 'Desa Bangunsari', address: 'Jl. Bangunsari Selatan', distance: '1.8 km', rating: 4.7, reviews: 71, status: 'open', img: '🍜' },
    { id: 103, name: 'SDN 1 Bangunsari', type: 'sekolah', typeLabel: 'SD Negeri', desa: 'bangunsari', desaLabel: 'Desa Bangunsari', address: 'Jl. Bangunsari Tengah', distance: '1.5 km', rating: 4.5, reviews: 87, status: 'open', img: '🏫' },
    { id: 203, name: 'Driver Hub Bangunsari', type: 'driver', typeLabel: 'Driver Hub', desa: 'bangunsari', desaLabel: 'Desa Bangunsari', address: 'Jl. Bangunsari Raya No. 15', distance: '1.3 km', rating: 4.7, reviews: 145, status: 'online', img: '🚗' },
    // JERUK
    { id: 14, name: 'Toko Jeruk Makmur', type: 'toko', typeLabel: 'Toko Sembako', desa: 'jeruk', desaLabel: 'Desa Jeruk', address: 'Jl. Jeruk Raya', distance: '2.0 km', rating: 4.5, reviews: 45, status: 'open', img: '🛍️' },
    { id: 15, name: 'Warung Bu Minah', type: 'warung', typeLabel: 'Warung Makan', desa: 'jeruk', desaLabel: 'Desa Jeruk', address: 'Jl. Jeruk Tengah', distance: '2.1 km', rating: 4.6, reviews: 56, status: 'open', img: '🍳' },
    { id: 16, name: 'Warung Sate Pak Rahmat', type: 'warung', typeLabel: 'Warung Sate', desa: 'jeruk', desaLabel: 'Desa Jeruk', address: 'Jl. Jeruk Barat', distance: '2.3 km', rating: 4.7, reviews: 58, status: 'open', img: '🍢' },
    { id: 104, name: 'SDN 1 Jeruk', type: 'sekolah', typeLabel: 'SD Negeri', desa: 'jeruk', desaLabel: 'Desa Jeruk', address: 'Jl. Jeruk Raya', distance: '2.2 km', rating: 4.5, reviews: 92, status: 'open', img: '🏫' },
    { id: 204, name: 'Driver Hub Jeruk', type: 'driver', typeLabel: 'Driver Hub', desa: 'jeruk', desaLabel: 'Desa Jeruk', address: 'Jl. Jeruk Raya No. 20', distance: '2.1 km', rating: 4.7, reviews: 128, status: 'online', img: '🚗' },
    // KLEDUNG
    { id: 17, name: 'Toko Kledung Sejahtera', type: 'toko', typeLabel: 'Toko Sembako', desa: 'kledung', desaLabel: 'Desa Kledung', address: 'Jl. Kledung Raya', distance: '2.5 km', rating: 4.4, reviews: 42, status: 'open', img: '🛍️' },
    { id: 18, name: 'Warung Bu Darmi', type: 'warung', typeLabel: 'Warung Makan', desa: 'kledung', desaLabel: 'Desa Kledung', address: 'Jl. Kledung Tengah', distance: '2.6 km', rating: 4.6, reviews: 44, status: 'open', img: '🍳' },
    { id: 19, name: 'Minimarket Kledung', type: 'supermarket', typeLabel: 'Minimarket', desa: 'kledung', desaLabel: 'Desa Kledung', address: 'Jl. Kledung No. 10', distance: '2.7 km', rating: 4.5, reviews: 63, status: 'open', img: '🏬' },
    { id: 20, name: 'Warung Mie Ayam Pak Joko', type: 'warung', typeLabel: 'Warung Mie', desa: 'kledung', desaLabel: 'Desa Kledung', address: 'Jl. Kledung Timur', distance: '2.8 km', rating: 4.7, reviews: 62, status: 'open', img: '🍜' },
    { id: 105, name: 'SDN 1 Kledung', type: 'sekolah', typeLabel: 'SD Negeri', desa: 'kledung', desaLabel: 'Desa Kledung', address: 'Jl. Kledung Raya', distance: '2.7 km', rating: 4.5, reviews: 88, status: 'open', img: '🏫' },
    { id: 205, name: 'Driver Hub Kledung', type: 'driver', typeLabel: 'Driver Hub', desa: 'kledung', desaLabel: 'Desa Kledung', address: 'Jl. Kledung Raya No. 18', distance: '2.6 km', rating: 4.7, reviews: 115, status: 'online', img: '🚗' },
    // NGUNUT
    { id: 21, name: 'Toko Fresh Sayur Ngunut', type: 'fresh', typeLabel: 'Sayur Segar', desa: 'ngunut', desaLabel: 'Desa Ngunut', address: 'Jl. Ngunut Market', distance: '3.0 km', rating: 4.4, reviews: 38, status: 'open', img: '🥬' },
    { id: 22, name: 'Warung Bu Darmi Ngunut', type: 'warung', typeLabel: 'Warung Makan', desa: 'ngunut', desaLabel: 'Desa Ngunut', address: 'Jl. Ngunut Raya', distance: '3.1 km', rating: 4.6, reviews: 44, status: 'open', img: '🍳' },
    { id: 23, name: 'Toko Kelontong Ngunut', type: 'toko', typeLabel: 'Toko Kelontong', desa: 'ngunut', desaLabel: 'Desa Ngunut', address: 'Jl. Ngunut Tengah No. 5', distance: '3.2 km', rating: 4.3, reviews: 31, status: 'open', img: '🛍️' },
    { id: 109, name: 'SDN 2 Ngunut', type: 'sekolah', typeLabel: 'SD Negeri', desa: 'ngunut', desaLabel: 'Desa Ngunut', address: 'Jl. Ngunut Pendidikan', distance: '3.4 km', rating: 4.5, reviews: 75, status: 'open', img: '🏫' },
    { id: 206, name: 'Driver Hub Ngunut', type: 'driver', typeLabel: 'Driver Hub', desa: 'ngunut', desaLabel: 'Desa Ngunut', address: 'Jl. Ngunut Tengah', distance: '3.2 km', rating: 4.6, reviews: 95, status: 'online', img: '🚗' },
    // PETUNGSINARANG
    { id: 24, name: 'Toko Petungsinarang Makmur', type: 'toko', typeLabel: 'Toko Sembako', desa: 'petungsinarang', desaLabel: 'Desa Petungsinarang', address: 'Jl. Petungsinarang Raya', distance: '3.5 km', rating: 4.5, reviews: 48, status: 'open', img: '🛍️' },
    { id: 25, name: 'Warung Bu Sumi', type: 'warung', typeLabel: 'Warung Nasi', desa: 'petungsinarang', desaLabel: 'Desa Petungsinarang', address: 'Jl. Petungsinarang Barat', distance: '3.6 km', rating: 4.6, reviews: 48, status: 'open', img: '🍳' },
    { id: 26, name: 'Minimarket Petungsinarang', type: 'supermarket', typeLabel: 'Minimarket', desa: 'petungsinarang', desaLabel: 'Desa Petungsinarang', address: 'Jl. Petungsinarang No. 12', distance: '3.7 km', rating: 4.5, reviews: 73, status: 'open', img: '🏬' },
    { id: 111, name: 'SDN 1 Petungsinarang', type: 'sekolah', typeLabel: 'SD Negeri', desa: 'petungsinarang', desaLabel: 'Desa Petungsinarang', address: 'Jl. Petungsinarang Pendidikan', distance: '3.6 km', rating: 4.5, reviews: 80, status: 'open', img: '🏫' },
    { id: 207, name: 'Driver Hub Petungsinarang', type: 'driver', typeLabel: 'Driver Hub', desa: 'petungsinarang', desaLabel: 'Desa Petungsinarang', address: 'Jl. Petungsinarang Raya No. 5', distance: '3.6 km', rating: 4.6, reviews: 88, status: 'online', img: '🚗' },
    // TUMPUK
    { id: 27, name: 'Toko Tumpuk Sejahtera', type: 'toko', typeLabel: 'Toko Sembako', desa: 'tumpuk', desaLabel: 'Desa Tumpuk', address: 'Jl. Tu

