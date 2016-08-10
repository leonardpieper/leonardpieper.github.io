$(document).ready(function() {
  // History Api
  var content = $('main');
  var nav = $('nav');

  nav.find('a').on('click', function (evt) {
    var href = $(this).attr('href');

    evt.preventDefault();

    // Manipulate History
    history.pushState(null, null, href);

    //Fetch and insert
    changePage(href);
    if(href=="kurse.html"){
      firebaseLogin('e','f');
    }

  });
  // End History Api
});


function changePage (href){
  $('main').load(href);
  if(firebase.database() === null){
    var config = {
    apiKey: "AIzaSyAQHIWuE8zO49oazSKEmoOzZiq1nZO2ES8",
    authDomain: "test-e84e5.firebaseapp.com",
    databaseURL: "https://test-e84e5.firebaseio.com",
    storageBucket: "test-e84e5.appspot.com",
  };
  firebase.initializeApp(config);
  }
  // var content = $('main');
  // $.ajax({
  //   url:'http://localhost/e/' + href.split('/').pop(),
  //   method: 'GET',
  //   success: function (data) {
  //     content.html(data);
  //   }});
}

function addHistoryAPIToNewAnchors(changeClass){
  $("."+changeClass).on('click', function (evt) {
    var href = $(this).attr('href');

    evt.preventDefault();

    // Manipulate History
    history.pushState(null, null, href);

    //Fetch and insert
    changePage(href);

  })
}

function firebaseLogin(uname, pwd){
  firebase.auth().signInWithEmailAndPassword("lkp0105@gmail.com", "123456").catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode === 'auth/wrong-password') {
      alert('Wrong password.');
    } else {
      console.error(error);
    }
    // [END_EXCLUDE]
  });

  var auth = firebase.auth();

  auth.onAuthStateChanged(function(user) {
      firebase.database().ref('Users/9puU6n4R1AhfFOKZRopHwc0wCpk1/Kurse').on('value', function (snapshot) {
        var data = snapshot.val();
        var output = "";
        snapshot.forEach(function (childSnapshot) {
          var kurs = childSnapshot.val();
          var name = kurs.name;
          output+= "<li class='mdl-list__item'><span class='mdl-list__item-primary-content'><a href=\"javascript:setKurs(\'"+name+"\')\">"+name+"</a></span></li>";
        });
        // for(var i=0; i<data.length; i++){
        //   var kurs = data[i];
        //   name = kurs.name;
        //   output+= "<li class='mdl-list__item'><span class='mdl-list__item-primary-content'>"+name+"</span></li>"
        // }

        $('#kurs-liste').html(output);
      })
  });
}

function addKurs(){
  var name = $("#kursTextfield").val();
  var secret = $("#secretTextfield").val();

  firebase.database().ref('Users/9puU6n4R1AhfFOKZRopHwc0wCpk1/Kurse/' + name).set({
    name:name,
    secret: secret
  });
  closeDialogBox("android-kurs-dialog");
}

