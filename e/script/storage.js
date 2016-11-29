// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '558271828003-i708b43f1q94ls9vi1lris2dg0k7mmdm.apps.googleusercontent.com';
var SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Check if current user has authorized this application.
 */
function checkAuth(fn) {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

/**
* Handle response from authorization server.
*
* @param {Object} authResult Authorization result.
*/
function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('authorize-div');
  if (authResult && !authResult.error) {
    console.log("VPlan has permission to upload")
    $("#driveLogInButton").hide();
    $("#uploadButton").attr("disabled", false);
    $("#uploadButton").addClass("mdl-button--accent");
    loadDriveApi();

  } else {
    $("#driveLogInButton").show();
    $("#uploadButton").attr("disabled", true);
    $("#uploadButton").removeClass("mdl-button--accent");
    console.log("VPlan has no Google Drive permission");
  }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 */
function handleAuthClick() {
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
}

function loadDriveApi() {
  gapi.client.load('drive', 'v2', function () {
    if(currentPage==="home.html"||currentPage==="index.html"){
      showRecentMedia();
    }
  });
}


function uploadKursMediaDrive(fileData) {
  //Show loading animation
  $("#uploadedItemsLoader").show();

  //get acces token
  var auth_token = gapi.auth.getToken().access_token;

  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  //Get Bytes from file using FileReader.readAsBinaryString
  var reader = new FileReader();
  reader.readAsBinaryString(fileData);
  reader.onload = function(e) {
    var contentType = fileData.type || 'application/octet-stream';
    var metadata = {
      'title': fileData.name,
      'mimeType': contentType
    };

 //Set the Request-Header
  var base64Data = btoa(reader.result);
  var multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + contentType + '\r\n' +
      'Content-Transfer-Encoding: base64\r\n' +
      '\r\n' +
      base64Data +
      close_delim;

  //Create a insert request (https://developers.google.com/drive/v2/reference/files/insert)
  var request = gapi.client.request({
      'path': '/upload/drive/v2/files',
      'method': 'POST',
      'params': {'uploadType': 'multipart'},
      'headers': {
        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
      },
      'body': multipartRequestBody});

    request.execute(function(driveFile) {
       console.log("Wrote to file " + driveFile.name + " id: " + driveFile.id);
       $("#uploadedItemsLoader").hide();

       var ref="Kurse/" + $("#card-kurs").text() + "/storagePath";
       firebase.database().ref(ref).push({
         downloadUrl:driveFile.downloadUrl.replace("?e=download&gd=true", ""),
         id:driveFile.id,
         title:driveFile.title
       });
       setTimeMillForKursOnline($("#card-kurs").text());
       setNewestMedia(driveFile.id);
    });

  // });
}}

function getKursMedia() {
  var storage = firebase.storage();
  var ref = "Kurse/" + $("#card-kurs").text() + "/storagePath";
  // var output = "";
  var i = 0;

  firebase.database().ref(ref).on('value', function (snapshot) {
    output="";
    snapshot.forEach(function (childSnapshot) {
      var request = gapi.client.drive.files.get({
        'fileId': childSnapshot.val().id
      });

      request.execute(function (resp) {
        var downloadUrl = resp.downloadUrl;
        var fileName = resp.title;
        var thumbnail = resp.thumbnailLink;
        output += "<div class='mdl-card mdl-cell mdl-cell--4-col-desktop mdl-cell--3-col-tablet mdl-cell--2-col-phone mdl-shadow--4dp'><div class='mdl-card__title mdl-card--expand'></div><div class='mdl-card__supporting-text'><img class='android-mediaCard'src='"+thumbnail+"'/></div><div class='mdl-card__actions'><span class='demo-card-image__filename'>"+fileName+"</span></div><div class='mdl-card__menu'><button class='mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect'><a href='"+downloadUrl+"' download><i class='material-icons'>file_download</i></a></button></div></div>";
        showMedia(output);
      });



    });
  });
  //pathRef.getDownloadURL().then(function (url) {
    // $("#teso").html(output);
  //})
}
function showMedia(media){
  $("#mediaDiv").html(media);
}

function setNewestMedia(driveId){
  var ref="Kurse/" + $("#card-kurs").text() + "/newestMedia";
  var date = new Date();
  var time = date.getTime();
  firebase.database().ref(ref).set({
    id:driveId,
    date:time
  });
}

function getRecentMedia(callback) {
  var currentNewestMediaTime = [];
  var currentNewestMediaId = [];
  for(kurs in kurse){
    var kursNewestMediaDate = kurse[kurs].val().newestMedia.date;
    var kursNewestMediaId = kurse[kurs].val().newestMedia.id;
    if(currentNewestMediaTime.length<=3){
      var key = currentNewestMediaTime.indexOf(Math.min.apply(Math, currentNewestMediaTime));
      currentNewestMediaTime[currentNewestMediaTime.length] = kursNewestMediaDate;
      currentNewestMediaId[currentNewestMediaId.length] = kursNewestMediaId;
    }else{
      if(Math.min.apply(Math, currentNewestMediaTime)<kursNewestMediaDate){
        var key = currentNewestMediaTime.indexOf(Math.min.apply(Math, currentNewestMediaTime));
        currentNewestMediaTime[key] = kursNewestMediaDate;
        currentNewestMediaId[key] = kursNewestMediaId;
      }
    }
  }
  callback(currentNewestMediaId);
  // return currentNewestMediaId;
}

function showRecentMedia(){
  getRecentMedia(function (newestMediaId) {
    var recentMedia = newestMediaId;
    var output = "";
    for(id in recentMedia){
      var fileId = recentMedia[id];
      var request = gapi.client.drive.files.get({
        'fileId': fileId
      });

      var respCounter = 0;
      request.execute(function(resp) {
        var downloadUrl = resp.downloadUrl;
        var thumbnail = resp.thumbnailLink;
        var name = resp.title;
        downloadUrl = downloadUrl.replace("?e=download&gd=true", "");

        if(respCounter%2===0){
          output+="<tr><td class='dashThumbnailFiles'><img src='"+thumbnail+"'>"+name+"</td>";
        }else{
          output+="<td class='dashThumbnailFiles'><img src='"+thumbnail+"'>"+name+"</td></tr>";
        }
        respCounter = respCounter +1;
        // output += "<img src='"+downloadUrl+"'>"
        $("#dashFiles").html(output);
      });
    }
    $("#dashFiles").html(output);
  });
  // var recentMedia = getRecentMedia();
  // var output = "";
  // for(id in recentMedia){
  //   var fileId = recentMedia[id];
  //   var request = gapi.client.drive.files.get({
  //     'fileId': fileId
  //   });
  //
  //   var respCounter = 0;
  //   request.execute(function(resp) {
  //     var downloadUrl = resp.downloadUrl;
  //     downloadUrl = downloadUrl.replace("?e=download&gd=true", "");
  //
  //     if(respCounter%2===0){
  //       output+="<tr><td><img src='"+downloadUrl+"'></td>";
  //     }else{
  //       output+="<td><img src='"+downloadUrl+"'></td></tr>";
  //     }
  //     respCounter = respCounter +1;
  //     // output += "<img src='"+downloadUrl+"'>"
  //     $("#dashFiles").html(output);
  //   });
  // }
  // $("#dashFiles").html(output);
}
