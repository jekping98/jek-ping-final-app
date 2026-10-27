

// ===== FIREBASE CONFIG (NEW PROJECT) =====
var db = null, firebaseReady = false;
try {
    const firebaseConfig = {
        apiKey: "AIzaSyDrCIveGKsq_rUGKSMeRQD6GbwvrjIeklM",
        authDomain: "jek-ping-app-8768f.firebaseapp.com",
        projectId: "jek-ping-app-8768f",
        storageBucket: "jek-ping-app-8768f.firebasestorage.app",
        messagingSenderId: "765553811005",
        appId: "1:765553811005:web:0fcdbd52b1e29077fc5454",
        measurementId: "G-EYYCQ20KXR"
    };
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    firebaseReady = true;
    console.log("✅ Firebase Connected");
} catch (e) {
    console.error("❌ Firebase Error:", e);
}

// ===== GLOBAL VARIABLES =====
var currentBalance = 0, driverWalletBalance = 0, selectedAmount = 0, selectedFile = null, adminLoggedIn = false;
var currentPaymentMethod = "cash", currentRouteDistance = 0;
var userLocation = { lat: -8.185, lng: 111.185 }; // Default: Pacitan Area
var customerMap, driverMap, trackingMap, customerMarker, driverMarker, destinationMarker, trackingDriverMarker;
var directionsService, directionsRenderer, mapsReady = false;
var userOrders = [], driverOrderCount = 0, isDriverOnline = true;
var currentDesa = "semua", currentCategory = "semua", currentSearch = "";
var currentOrderFilter = "all", currentPromoFilter = "all";
var currentRating = 0, currentRatingOrderId = null, lastOrderId = null;

var appSettings = {
    rideBase: 6000, rideKm: 2000,
    foodBase: 8000, foodKm: 2500,
    sendBase: 10000, sendKm: 3000,
    commissionPercent: 10, minDriverBalance: 10000,
    qrisMerchant: "BOLO DEWE CENTER", qrisNmid: "ID1026513619555"
};

// ===== DATA STATIC =====
var allPlaces = [
    { id: 1, name: "Toko Makmur Jaya", type: "supermarket", typeLabel: "Supermarket", desa: "bandar", desaLabel: "Desa Bandar", address: "Jl. Raya Bandar No. 12", distance: "0.5 km", rating: 4.8, reviews: 124, status: "open", img: "🏬" },
    { id: 2, name: "Warung Bu Siti", type: "warung", typeLabel: "Warung Makan", desa: "bandar", desaLabel: "Desa Bandar", address: "Jl. Pasar Bandar", distance: "0.3 km", rating: 4.9, reviews: 89, status: "open", img: "🍳" },
    { id: 3, name: "Supermarket Bandar", type: "supermarket", typeLabel: "Supermarket", desa: "bandar", desaLabel: "Desa Bandar", address: "Jl. Utama Bandar No. 5", distance: "0.8 km", rating: 4.7, reviews: 203, status: "open", img: "🏬" },
    { id: 9, name: "Toko Bangunsari Jaya", type: "toko", typeLabel: "Toko Sembako", desa: "bangunsari", desaLabel: "Desa Bangunsari", address: "Jl. Bangunsari Raya", distance: "1.2 km", rating: 4.5, reviews: 52, status: "open", img: "🛍️" },
    { id: 14, name: "Toko Jeruk Makmur", type: "toko", typeLabel: "Toko Sembako", desa: "jeruk", desaLabel: "Desa Jeruk", address: "Jl. Jeruk Raya", distance: "2.0 km", rating: 4.5, reviews: 45, status: "open", img: "🛍️" },
    { id: 17, name: "Toko Kledung Sejahtera", type: "toko", typeLabel: "Toko Sembako", desa: "kledung", desaLabel: "Desa Kledung", address: "Jl. Kledung Raya", distance: "2.5 km", rating: 4.4, reviews: 42, status: "open", img: "🛍️" },
    { id: 21, name: "Toko Fresh Sayur Ngunut", type: "fresh", typeLabel: "Sayur Segar", desa: "ngunut", desaLabel: "Desa Ngunut", address: "Jl. Ngunut Market", distance: "3.0 km", rating: 4.4, reviews: 38, status: "open", img: "🥬" },
    { id: 24, name: "Toko Petungsinarang Makmur", type: "toko", typeLabel: "Toko Sembako", desa: "petungsinarang", desaLabel: "Desa Petungsinarang", address: "Jl. Petungsinarang Raya", distance: "3.5 km", rating: 4.5, reviews: 48, status: "open", img: "🛍️" },
    { id: 27, name: "Toko Tumpuk Sejahtera", type: "toko", typeLabel: "Toko Sembako", desa: "tumpuk", desaLabel: "Desa Tumpuk", address: "Jl. Tumpuk Raya", distance: "4.0 km", rating: 4.4, reviews: 39, status: "open", img: "🛍️" },
    { id: 30, name: "Toko Kelontong Bu Ani", type: "toko", typeLabel: "Toko Kelontong", desa: "watupatok", desaLabel: "Desa Watupatok", address: "Jl. Watupatok No. 3", distance: "1.8 km", rating: 4.5, reviews: 34, status: "open", img: "🛍️" },
    { id: 201, name: "Driver Hub Pusat", type: "driver", typeLabel: "Driver Hub", desa: "bandar", desaLabel: "Desa Bandar", address: "Jl. Raya Bandar No. 50", distance: "0.4 km", rating: 4.9, reviews: 234, status: "online", img: "🚗" }
];

var allPromos = [
    { id: 1, category: "newuser", icon: "🎁", color: "red", title: "Diskon 50% Pengguna Baru", desc: "Potongan 50% untuk 3 pesanan pertama.", code: "NEWBIE50", timer: "2 Hari" },
    { id: 2, category: "cashback", icon: "💰", color: "orange", title: "Cashback 30% Makanan", desc: "Cashback 30% jam makan siang.", code: "MAKAN30", timer: "5 Hari" },
    { id: 3, category: "mission", icon: "🎯", color: "green", title: "5 Order = Rp 25.000", desc: "Selesaikan 5 order seminggu.", code: "MISSION5", timer: "6 Hari" },
    { id: 4, category: "cashback", icon: "🏍️", color: "blue", title: "Gratis Ongkir Weekend", desc: "Gratis ongkir s/d Rp 15.000.", code: "WEEKEND", timer: "3 Hari" },
    { id: 5, category: "newuser", icon: "🎉", color: "red", title: "Bonus Rp 10.000", desc: "Register sekarang bonus saldo.", code: "WELCOME", timer: "7 Hari" },
    { id: 6, category: "mission", icon: "👥", color: "orange", title: "Ajak Teman Rp 50.000", desc: "Ajak 10 teman order pertama.", code: "REFERRAL", timer: "10 Hari" },
    { id: 7, category: "cashback", icon: "📦", color: "green", title: "Cashback Barang 20%", desc: "Cashback 20% setiap Senin.", code: "KIRIM20", timer: "4 Hari" },
    { id: 8, category: "mission", icon: "⭐", color: "blue", title: "Rating 5 Bintang", desc: "Rating 5 bintang 3 order.", code: "RATING5", timer: "8 Hari" }
];