function dialogBox(id) {
  $("#"+id).css({'display':'block'});
}
function closeDialogBox(id) {
  $("#"+id).css({'display':'none'});
}
function setKurs(name) {
  $('main').load("kurs.html", function () {
    $("#card-kurs").html(name);
    addListener();
    getKursMedia();
  });
}
function getKursMedia() {
  var storage = firebase.storage();
  var ref = "Kurse/" + $("#card-kurs").text() + "/storagePath";
  var output = "";
  var i = 0;

  firebase.database().ref(ref).on('value', function (snapshot) {
    output="";
    snapshot.forEach(function (childSnapshot) {
      var gsPath = childSnapshot.val().p;
      var fileName = gsPath.split('/').pop();
      var pathRef = storage.refFromURL(gsPath);
      pathRef.getDownloadURL().then(function (url) {
        // output += "<img src='"+url+"'/>";
        if(i===0){
          output+="<div class=mdl-grid>"
          output+="<div class='mdl-card mdl-cell mdl-cell--4-col-desktop mdl-cell--3-col-tablet mdl-cell--2-col-phone mdl-shadow--4dp'><div class='mdl-card__title mdl-card--expand'></div><div class='mdl-card__supporting-text'><img class='android-mediaCard'src='"+url+"'/></div><div class='mdl-card__actions'><span class='demo-card-image__filename'>"+fileName+"</span></div><div class='mdl-card__menu'><button class='mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect'><a href='"+url+"' download><i class='material-icons'>file_download</i></a></button></div></div>";
        }else if(i===2){
          output+="<div class='mdl-card mdl-cell mdl-cell--4-col-desktop mdl-cell--3-col-tablet mdl-cell--2-col-phone mdl-shadow--4dp'><div class='mdl-card__title mdl-card--expand'></div><div class='mdl-card__supporting-text'><img class='android-mediaCard'src='"+url+"'/></div><div class='mdl-card__actions'><span class='demo-card-image__filename'>"+fileName+"</span></div><div class='mdl-card__menu'><button class='mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect'><a href='"+url+"' download><i class='material-icons'>file_download</i></a></button></div></div>";
          output+="</div>"
          i=0;
        }else{
          output+="<div class='mdl-card mdl-cell mdl-cell--4-col-desktop mdl-cell--3-col-tablet mdl-cell--2-col-phone mdl-shadow--4dp'><div class='mdl-card__title mdl-card--expand'></div><div class='mdl-card__supporting-text'><img class='android-mediaCard'src='"+url+"'/></div><div class='mdl-card__actions'><span class='demo-card-image__filename'>"+fileName+"</span></div><div class='mdl-card__menu'><button class='mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect'><a href='"+url+"' download><i class='material-icons'>file_download</i></a></button></div></div>";
        }
        i = i+1;
        // output+="<div class='mdl-card mdl-cell mdl-cell--3-col-desktop mdl-cell--2-col-tablet mdl-cell--1-col-phone mdl-shadow--4dp'><div class='mdl-card__title mdl-card--expand'></div><div class='mdl-card__supporting-text'><img class='android-mediaCard'src='"+url+"'/></div><div class='mdl-card__actions'><span class='demo-card-image__filename'>"+fileName+"</span></div></div>"
        showMedia(output);
      })

    })
  })
  //pathRef.getDownloadURL().then(function (url) {
    // $("#teso").html(output);
  //})
}
function showMedia(media){
  $("#mediaDiv").html(media);
}

function setKursMedia(file) {
  var storage = firebase.storage();
  var storageRef = storage.ref();

  var kurs = $("#card-kurs").html();
  var kurseRef = storageRef.child('kurse');
  var kursRef = kurseRef.child(kurs);

  var uploadTask = kursRef.child(file.name).put(file);
  uploadTask.on('state_changed',
  function progress (snapshot) {
    var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    document.getElementById("kursUploader").value=percentage;
  }, function error (err) {

  }, function complete() {
    var downLoadUrl = uploadTask.snapshot.downLoadUrl;
    var gs = kursRef.toString() + "/"+ file.name;
    var ref = "Kurse/" + $("#card-kurs").text() + "/storagePath";
    firebase.database().ref(ref).push({
      p:gs
    });
  });
}

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
      // output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
      //             f.size, ' bytes, last modified: ',
      //             f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
      //             '</li>');
      setKursMedia(f);
    }
  }
  function handleFileDrop(evt) {
      evt.stopPropagation();
      evt.preventDefault();

      var files = evt.dataTransfer.files; // FileList object.

      // files is a FileList of File objects. List some properties.
      var output = [];
      for (var i = 0, f; f = files[i]; i++) {
        setKursMedia(f);
      }
      // document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
    }

    function handleDragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }



function addListener() {
document.getElementById('files').addEventListener('change', handleFileSelect, false);
// Setup the dnd listeners
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileDrop, false);
}

/**Auto Function**/
window.onclick = function(event) {
    if (event.target == document.getElementById('android-kurs-dialog')){
        $('#android-kurs-dialog').css({'display':'none'});
    }
}

//User uses Back/Forward Button
$(window).on('popstate', function() {
  changePage(location.pathname)
});
