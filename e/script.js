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
      getKurse();
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

function firebaseLogin(){
  var email = $("#firebaseEmail").val();
  var pwd = $("#firebasePwd").val();

  firebase.auth().signInWithEmailAndPassword(email, pwd).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // [START_EXCLUDE]
    if (errorCode === 'auth/wrong-password') {
    } else {
      console.error(error);
    }
    // [END_EXCLUDE]
  });


}

function firebaseSignUp() {
  var email = $("#firebaseEmail").val();
  var pwd;
  if ($("#firebasePwd").val() === $("#firebasePwdRepeat").val()){
    pwd = $("#firebasePwd").val();
  }else {
    $(".android-login-err").html("Passwörter müssen identisch sein!");
  }
  firebase.auth().createUserWithEmailAndPassword(email, pwd).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  switch (errorCode) {
    case "auth/email-already-in-use":
      $(".android-login-err").html("E-Mail Adresse wird bereits verwendet");
      break;
    case "auth/invalid-email":
      $(".android-login-err").html("Ungültige E-Mail Adresse");
      break;
    case "auth/operation-not-allowed":
      $(".android-login-err").html("Dieser Account wurde gesperrt");
      break;
    case "auth/weak-password":
      $(".android-login-err").html("Zu schwaches Passwort. Bitte mit einem neuen versuchen (mind. 6 Zeichen!)");
      break;
    default:
      $(".android-login-err").html("Fehler bei der Anmeldung");
  }
  var errorMessage = error.message;
  // ...
});

  firebase.auth().onAuthStateChanged(function (user) {
    if(user.uid !== null) {
      var pwd = $("#firebasePwdTeacher").val();
      var lehrerAbk = $("#firebaseAbkTeacher").val();
      firebase.database().ref("Users/" + user.uid).set({
        lehrerPwd:pwd,
        abk:lehrerAbk
      });
    }
  })
}

function signInWithGoogle() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
}

function showSignUp() {
  $(".android-sign_up").show();
  $(".android-logIn").hide();
}
function showSignUpTeacher() {
  if(document.getElementById('teacherChckBx').checked){
    $(".android-sign_up_teacher").show();
  }else {
    $(".android-sign_up_teacher").hide();
  }
}

function getKurse() {
  var auth = firebase.auth();
  var uid = auth.currentUser.uid;

  firebase.database().ref("Data/lehrerRead").once('value').then(function (snapshot) {
    $(".operatorArea").show();
  });

    firebase.database().ref('Users/'+uid+'/Kurse').on('value', function (snapshot) {
      var data = snapshot.val();
      var output = "";
      snapshot.forEach(function (childSnapshot) {
        var kurs = childSnapshot.val();
        var name = kurs.name;
        output+= "<li class='mdl-list__item'><span class='mdl-list__item-primary-content'><a href=\"javascript:setKurs(\'"+name+"\')\">"+name+"</a></span></li>";
      });
      $('#kurs-liste').html(output);
    });
}

function addKurs(){
  var name = $("#kursTextfield").val();
  var secret = $("#secretTextfield").val();
  var auth = firebase.auth();
  var uid = auth.currentUser.uid;

  firebase.database().ref('Users/'+uid+'/Kurse/' + name).set({
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
    firebase.database().ref("Data/lehrerRead").once('value').then(function (snapshot) {
       $(".operatorArea").show();
    }, function (err) {
      $(".operatorArea").hide();
    });
    addListener();
    getKursMessage();
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

    function sendKursMessage() {
      var nachricht = $("#nachricht").val();
      var sender;

      var abkRef = "Users/" + firebase.auth().currentUser.uid + "/abk";
      firebase.database().ref(abkRef).on('value', function (snapshot) {
        sender = snapshot.val();

        var ref = "Kurse/" + $("#card-kurs").text() + "/messages";
        firebase.database().ref(ref).push({
          sender:sender,
          message:nachricht
        });
        $("#nachricht").val("");
      });
    }

    function getKursMessage() {
      var ref = "Kurse/" + $("#card-kurs").text() + "/messages";
      firebase.database().ref(ref).on('value', function(snapshot) {
        var output = "";
        snapshot.forEach(function (childSnapshot) {
          output+=childSnapshot.val().sender;
          output+=": "
          output+=childSnapshot.val().message;
          output+="<br />"
        });
        $("#messages").html(output);
      });
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