// ===== INITIALIZATION =====
window.onload = function () {
    updUI();
    renderPromoList();
    
    // Load Initial Balances
    if (firebaseReady && db) {
        db.ref('customers/demo/balance').once('value', function (s) { 
            currentBalance = s.val() || 0; 
            updateBalanceUI(); 
        });
        db.ref('drivers/driverpinggir/balance').once('value', function (s) { 
            driverWalletBalance = s.val() || 0; 
            var el = document.getElementById('driverWalletBalance'); 
            if (el) el.textContent = 'Rp ' + driverWalletBalance.toLocaleString('id-ID'); 
        });
    }
    
    console.log('JEK-PING App Loaded! Firebase: ' + (firebaseReady ? 'OK' : 'FAIL'));
};

// ===== UTILITIES =====
function showToast(type, title, message) {
    var c = document.getElementById("toastContainer"); if (!c) return;
    var ic = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
    var d = document.createElement("div"); d.className = "toast " + type;
    d.innerHTML = '<div style="font-size:20px">' + (ic[type] || "ℹ️") + '</div><div style="flex:1"><div style="font-size:12px;font-weight:700;color:#333">' + title + '</div><div style="font-size:10px;color:#666">' + message + '</div></div>';
    c.appendChild(d);
    setTimeout(function () { d.style.opacity = "0"; d.style.transform = "translateX(-50%) translateY(-20px)"; d.style.transition = "all 0.3s"; setTimeout(function () { d.remove() }, 300) }, 3000);
}

function showLoading(s) { var e = document.getElementById('loadingOverlay'); if (e) e.classList.toggle('active', s); }

function updUI() {
    var e2 = document.getElementById("dynamicPricing");
    if (e2) e2.innerHTML = "🏍️ Antar Jemput: Rp " + appSettings.rideBase.toLocaleString() + " + (Rp " + appSettings.rideKm.toLocaleString() + "/km)<br>🍔 Antar Makanan: Rp " + appSettings.foodBase.toLocaleString() + " + (Rp " + appSettings.foodKm.toLocaleString() + "/km)<br>📦 Antar Barang: Rp " + appSettings.sendBase.toLocaleString() + " + (Rp " + appSettings.sendKm.toLocaleString() + "/km)<br>⚙️ <b>Komisi: " + appSettings.commissionPercent + "%</b><br>💳 QRIS: <b>" + appSettings.qrisMerchant + "</b>";
}

// ===== NAVIGATION & TABS =====
function switchTab(tab, el) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
    if (tab === 'home') { document.getElementById('homeTab').style.display = 'block'; document.getElementById('walletTab').style.display = 'none'; }
    else if (tab === 'wallet') { document.getElementById('homeTab').style.display = 'none'; document.getElementById('walletTab').style.display = 'block'; }
}

function switchNav(page, el) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');
    if (page === 'home') { closeAllPages(); document.getElementById('mainApp').classList.add('active'); }
    else if (page === 'orders') { loadOrders(); openPage('orders'); }
    else if (page === 'promo') { renderPromoList(); openPage('promo'); }
    else if (page === 'profile') { openPage('profile'); }
}

function openPage(p) { closeAllPages(); var e = document.getElementById("page" + p.charAt(0).toUpperCase() + p.slice(1)); if (e) e.classList.add('active'); }
function closePage(p) { var e = document.getElementById("page" + p.charAt(0).toUpperCase() + p.slice(1)); if (e) e.classList.remove('active'); }
function closeAllPages() {
    var cls = ["service-page", "login-page", "dashboard-page", "orders-page", "promo-page", "profile-page", "tracking-page", "belanja-page"];
    for (var c = 0; c < cls.length; c++) { var els = document.querySelectorAll("." + cls[c]); for (var i = 0; i < els.length; i++) els[i].classList.remove('active'); }
}

function openServicePage(t) {
    var e = document.getElementById("page" + t.charAt(0).toUpperCase() + t.slice(1));
    if (e) e.classList.add('active');
    setTimeout(function () { if (t === 'ride' && customerMap && typeof google !== "undefined") google.maps.event.trigger(customerMap, "resize"); }, 300);
}
function closeServicePage(t) { var e = document.getElementById("page" + t.charAt(0).toUpperCase() + t.slice(1)); if (e) e.classList.remove('active'); }

// ===== GOOGLE MAPS =====
function initMaps() {
    try {
        if (typeof google === "undefined" || !google.maps) { console.warn("Maps not loaded yet"); return; }
        var cm = document.getElementById("customerMap");
        if (cm) {
            customerMap = new google.maps.Map(cm, { center: userLocation, zoom: 14, mapTypeControl: false, streetViewControl: false, fullscreenControl: false });
            customerMarker = new google.maps.Marker({ position: userLocation, map: customerMap, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#4CAF50", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 } });
            destinationMarker = new google.maps.Marker({ map: customerMap, visible: false, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: "#FF3B30", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 } });
            directionsService = new google.maps.DirectionsService();
            directionsRenderer = new google.maps.DirectionsRenderer({ map: customerMap, suppressMarkers: true });
        }
        var dm = document.getElementById("driverMap");
        if (dm) {
            driverMap = new google.maps.Map(dm, { center: userLocation, zoom: 14, mapTypeControl: false, streetViewControl: false, fullscreenControl: false });
            driverMarker = new google.maps.Marker({ position: userLocation, map: driverMap, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: "#FFB800", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 } });
        }
        mapsReady = true; console.log("✅ Maps Ready");
    } catch (e) { console.error("Maps err:", e); }
}

