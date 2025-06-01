// Camera Selection Logic
let selectedCamera = 'user'; // Default front camera
document.getElementById('cameraSelect').addEventListener('change', function() {
  selectedCamera = this.value;
  startCamera();
});

let video = document.getElementById('video');
let stream;

function startCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  navigator.mediaDevices.getUserMedia({ video: { facingMode: selectedCamera } })
    .then(s => {
      stream = s;
      video.srcObject = stream;
    })
    .catch(error => console.error("Camera error:", error));
}

startCamera(); // Start on load

// Photo Capture Logic
let photoData = '';
document.getElementById('capture').addEventListener('click', function() {
  let canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  photoData = canvas.toDataURL('image/png');
  document.getElementById('preview').src = photoData;
});

// Location Capture Logic
let locationData = '';
document.getElementById('getLocation').addEventListener('click', function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      locationData = `${position.coords.latitude}, ${position.coords.longitude}`;
      document.getElementById('location').value = locationData;
    });
  } else {
    alert("Geolocation not supported!");
  }
});

// Survey Data Save Logic
let surveyData = [];
document.getElementById('saveSurvey').addEventListener('click', function() {
  let shopOwner = document.getElementById('shopOwner').value;
  let remarks = document.getElementById('remarks').value;

  if (!shopOwner || !remarks || !photoData || !locationData) {
    alert("Please fill all fields and capture photo & location!");
    return;
  }

  surveyData.push({
    shopOwner: shopOwner,
    remarks: remarks,
    photo: photoData,
    location: locationData,
    date: new Date().toLocaleString()
  });

  alert("Data Saved!");
  clearForm();
});

// Excel Export Logic with Photo Link
document.getElementById('exportExcel').addEventListener('click', function() {
  const wb = XLSX.utils.book_new();
  const wsData = [['Shop Owner', 'Remarks', 'Location', 'Photo Link', 'Date']];
  
  surveyData.forEach(entry => {
    const link = entry.photo ? `=HYPERLINK("${entry.photo}", "Download Photo")` : '';
    wsData.push([entry.shopOwner, entry.remarks, entry.location, link, entry.date]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Survey Data');

  XLSX.writeFile(wb, 'Survey_Report.xlsx');
});

// Clear Form
function clearForm() {
  document.getElementById('shopOwner').value = '';
  document.getElementById('remarks').value = '';
  document.getElementById('location').value = '';
  document.getElementById('preview').src = '';
  photoData = '';
  locationData = '';
}
