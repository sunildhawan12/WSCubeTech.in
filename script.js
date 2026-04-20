// ✅ Location कोआर्डिनेट्स (WSCube Tech Jaipur)
const allowedLat = 26.86287451427167;     
const allowedLng = 75.79533158109675;
const radius = 0.5; 

const studentMap = {
  "100" : "Sunil jat",
  "890":"Harshit",
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
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
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
    showHistory(); // IN होने पर भी हिस्ट्री दिखाएं
    return;
  }

  statusMsg.innerHTML = "📡 लोकेशन जाँची जा रही है...";

  navigator.geolocation.getCurrentPosition(pos => {
    const dist = getDistance(pos.coords.latitude, pos.coords.longitude, allowedLat, allowedLng);

    if (dist <= radius) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();

      localStorage.setItem("attendanceStatus", "IN");
      localStorage.setItem("lastActionDate", today);
      localStorage.setItem("firstInTime", timeStr);

      statusMsg.innerHTML = `✅ Hello <b style="color:#ff009d">${name}</b>, आप WSCube Tech Institute क्षेत्र में हैं!<br>🟢 IN दर्ज: ⏰${timeStr}`;
      markAttendanceSilent("IN");
      setTimeout(showHistory, 2000);
    } else {
      statusMsg.innerHTML = `❌ आप बाहर हैं (दूरी: ${(dist * 1000).toFixed(0)} मीटर)।`;
    }
  }, err => {
    statusMsg.innerHTML = `❌ GPS Error: ${err.message}.`;
  }, { enableHighAccuracy: true, timeout: 10000 });
}

// --- 🟢 HISTORY LOGIC FIXED ---

function showHistory() {
  const id = localStorage.getItem("regId");
  if (!id) return;

  const hb = document.getElementById("historyTableBody");
  const modal = document.getElementById("historyModal");
  
  if (modal) modal.style.display = "flex";
  if (hb) hb.innerHTML = "<tr><td colspan='4' style='text-align:center;'>लोड हो रहा है...</td></tr>";

  // Google Sheet से हिस्ट्री फेच करना
  fetch(`${historyUrl}?type=history&id=${id}`)
    .then(res => res.json())
    .then(data => {
      renderHistoryTable(data);
    })
    .catch(err => {
      console.error("History Error:", err);
      if (hb) hb.innerHTML = "<tr><td colspan='4'>❌ हिस्ट्री लोड करने में विफल!</td></tr>";
    });
}

function renderHistoryTable(data) {
  const hb = document.getElementById("historyTableBody");
  if (!hb) return;
  hb.innerHTML = "";

  if (!data || data.length === 0) {
    hb.innerHTML = "<tr><td colspan='4'>कोई डेटा नहीं मिला।</td></tr>";
    return;
  }

  // डेटा को उल्टा (Reverse) करना ताकि ताज़ा रिकॉर्ड ऊपर आए
  const sortedData = [...data].reverse();

  sortedData.forEach(e => {
    const icon = e.status === "IN" ? "🟢" : "🔴";
    hb.innerHTML += `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px;">${e.date}</td>
        <td style="padding: 8px;">${e.time}</td>
        <td style="padding: 8px;">${icon} ${e.status}</td>
        <td style="padding: 8px;">${e.name}</td>
      </tr>`;
  });
}

function markAttendanceSilent(status) {
  const id = localStorage.getItem("regId");
  const formData = new URLSearchParams({ ID: id, Status: status, Location: "auto" });
  fetch(URL, { method: "POST", body: formData })
    .then(() => console.log("Data Sync Done"))
    .catch(err => console.error("Sync Error:", err));
}

function manualOut() {
  const id = localStorage.getItem("regId");
  if (!id) return;
  
  localStorage.setItem("attendanceStatus", "OUT");
  markAttendanceSilent("OUT");
  statusMsg.innerHTML = `🔴 आप "OUT" हो चुके हैं।`;
  setTimeout(showHistory, 1500);
}