function initTrackingMap() {
    if (trackingMap) return;
    var el = document.getElementById("trackingMap");
    if (!el || typeof google === "undefined") return;
    try {
        trackingMap = new google.maps.Map(el, { center: userLocation, zoom: 15, mapTypeControl: false, streetViewControl: false, fullscreenControl: false });
        trackingDriverMarker = new google.maps.Marker({ position: userLocation, map: trackingMap, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: "#FFB800", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 } });
        var off = 0;
        setInterval(function () { if (!trackingMap) return; off += .0005; trackingDriverMarker.setPosition({ lat: userLocation.lat + Math.sin(off) * .005, lng: userLocation.lng + Math.cos(off) * .005 }); }, 2000);
    } catch (e) { }
}

function calculateRoute(st) {
    var o, d;
    if (st === "ride") { o = document.getElementById("ridePickup").value; d = document.getElementById("rideDestination").value; }
    else if (st === "food") { o = document.getElementById("foodFrom").value; d = document.getElementById("foodTo").value; }
    else if (st === "send") { o = document.getElementById("sendFrom").value; d = document.getElementById("sendTo").value; }
    if (!o || !d) { showToast("warning", "Data Kurang", "Isi lokasi asal dan tujuan!"); return; }
    
    if (!mapsReady || !directionsService) {
        currentRouteDistance = 3; updPrice(st, 3);
        var ri = document.getElementById(st + "RouteInfo"); if (ri) ri.classList.add("show");
        var rd = document.getElementById(st + "RouteDistance"); if (rd) rd.textContent = "Jarak: ~3 km (Estimasi)";
        var rt = document.getElementById(st + "RouteDuration"); if (rt) rt.textContent = "Estimasi: ~10 menit";
        return;
    }
    showLoading(true);
    directionsService.route({ origin: o, destination: d, travelMode: google.maps.TravelMode.DRIVING }, function (r, s) {
        showLoading(false);
        if (s === "OK") {
            var lg = r.routes[0].legs[0], dist = lg.distance.value / 1000;
            currentRouteDistance = dist;
            var ri2 = document.getElementById(st + "RouteInfo"); if (ri2) ri2.classList.add("show");
            var rd2 = document.getElementById(st + "RouteDistance"); if (rd2) rd2.textContent = "Jarak: " + lg.distance.text;
            var rt2 = document.getElementById(st + "RouteDuration"); if (rt2) rt2.textContent = "Estimasi: " + lg.duration.text;
            updPrice(st, dist); showToast("success", "Rute Dihitung", "Jarak: " + lg.distance.text);
        } else { showToast("error", "Gagal", "Gagal hitung rute. Cek koneksi/API Key."); }
    });
}

function updPrice(st, dist) {
    var b, pk;
    if (st === "ride") { b = appSettings.rideBase; pk = appSettings.rideKm; }
    else if (st === "food") { b = appSettings.foodBase; pk = appSettings.foodKm; }
    else if (st === "send") { b = appSettings.sendBase; pk = appSettings.sendKm; }
    else return;
    var dc = Math.round(dist * pk), sub = b + dc, com = Math.round(sub * (appSettings.commissionPercent / 100)), tot = sub + com;
    var e;
    e = document.getElementById(st + "BaseDisplay"); if (e) e.textContent = "Rp " + b.toLocaleString("id-ID");
    e = document.getElementById(st + "DistanceCost"); if (e) e.textContent = "Rp " + dc.toLocaleString("id-ID") + " (" + dist.toFixed(1) + " km)";
    e = document.getElementById(st + "CommissionDisplay"); if (e) e.textContent = "Rp " + com.toLocaleString("id-ID") + " (" + appSettings.commissionPercent + "%)";
    e = document.getElementById(st + "Total"); if (e) e.textContent = "Rp " + tot.toLocaleString("id-ID");
}

