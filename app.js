
let surveyors = {
    "surveyor1": "password1",
    "admin": "admin"
};
let surveyData = [];
$(document).ready(function() {
    const video = $('#video')[0];
    const canvas = $('#canvas')[0];
    const context = canvas.getContext('2d');
    const startCamera = $('#start-camera');
    const takePhoto = $('#take-photo');
    startCamera.on('click', function() {
        navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
            video.srcObject = stream;
            startCamera.hide();
            takePhoto.show();
        });
    });
    takePhoto.on('click', function() {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        $('#video-container').hide();
        $('#canvas-container').show();
        takePhoto.hide();
    });
    $('#get-location').click(function() {
        navigator.geolocation.getCurrentPosition(function(pos) {
            $('#location').text(`Lat: ${pos.coords.latitude}, Lon: ${pos.coords.longitude}`);
        });
    });
    $('#login-form').submit(function(e) {
        e.preventDefault();
        let username = $('#username').val();
        let password = $('#password').val();
        if (surveyors[username] === password) {
            $('#loginModal').modal('hide');
            if (username === 'admin') $('#adminModal').modal('show');
            else $('#surveyModal').modal('show');
        } else alert("Invalid credentials");
    });
    $('#survey-form').submit(function(e) {
        e.preventDefault();
        let dataUrl = canvas.toDataURL();
        let imageName = `survey_${Date.now()}.png`;
        let imageBlob = dataURItoBlob(dataUrl);
        let imageUrl = URL.createObjectURL(imageBlob); // TEMP URL (needs real upload for persistent link)
        let entry = {
            shopOwner: $('#shop-owner-name').val(),
            mobile: $('#owner-mobile-number').val(),
            type: $('#shop-type').val(),
            location: $('#location').text(),
            photoUrl: imageUrl
        };
        surveyData.push(entry);
        $('#survey-table-body').append(`
            <tr>
                <td>${entry.shopOwner}</td>
                <td>${entry.mobile}</td>
                <td>${entry.type}</td>
                <td><a href="${entry.photoUrl}" target="_blank">View Photo</a></td>
                <td>${entry.location}</td>
            </tr>
        `);
    });
    $('#create-credentials-form').submit(function(e) {
        e.preventDefault();
        let u = $('#new-username').val(), p = $('#new-password').val();
        surveyors[u] = p;
        refreshUsers();
    });
    function refreshUsers() {
        $('#existing-credentials').empty();
        for (let u in surveyors) {
            if (u !== 'admin') {
                $('#existing-credentials').append(`<li>${u} <button class="delete-user btn btn-sm btn-danger" data-user="${u}">Delete</button></li>`);
            }
        }
    }
    $(document).on('click', '.delete-user', function() {
        let user = $(this).data('user');
        delete surveyors[user];
        refreshUsers();
    });
    $('#export-to-excel').click(function() {
        let wb = new ExcelJS.Workbook();
        let ws = wb.addWorksheet('Survey Data');
        ws.addRow(['Shop Owner', 'Mobile', 'Shop Type', 'Photo Link', 'Location']);
        surveyData.forEach(entry => {
            let row = ws.addRow([entry.shopOwner, entry.mobile, entry.type, '', entry.location]);
            let link = { text: 'View Photo', hyperlink: entry.photoUrl };
            row.getCell(4).value = link;
        });
        wb.xlsx.writeBuffer().then(buf => {
            let blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            let a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'survey_data.xlsx';
            a.click();
        });
    });
    refreshUsers();
});
function dataURItoBlob(dataURI) {
    let byteString = atob(dataURI.split(',')[1]);
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: 'image/png' });
}