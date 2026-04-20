// ✅ Smart Attendance System - Fixed Version
const allowedLat = 26.89165975608599;
const allowedLng = 75.79147231591557;
const radius = 0.5; // 500 meters (आधे किलोमीटर का दायरा - इसे आप 0.1 या 0.2 भी कर सकते हैं)

const studentMap = {
  "100" : "Sunil jat",
  "109": "Manish",
  "110": "Manu",
  "469": "Mahendra Gahlot",
  "420": "Rahul Rawat",
};

const URL = "https://script.google.com/macros/s/AKfycbzhR-60-AUw2gL6_8ro7Dm3arl0exFNJ0a3n0MYPE-r-s4YwLrJDkJsT31mYk9LqqG92g/exec";
const historyUrl = "https://script.google.com/macros/s/AKfycbwYMb6IVNNSVO6E70ujDfO3x1x7G2sZX44X37MpTFiuBGysDNScXmsbZxuZUv-qJfXA/exec";
const statusMsg = document.getElementById("statusMsg");

function saveAndProceed() {
  const id = document.getElementById("regInput").value.trim();
  if (!id || !studentMap[id]) return alert("❌ Invalid ID!");
  localStorage.setItem("regId", id);
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("attendanceSection").style.display = "block";
  checkLocation(id);
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in KM
}

function checkLocation(id) {
  const name = studentMap[id];
  const today = new Date().toLocaleDateString("en-GB");
  const status = localStorage.getItem("attendanceStatus");
  const lastDate = localStorage.getItem("lastActionDate");

  if (lastDate === today && status === "OUT") {
    statusMsg.innerHTML = `❌ <b style="color:#ff009d">${name}</b>, आप आज का Attendance पूरा कर चुके हैं!`;
    showHistory();
    return;
  }

  if (lastDate === today && status === "IN") {
    const time = localStorage.getItem("firstInTime");
    statusMsg.innerHTML = `✅ Hello <b style="color:#ff009d">${name}</b>, आप पहले ही "🟢IN" हो चुके हैं<br>⏰ समय: ${time}`;
    return;
  }

  statusMsg.innerHTML = "📡 आपकी लोकेशन जाँची जा रही है, कृपया रुकें...";

  if (!navigator.geolocation) {
    statusMsg.innerHTML = "❌ आपका ब्राउज़र Location सपोर्ट नहीं करता।";
    return;
  }

  // 📍 GPS Accuracy Options
  const geoOptions = {
    enableHighAccuracy: true, 
    timeout: 10000, 
    maximumAge: 0
  };

  navigator.geolocation.getCurrentPosition(pos => {
    const currentLat = pos.coords.latitude;
    const currentLng = pos.coords.longitude;
    const dist = getDistance(currentLat, currentLng, allowedLat, allowedLng);

    // Debugging के लिए console में दूरी देख सकते हैं
    console.log(`Distance: ${dist} km`);

    if (dist <= radius) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();

      localStorage.setItem("attendanceStatus", "IN");
      localStorage.setItem("lastActionDate", today);
      localStorage.setItem("firstInTime", timeStr);

      statusMsg.innerHTML = `✅ Hello <b style="color:#ff009d">${name}</b>, आप School क्षेत्र में हैं!<br>🟢 IN दर्ज: ⏰${timeStr}`;
      markAttendanceSilent("IN");
      setTimeout(showHistory, 2000);
    } else {
      statusMsg.innerHTML = `❌ आप बाहर हैं (दूरी: ${(dist * 1000).toFixed(0)} मीटर)।<br>स्कूल पहुँचकर फिर से कोशिश करें।`;
    }

  }, err => {
    statusMsg.innerHTML = `❌ GPS Error: ${err.message}. कृपया Location ON करें।`;
  }, geoOptions);
}

// बाकी Functions (markAttendanceSilent, manualOut, showHistory, renderHistoryTable) वैसे ही रहेंगे।