function startNavigation() {
    var d = ""; var e1 = document.getElementById("rideDestination"); if (e1) d = e1.value;
    if (!d) { var e2 = document.getElementById("foodTo"); if (e2) d = e2.value; }
    if (!d) { var e3 = document.getElementById("sendTo"); if (e3) d = e3.value; }
    if (!d) { showToast("warning", "Tujuan", "Pilih tujuan dulu!"); return; }
    window.open("https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(d) + "&travelmode=driving", "_blank");
}

// ===== REAL-TIME LISTENERS =====
if (firebaseReady && db) {
    try {
        db.ref("settings").on("value", function (s) { if (s.exists()) { appSettings = Object.assign({}, appSettings, s.val()); updUI(); } else { db.ref("settings").set(appSettings); } }, function (e) { console.error(e); });
        db.ref("customers/demo/balance").on("value", function (snap) {
            var newBal = snap.val() || 0;
            if (newBal !== currentBalance && currentBalance !== 0) { showToast('success', '💰 Saldo Masuk!', '+' + 'Rp ' + (newBal - currentBalance).toLocaleString('id-ID')); }
            currentBalance = newBal; updateBalanceUI();
        });
        db.ref("drivers/driverpinggir/balance").on("value", function (snap) {
            driverWalletBalance = snap.val() || 0;
            var el = document.getElementById("driverWalletBalance"); if (el) el.textContent = "Rp " + driverWalletBalance.toLocaleString("id-ID");
        });
    } catch (e) { console.error(e); }
}

function updateBalanceUI() {
    var el = document.getElementById("balanceAmount"); if (el) el.textContent = "Rp " + currentBalance.toLocaleString("id-ID");
    loadRecentTransactions(); loadPendingTopUps();
}

// ===== TOP-UP CUSTOMER =====
function selectAmount(amount, el) {
    selectedAmount = amount;
    document.querySelectorAll('.topup-amount').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
}
function handleFileSelect(e) { var file = e.target.files[0]; if (file) { selectedFile = file; document.getElementById('fileName').textContent = '✅ ' + file.name; } }
function openTopUpModal() {
    if (selectedAmount === 0) { showToast('warning', 'Pilih Nominal', 'Pilih nominal top-up dulu!'); return; }
    document.getElementById('confirmAmount').textContent = 'Rp ' + selectedAmount.toLocaleString('id-ID');
    document.getElementById('topUpModal').classList.add('active');
}
function closeTopUpModal() { document.getElementById('topUpModal').classList.remove('active'); }
function processTopUp() { if (selectedAmount === 0) { showToast('warning', 'Pilih Nominal', 'Pilih nominal dulu!'); return; } openTopUpModal(); }

function submitTopUp() {
    if (!firebaseReady) { showToast('error', 'Error', 'Firebase tidak tersedia'); return; }
    if (selectedAmount === 0) { showToast('warning', 'Error', 'Pilih nominal dulu'); return; }
    showToast('info', 'Memproses', 'Mengirim request top-up...');
    var txRef = db.ref('topups').push();
    var txData = {
        userId: 'customers/demo', role: 'customer', amount: selectedAmount, status: 'pending',
        method: 'QRIS', merchant: 'BOLO DEWE CENTER', description: 'Top up saldo pelanggan',
        proofImage: selectedFile ? selectedFile.name : null,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        approvedAt: null, approvedBy: null, adminNote: null
    };
    txRef.set(txData).then(function () {
        closeTopUpModal();
        document.getElementById('successAmount').textContent = 'Rp ' + selectedAmount.toLocaleString('id-ID');
        document.getElementById('successModal').classList.add('active');
        selectedAmount = 0; selectedFile = null;
        document.getElementById('fileName').textContent = '';
        document.querySelectorAll('.topup-amount').forEach(b => b.classList.remove('selected'));
        showToast('success', 'Terkirim!', 'Menunggu verifikasi admin');
    }).catch(function (err) { showToast('error', 'Gagal', err.message); });
}

function closeSuccessModal() { document.getElementById('successModal').classList.remove('active'); }

function loadPendingTopUps() {
    db.ref('topups').orderByChild('userId').equalTo('customers/demo').once('value', function (snap) {
        var container = document.getElementById('pendingList'); if (!container) return;
        if (!snap.exists()) { container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><p>Tidak ada top-up pending</p></div>'; return; }
        var txs = []; snap.forEach(function (c) { var v = c.val(); if (v.status === 'pending') txs.push({ id: c.key, ...v }); });
        if (txs.length === 0) { container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><p>Tidak ada top-up pending</p></div>'; return; }
        var html = '';
        txs.forEach(function (tx) {
            var time = tx.createdAt ? new Date(tx.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';
            html += '<div class="transaction-item"><div class="tx-icon pending">⏳</div><div class="tx-info"><h4>Top-Up Rp ' + tx.amount.toLocaleString('id-ID') + '</h4><p>' + time + '<br><span class="status-badge status-pending">PENDING</span></p></div></div>';
        });
        container.innerHTML = html;
    });
}

function loadRecentTransactions() {
    db.ref('topups').orderByChild('userId').equalTo('customers/demo').limitToLast(10).once('value', function (snap) {
        var container = document.getElementById('recentTransactions'); if (!container) return;
        if (!snap.exists()) { container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>Belum ada transaksi</p></div>'; return; }
        var txs = []; snap.forEach(function (c) { txs.push({ id: c.key, ...c.val() }); }); txs.reverse();
        var html = '';
        txs.slice(0, 5).forEach(function (tx) {
            var time = tx.createdAt ? new Date(tx.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';
            var statusClass = tx.status === 'approved' ? 'in' : tx.status === 'pending' ? 'pending' : 'rejected';
            var statusIcon = tx.status === 'approved' ? '💰' : tx.status === 'pending' ? '⏳' : '❌';
            html += '<div class="transaction-item"><div class="tx-icon ' + statusClass + '">' + statusIcon + '</div><div class="tx-info"><h4>Top-Up Rp ' + tx.amount.toLocaleString('id-ID') + '</h4><p>' + time + '</p></div><div class="tx-amount ' + statusClass + '"><span class="status-badge status-' + tx.status + '">' + tx.status.toUpperCase() + '</span></div></div>';
        });
        container.innerHTML = html;
    });
}

function showHistory() {
    db.ref('topups').orderByChild('userId').equalTo('customers/demo').once('value', function (snap) {
        var container = document.getElementById('historyList');
        if (!snap.exists()) { container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>Belum ada transaksi</p></div>'; document.getElementById('historyModal').classList.add('active'); return; }
        var txs = []; snap.forEach(function (c) { txs.push({ id: c.key, ...c.val() }); }); txs.reverse();
        var html = '';
        txs.forEach(function (tx) {
            var time = tx.createdAt ? new Date(tx.createdAt).toLocaleString('id-ID') : '-';
            var statusClass = tx.status === 'approved' ? 'in' : tx.status === 'pending' ? 'pending' : 'rejected';
            var statusIcon = tx.status === 'approved' ? '💰' : tx.status === 'pending' ? '⏳' : '❌';
            var approvedInfo = tx.approvedAt ? '<br>Disetujui: ' + new Date(tx.approvedAt).toLocaleString('id-ID') : '';
            html += '<div class="transaction-item"><div class="tx-icon ' + statusClass + '">' + statusIcon + '</div><div class="tx-info"><h4>Top-Up Rp ' + tx.amount.toLocaleString('id-ID') + '</h4><p>' + time + approvedInfo + '</p></div><div class="tx-amount ' + statusClass + '"><span class="status-badge status-' + tx.status + '">' + tx.status.toUpperCase() + '</span></div></div>';
        });
        container.innerHTML = html;
        document.getElementById('historyModal').classList.add('active');
    });
}
function closeHistoryModal() { document.getElementById('historyModal').classList.remove('active'); }

// ===== DRIVER SYSTEM =====
function openDriverLogin() { document.getElementById('driverLoginPage').classList.add('active'); }
function closeDriverLogin() { document.getElementById('driverLoginPage').classList.remove('active'); }
function doDriverLogin() {
    var u = document.getElementById('driverUsername'), p = document.getElementById('driverPassword');
    if (u && p && u.value === 'driverpinggir' && p.value === 'driver123') {
        closeDriverLogin();
        document.getElementById('driverDashboard').classList.add('active');
        var dn = document.getElementById('driverName'); if (dn) dn.textContent = 'Driver Pinggir';
        listenForOrders();
        showToast('success', 'Login Driver', 'Selamat bertugas!');
    } else { var err = document.getElementById('driverLoginError'); if (err) err.classList.add('show'); }
}
function doDriverLogout() { if (confirm('Logout?')) document.getElementById('driverDashboard').classList.remove('active'); }
function closeDriverDashboard() { document.getElementById('driverDashboard').classList.remove('active'); }
function toggleDriverStatus() {
    isDriverOnline = !isDriverOnline;
    var t = document.getElementById('driverStatusToggle'), d = document.getElementById('statusDot'), tx = document.getElementById('statusText');
    if (t) { t.classList.toggle('online', isDriverOnline); t.classList.toggle('offline', !isDriverOnline); }
    if (d) { d.classList.toggle('online', isDriverOnline); d.classList.toggle('offline', !isDriverOnline); }
    if (tx) tx.textContent = isDriverOnline ? 'Online' : 'Offline';
    showToast('info', 'Status', isDriverOnline ? 'Online' : 'Offline');
}
function listenForOrders() {
    if (!firebaseReady || !db) return;
    db.ref('orders').orderByChild('status').equalTo('pending').on('child_added', function (snap) { renderInc(snap.key, snap.val()); });
}
function renderInc(id, order) {
    var c = document.getElementById('incomingOrders'); if (!c) return;
    if (c.querySelector('div[style]')) c.innerHTML = '';
    var d = document.createElement('div'); d.className = 'incoming-order'; d.id = 'order-' + id;
    var tl = { ride: '🏍️ Antar Jemput', food: '🍔 Antar Makanan', send: '📦 Antar Barang' };
    d.innerHTML = '<div class="incoming-order-header"><span class="incoming-order-type">' + (tl[order.type] || order.type) + '</span><span class="incoming-order-time">Baru saja</span></div><div class="incoming-order-route">' + order.pickup + ' → ' + order.destination + '</div><div class="incoming-order-address">📞 ' + order.phone + '</div><div class="incoming-order-price">Rp ' + (order.totalPrice || 0).toLocaleString('id-ID') + '</div><div class="incoming-order-actions"><button class="order-accept-btn" onclick="acceptOrd(\'' + id + "',this)\">✅ Terima</button><button class=\"order-decline-btn\" onclick=\"declineOrd('" + id + "',this)\">❌</button></div>";
    c.prepend(d); showToast('info', 'Order Baru!', (tl[order.type] || '') + ' dari ' + order.phone);
}
function acceptOrd(id, btn) {
    if (!firebaseReady || !db) return;
    if (driverWalletBalance < appSettings.minDriverBalance) { showToast('warning', 'Saldo Kurang', 'Min: Rp ' + appSettings.minDriverBalance.toLocaleString('id-ID')); return; }
    db.ref('orders/' + id).update({ status: 'accepted', driverId: 'driverpinggir', driverName: 'Driver Pinggir', acceptedAt: firebase.database.ServerValue.TIMESTAMP }).then(function () {
        var p = btn.closest('.incoming-order'); if (p) p.style.background = '#E8F5E9';
        var a = btn.closest('.incoming-order-actions'); if (a) a.innerHTML = '<span style="color:#4CAF50;font-weight:bold">✅ Diterima</span>';
        driverOrderCount++; var e = document.getElementById('statOrders'); if (e) e.textContent = driverOrderCount;
        showToast('success', 'Diterima', 'Menuju lokasi penjemputan');
    });
}
function declineOrd(id, btn) {
    if (!firebaseReady || !db) return;
    db.ref('orders/' + id).update({ status: 'cancelled' }).then(function () {
        var p = btn.closest('.incoming-order'); if (p) p.style.opacity = '0.5';
        var a = btn.closest('.incoming-order-actions'); if (a) a.innerHTML = '<span style="color:#F44336">❌ Ditolak</span>';
    });
}

// ===== DRIVER WALLET =====
function openDriverTopUpModal() { document.getElementById('driverTopUpModal').classList.add('active'); }
function closeDriverTopUpModal() { document.getElementById('driverTopUpModal').classList.remove('active'); }
function confirmDriverTopUp() {
    var ae = document.getElementById('driverTopUpAmount'), a = ae ? parseInt(ae.value) : 0;
    if (!a || a < 10000) { showToast('warning', 'Jumlah', 'Min Rp 10.000'); return; }
    if (!firebaseReady || !db) { showToast('error', 'Offline', 'Firebase tidak tersedia'); return; }
    showLoading(true);
    var nb = driverWalletBalance + a;
    db.ref('drivers/driverpinggir/balance').set(nb);
    db.ref('drivers/driverpinggir/transactions').push({ type: 'topup', amount: a, description: 'Top up saldo driver via QRIS', timestamp: firebase.database.ServerValue.TIMESTAMP });
    showLoading(false); closeDriverTopUpModal();
    if (ae) ae.value = '';
    showToast('success', 'Top Up Berhasil!', 'Saldo: Rp ' + nb.toLocaleString('id-ID'));
}
function showDriverHistory() {
    if (!firebaseReady || !db) { showToast('info', 'Riwayat', 'Firebase tidak tersedia'); return; }
    db.ref('drivers/driverpinggir/transactions').orderByChild('timestamp').limitToLast(20).once('value', function (snap) {
        var container = document.getElementById('driverHistoryList');
        if (!snap.exists()) { container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>Belum ada transaksi</p></div>'; document.getElementById('driverHistoryModal').classList.add('active'); return; }
        var txs = []; snap.forEach(function (c) { txs.push({ id: c.key, ...c.val() }); }); txs.reverse();
        var html = '';
        txs.forEach(function (tx) {
            var time = tx.timestamp ? new Date(tx.timestamp).toLocaleString('id-ID') : '-';
            var isIn = tx.type === 'topup';
            html += '<div class="transaction-item"><div class="tx-icon ' + (isIn ? 'in' : 'out') + '">' + (isIn ? '💰' : '💸') + '</div><div class="tx-info"><h4>' + (tx.description || 'Transaksi') + '</h4><p>' + time + '</p></div><div class="tx-amount ' + (isIn ? 'in' : 'out') + '">' + (isIn ? '+' : '-') + 'Rp ' + (tx.amount || 0).toLocaleString('id-ID') + '</div></div>';
        });
        container.innerHTML = html;
        document.getElementById('driverHistoryModal').classList.add('active');
    });
}
function closeDriverHistoryModal() { document.getElementById('driverHistoryModal').classList.remove('active'); }

// ===== ADMIN SYSTEM =====
function openAdminLogin() { document.getElementById('adminLoginPage').classList.add('active'); }
function closeAdminLogin() { document.getElementById('adminLoginPage').classList.remove('active'); }
function doAdminLogin() {
    var e = document.getElementById('adminEmail'), p = document.getElementById('adminPassword');
    if (e && p && e.value === 'simpletutorial536@gmail.com' && p.value === 'admin123') {
        closeAdminLogin();
        document.getElementById('adminDashboard').classList.add('active');
        loadAdmin();
        showToast('success', 'Login Admin', 'Selamat datang!');
    } else { var err = document.getElementById('adminLoginError'); if (err) err.classList.add('show'); }
}
function doAdminLogout() { if (confirm('Logout?')) document.getElementById('adminDashboard').classList.remove('active'); }
function closeAdminDashboard() { document.getElementById('adminDashboard').classList.remove('active'); }

function loadAdmin() {
    if (!firebaseReady || !db) return;
    db.ref('topups').orderByChild('status').equalTo('pending').on('value', function (snap) {
        var container = document.getElementById('adminPendingList'); if (!container) return;
        var count = 0;
        if (!snap.exists()) { container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><p>Tidak ada pending</p></div>'; document.getElementById('pendingCount').textContent = '0'; return; }
        var txs = []; snap.forEach(function (c) { txs.push({ id: c.key, ...c.val() }); });
        count = txs.length; document.getElementById('pendingCount').textContent = count;
        var html = '';
        txs.forEach(function (tx) {
            var time = tx.createdAt ? new Date(tx.createdAt).toLocaleString('id-ID') : '-';
            html += '<div class="transaction-item" style="flex-wrap:wrap"><div class="tx-icon pending">⏳</div><div class="tx-info" style="flex:1;min-width:0"><h4>' + tx.role.toUpperCase() + ' - Rp ' + tx.amount.toLocaleString('id-ID') + '</h4><p>' + time + '<br>' + tx.userId + '</p></div><div style="display:flex;gap:5px;margin-top:5px;width:100%"><button class="btn-approve" onclick="approveTopUp(\'' + tx.id + '\',' + tx.amount + ',\'' + tx.userId + '\')">✅ Approve</button><button class="btn-reject" onclick="rejectTopUp(\'' + tx.id + '\')">❌ Reject</button></div></div>';
        });
        container.innerHTML = html;
        document.getElementById('statPending').textContent = count;
    });

    var todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    db.ref('topups').orderByChild('status').equalTo('approved').on('value', function (snap) {
        var container = document.getElementById('adminApprovedList'); if (!container) return;
        if (!snap.exists()) { container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>Belum ada</p></div>'; return; }
        var txs = []; var totalAmount = 0;
        snap.forEach(function (c) { var v = c.val(); if (v.approvedAt && v.approvedAt >= todayStart.getTime()) { txs.push({ id: c.key, ...v }); totalAmount += v.amount || 0; } });
        txs.reverse();
        document.getElementById('statApproved').textContent = txs.length;
        document.getElementById('statTotalAmount').textContent = 'Rp ' + totalAmount.toLocaleString('id-ID');
        document.getElementById('statTotalTx').textContent = txs.length;
        if (txs.length === 0) { container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>Belum ada hari ini</p></div>'; return; }
        var html = '';
        txs.slice(0, 10).forEach(function (tx) {
            var time = tx.approvedAt ? new Date(tx.approvedAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
            html += '<div class="transaction-item"><div class="tx-icon in">✅</div><div class="tx-info"><h4>' + tx.role.toUpperCase() + ' - Rp ' + tx.amount.toLocaleString('id-ID') + '</h4><p>' + time + '<br>' + tx.userId + '</p></div><div class="tx-amount in">+Rp ' + tx.amount.toLocaleString('id-ID') + '</div></div>';
        });
        container.innerHTML = html;
    });

    // Load settings to inputs
    db.ref('settings').once('value').then(function (s) {
        if (s.exists()) {
            var v = s.val();
            var fields = { adminRideBase: v.rideBase || 6000, adminRideKm: v.rideKm || 2000, adminFoodBase: v.foodBase || 8000, adminFoodKm: v.foodKm || 2500, adminSendBase: v.sendBase || 10000, adminSendKm: v.sendKm || 3000, adminCommissionPercent: v.commissionPercent || 10, adminMinDriverBalance: v.minDriverBalance || 10000, adminQrisMerchant: v.qrisMerchant || 'BOLO DEWE CENTER', adminQrisNmid: v.qrisNmid || 'ID1026513619555' };
            for (var k in fields) { var e = document.getElementById(k); if (e) e.value = fields[k]; }
        }
    });
}

function approveTopUp(txId, amount, userId) {
    if (!confirm('Approve top-up Rp ' + amount.toLocaleString('id-ID') + '?')) return;
    db.ref(userId + '/balance').once('value', function (snap) {
        var currentBal = snap.val() || 0; var newBal = currentBal + amount;
        db.ref(userId + '/balance').set(newBal);
        db.ref('topups/' + txId).update({ status: 'approved', approvedAt: firebase.database.ServerValue.TIMESTAMP, approvedBy: 'simpletutorial536@gmail.com', balanceAfter: newBal });
        showToast('success', '✅ Disetujui!', 'Rp ' + amount.toLocaleString('id-ID') + ' masuk ke saldo user');
    });
}

function rejectTopUp(txId) {
    var reason = prompt('Alasan rejection (opsional):');
    db.ref('topups/' + txId).update({ status: 'rejected', approvedAt: firebase.database.ServerValue.TIMESTAMP, approvedBy: 'simpletutorial536@gmail.com', adminNote: reason || 'Ditolak admin' });
    showToast('info', '❌ Ditolak', 'Top-up telah ditolak');
}

function saveAdminSettingsToDB() {
    if (!firebaseReady || !db) { showToast('error', 'Offline', 'Firebase tidak tersedia'); return; }
    showLoading(true);
    var ns = {
        rideBase: parseInt(document.getElementById('adminRideBase').value) || 6000, rideKm: parseInt(document.getElementById('adminRideKm').value) || 2000,
        foodBase: parseInt(document.getElementById('adminFoodBase').value) || 8000, foodKm: parseInt(document.getElementById('adminFoodKm').value) || 2500,
        sendBase: parseInt(document.getElementById('adminSendBase').value) || 10000, sendKm: parseInt(document.getElementById('adminSendKm').value) || 3000,
        commissionPercent: parseInt(document.getElementById('adminCommissionPercent').value) || 10, minDriverBalance: parseInt(document.getElementById('adminMinDriverBalance').value) || 10000,
        qrisMerchant: document.getElementById('adminQrisMerchant').value.trim() || 'BOLO DEWE CENTER', qrisNmid: document.getElementById('adminQrisNmid').value.trim() || 'ID1026513619555'
    };
    db.ref('settings').set(ns).then(function () { showLoading(false); showToast('success', 'Tersimpan', 'Pengaturan berhasil disimpan!'); updUI(); }).catch(function (e) { showLoading(false); showToast('error', 'Gagal', e.message); });
}

// ===== ORDER MANAGEMENT =====
function selectPayment(m, el) { currentPaymentMethod = m; var cards = el.parentElement.querySelectorAll('.payment-method'); for (var i = 0; i < cards.length; i++) cards[i].classList.remove('selected'); el.classList.add('selected'); }

function submitRealtimeOrder(type) {
    showLoading(true);
    var pk = '', ds = '', ph = '', dt = '';
    if (type === 'ride') { pk = document.getElementById('ridePickup').value; ds = document.getElementById('rideDestination').value; ph = document.getElementById('ridePhone').value; }
    else if (type === 'food') { pk = document.getElementById('foodFrom').value; ds = document.getElementById('foodTo').value; ph = document.getElementById('foodPhone').value; dt = document.getElementById('foodDetail').value; }
    else if (type === 'send') { pk = document.getElementById('sendFrom').value; ds = document.getElementById('sendTo').value; ph = document.getElementById('sendPhone').value; dt = document.getElementById('sendItemType').value; }
    if (!pk || !ds || !ph) { showLoading(false); showToast('warning', 'Data Kurang', 'Lengkapi semua data!'); return; }
    
    var dist = currentRouteDistance > 0 ? currentRouteDistance : 2, b, pk2;
    if (type === 'ride') { b = appSettings.rideBase; pk2 = appSettings.rideKm; } else if (type === 'food') { b = appSettings.foodBase; pk2 = appSettings.foodKm; } else { b = appSettings.sendBase; pk2 = appSettings.sendKm; }
    var sub = b + Math.round(dist * pk2), com = Math.round(sub * (appSettings.commissionPercent / 100)), tot = sub + com;
    
    if (firebaseReady && db) {
        var ref = db.ref('orders').push(); lastOrderId = ref.key;
        ref.set({ type: type, pickup: pk, destination: ds, phone: ph, detail: dt || '', distance: dist, subtotal: sub, commission: com, commissionPercent: appSettings.commissionPercent, totalPrice: tot, userId: 'customer/demo', userName: 'Pelanggan Demo', status: 'pending', timestamp: firebase.database.ServerValue.TIMESTAMP, paymentMethod: currentPaymentMethod }).then(function () {
            showLoading(false); closeServicePage(type);
            document.getElementById('successAmount').textContent = 'Order Rp ' + tot.toLocaleString('id-ID');
            document.getElementById('successModal').classList.add('active');
            clearFields();
        }).catch(function (err) { showLoading(false); showToast('error', 'Gagal', err.message); });
    } else { showLoading(false); showToast('error', 'Offline', 'Firebase tidak tersedia'); }
}

function clearFields() { var ids = ['ridePickup', 'rideDestination', 'ridePhone', 'foodFrom', 'foodTo', 'foodPhone', 'foodDetail', 'sendFrom', 'sendTo', 'sendPhone', 'sendItemType']; for (var i = 0; i < ids.length; i++) { var e = document.getElementById(ids[i]); if (e) e.value = ''; } }

function loadOrders() {
    if (!firebaseReady || !db) { renderHist(); return; }
    db.ref('orders').orderByChild('userId').equalTo('customer/demo').once('value', function (snap) {
        userOrders = [];
        if (snap.exists()) { snap.forEach(function (c) { userOrders.push(Object.assign({ id: c.key }, c.val())); }); userOrders.sort(function (a, b) { return (b.timestamp || 0) - (a.timestamp || 0); }); }
        renderHist(); updStats();
    });
}

function renderHist() {
    var c = document.getElementById('orderHistoryList'); if (!c) return;
    var f = userOrders; if (currentOrderFilter !== 'all') f = userOrders.filter(function (o) { return o.status === currentOrderFilter; });
    if (f.length === 0) { c.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><h3>Belum Ada Pesanan</h3><p>Pesanan muncul setelah order.</p></div>'; return; }
    var tl = { ride: '🏍️ Antar Jemput', food: '🍔 Antar Makanan', send: '📦 Antar Barang' }, sl = { pending: 'Menunggu', accepted: 'Diterima', completed: 'Selesai', cancelled: 'Dibatalkan' }, h = '';
    for (var i = 0; i < f.length; i++) {
        var o = f[i], dt = o.timestamp ? new Date(o.timestamp).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Baru saja', ct = o.status === 'pending' || o.status === 'accepted';
        h += '<div class="order-history-card ' + o.status + '"><div class="order-history-header"><span class="order-history-type">' + (tl[o.type] || o.type) + '</span><span class="order-history-date">' + dt + '</span></div><div class="order-history-route">' + o.pickup + ' → ' + o.destination + '</div><div class="order-history-detail">📞 ' + o.phone + (o.detail ? ' • ' + o.detail : '') + '</div><div class="order-history-footer"><div class="order-history-price">Rp ' + (o.totalPrice || 0).toLocaleString('id-ID') + '</div><div class="order-history-status ' + o.status + '">' + (sl[o.status] || o.status) + '</div></div>';
        if (ct) { h += '<div class="order-history-actions"><button class="order-action-btn track" onclick="openTracking(\'' + o.id + "')\">🗺️ Lacak</button>"; if (o.status === 'pending') h += '<button class="order-action-btn cancel" onclick="cancelOrd(\'' + o.id + "')\">Batal</button>"; h += '</div>'; }
        h += '</div>';
    }
    c.innerHTML = h;
}

function filterOrderStatus(s, el) { currentOrderFilter = s; var t = document.querySelectorAll('#pageOrders .promo-tab'); for (var i = 0; i < t.length; i++) t[i].classList.remove('active'); el.classList.add('active'); renderHist(); }
function cancelOrd(id) { if (!confirm('Batalkan pesanan ini?')) return; if (!firebaseReady || !db) return; db.ref('orders/' + id).update({ status: 'cancelled' }).then(function () { showToast('success', 'Dibatalkan', 'Pesanan berhasil dibatalkan'); loadOrders(); }); }
function updStats() { var e1 = document.getElementById('profileTotalOrder'); if (e1) e1.textContent = userOrders.length; var t = 0; for (var i = 0; i < userOrders.length; i++) t += (userOrders[i].totalPrice || 0); var e2 = document.getElementById('profileTotalSpent'); if (e2) e2.textContent = Math.round(t / 1000); }

function openTracking(id) {
    var o = null; for (var i = 0; i < userOrders.length; i++) { if (userOrders[i].id === id) { o = userOrders[i]; break; } }
    if (!o) return;
    var tl = { ride: '🏍️ Antar Jemput', food: '🍔 Antar Makanan', send: '📦 Antar Barang' }, e;
    e = document.getElementById('trackingOrderId'); if (e) e.textContent = 'Order #' + id.substring(0, 6).toUpperCase();
    e = document.getElementById('trackingOrderType'); if (e) e.textContent = (tl[o.type] || '') + ' • Rp ' + (o.totalPrice || 0).toLocaleString('id-ID');
    e = document.getElementById('trackingDriverName'); if (e) e.textContent = o.driverName || 'Driver Pinggir';
    var bg = document.getElementById('trackingStatusBadge');
    if (bg) { if (o.status === 'pending') { bg.innerHTML = '🟡 Menunggu'; bg.style.background = 'rgba(255,193,7,0.3)'; } else if (o.status === 'accepted') { bg.innerHTML = '🟢 Dalam Perjalanan'; bg.style.background = 'rgba(76,175,80,0.3)'; } }
    e = document.getElementById('trackingTimeCreated'); if (e) e.textContent = o.timestamp ? new Date(o.timestamp).toLocaleString('id-ID') : 'Baru saja';
    document.getElementById('pageTracking').classList.add('active');
    setTimeout(initTrackingMap, 300);
}

// ===== RATING SYSTEM (FIXED) =====
function openRating(id) { 
    currentRatingOrderId = id; 
    currentRating = 0; 
    var s = document.querySelectorAll('.rating-star'); 
    for (var i = 0; i < s.length; i++) s[i].classList.remove('active'); 
    var rc = document.getElementById('ratingComment'); 
    if (rc) rc.value = ''; 
    document.getElementById('ratingModal').classList.add('active'); 
}

function setRating(v) { 
    currentRating = v; 
    var s = document.querySelectorAll('.rating-star'); 
    for (var i = 0; i < s.length; i++) { 
        var sv = parseInt(s[i].getAttribute('data-value')); 
        if (sv <= v) s[i].classList.add('active'); 
        else s[i].classList.remove('active'); 
    } 
}

function submitRating() { 
    if (currentRating === 0) { showToast('warning', 'Rating', 'Pilih jumlah bintang dulu!'); return; } 
    if (!currentRatingOrderId || !firebaseReady || !db) return; 
    var rc = document.getElementById('ratingComment'); 
    db.ref('orders/' + currentRatingOrderId).update({ 
        rating: currentRating, 
        ratingComment: rc ? rc.value : '', 
        ratedAt: firebase.database.ServerValue.TIMESTAMP 
    }).then(function () { 
        showToast('success', 'Terima Kasih', 'Rating berhasil dikirim!'); 
        closeRating(); 
        loadOrders(); 
    }); 
}

function closeRating() { document.getElementById('ratingModal').classList.remove('active'); }

// ===== BELANJA SYSTEM =====
function openBelanja() { document.getElementById('belanjaPage').classList.add('active'); renderStores(); }
function closeBelanja() { document.getElementById('belanjaPage').classList.remove('active'); }

function renderStores() {
    var c = document.getElementById('storeList'); if (!c) return;
    var f = allPlaces;
    if (currentDesa !== 'semua') f = f.filter(function (p) { return p.desa === currentDesa; });
    if (currentCategory !== 'semua') f = f.filter(function (p) { return p.type === currentCategory; });
    if (currentSearch) { var s = currentSearch.toLowerCase(); f = f.filter(function (p) { return p.name.toLowerCase().indexOf(s) >= 0 || p.typeLabel.toLowerCase().indexOf(s) >= 0 || p.desaLabel.toLowerCase().indexOf(s) >= 0; }); }
    var sc = document.getElementById('storeCount'); if (sc) sc.textContent = '(' + f.length + ' tempat)';
    var h = '';
    for (var i = 0; i < f.length; i++) {
        var pl = f[i]; 
        h += '<div class="store-card"><div class="store-img ' + pl.type + '">' + pl.img + '</div><div class="store-info"><h4>' + pl.name + '</h4><span class="store-type">' + pl.typeLabel + '</span><div class="store-address">' + pl.address + ', ' + pl.desaLabel + '</div><div class="store-meta"><span class="store-rating">⭐ ' + pl.rating + ' (' + pl.reviews + ')</span><span class="store-distance">📍 ' + pl.distance + '</span><span class="store-status ' + pl.status + '">' + (pl.status === 'open' || pl.status === 'online' ? 'Buka' : 'Tutup') + '</span></div></div><button class="store-order-btn" onclick="orderStore(\'' + pl.name.replace(/'/g, "\\'") + "')\">Pesan</button></div>";
    }
    c.innerHTML = h;
}

function filterDesa(d, el) { currentDesa = d; var c = document.querySelectorAll('.desa-chip'); for (var i = 0; i < c.length; i++) c[i].classList.remove('active'); el.classList.add('active'); renderStores(); }
function filterCategory(c, el) { currentCategory = c; var ch = document.querySelectorAll('.category-chip'); for (var i = 0; i < ch.length; i++) ch[i].classList.remove('active'); el.classList.add('active'); renderStores(); }
function searchStores(v) { currentSearch = v; renderStores(); }
function orderStore(n) { showToast('info', 'Segera Hadir', 'Fitur pemesanan langsung dari toko ' + n + ' akan segera tersedia!'); }

// ===== PROMO SYSTEM =====
function renderPromoList() {
    var c = document.getElementById('promoListContainer'); if (!c) return;
    var f = currentPromoFilter === 'all' ? allPromos : allPromos.filter(function (p) { return p.category === currentPromoFilter; }), h = '';
    for (var i = 0; i < f.length; i++) { var p = f[i]; h += '<div class="promo-list-item"><div class="promo-list-icon ' + p.color + '">' + p.icon + '</div><div class="promo-list-info"><h4>' + p.title + '</h4><p>' + p.desc + '</p><div class="promo-list-meta"><span class="promo-list-timer">⏳ ' + p.timer + '</span><span class="promo-list-code">' + p.code + '</span></div></div></div>'; }
    c.innerHTML = h;
}
function filterPromoCategory(c, el) { currentPromoFilter = c; var t = document.querySelectorAll('#pagePromo .promo-tab'); for (var i = 0; i < t.length; i++) t[i].classList.remove('active'); el.classList.add('active'); renderPromoList(); }

// ===== EXTRA UTILS =====
function closeSuccessAndTrack() { document.getElementById('successModal').classList.remove('active'); if (lastOrderId) { loadOrders(); setTimeout(function () { openTracking(lastOrderId); }, 500); } }