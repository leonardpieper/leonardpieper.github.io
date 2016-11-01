var uploadedFiles;


$(document).ready(function() {
  // History Api
  var content = $('main');
  var nav = $('nav');

  nav.find('a').on('click', function (evt) {
    var href = $(this).attr('href');
    evt.preventDefault();
    // Manipulate History
    var adressBarHref = href.split('/').pop();
    history.pushState(null, null, adressBarHref);
    //Fetch and insert
    changePage(href);
  });
  // End History Api
  isUserLoggedIn();
});

function toggleDrawer() {
  var layout = document.querySelector('.mdl-layout');
  layout.MaterialLayout.toggleDrawer();
}

function changePage (href){
  $("#waterfallHeader").addClass("is-casting-shadow");
  // if(firebase.app().name !== '[DEFAULT]'){
  //   firebase.initializeApp({
  //     apiKey: "AIzaSyAQHIWuE8zO49oazSKEmoOzZiq1nZO2ES8",
  //     authDomain: "test-e84e5.firebaseapp.com",
  //     databaseURL: "https://test-e84e5.firebaseio.com",
  //     storageBucket: "test-e84e5.appspot.com",
  //   });
  // }
  $('main').load(href, function() {
    if(href=="content/kurse.html"){
      getKurse("kurs-liste");
      getBadge();
    }else if (href=="content/home.html") {
      getKurse("dashKurse");
      getBadge();
      getVPlanForToday();
      getVPlanForTomorrow();
    }else if (href=="content/profile.html") {
      getUserProfilePage();
      isUserLoggedIn();
    }else if (href=="content/vplan.html") {
      getVPlanForYear("EF");
      setFirstOpen();
    }
  });
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
  firebase.auth().onAuthStateChanged(function (user) {
    if(user !== null){
      history.pushState(null, null, "profile.html");
      changePage('content/profile.html');
    }

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
  if(email===""||pwd===""||$("#vPlanUname").val()===""||$("#vPlanPwd").val()===""){
    $(".android-login-err").html("Du musst alle Felder angeben");
  }else{
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
}

  firebase.auth().onAuthStateChanged(function (user) {
    if(user !== null) {
      var pwd = $("#firebasePwdTeacher").val();
      var lehrerAbk = $("#firebaseAbkTeacher").val();
      firebase.database().ref("Users/" + user.uid).update({
        lehrerPwd:pwd,
        abk:lehrerAbk
      });
      var vPlanUname = $("#vPlanUname").val();
      var vPlanPwd =  $("#vPlanPwd").val();
      firebase.database().ref("Users/" + user.uid + "/vPlan").update({
        uname:vPlanUname,
        pwd:vPlanPwd
      });
      history.pushState(null, null, "profile.html");
      changePage('content/profile.html');
    }
  });
}

function signOut() {
  firebase.auth().signOut().then(function() {
    console.log('Signed Out');
  }, function(error) {
    console.error('Sign Out Error', error);
  });
}

function isUserLoggedIn() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user === null){
      history.pushState(null, null, "login.html");
      changePage("content/login.html");
      return true;
    }else{
      return false;
    }
  });
}

function changevPlanData() {
  var uname = $("#vPlanChangeU").val();
  var pwd = $("#vPlanChangeP").val();
  firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/vPlan").update({
    uname:uname,
    pwd:pwd
  });
  $("#changeDone").show();
}

// function signInWithGoogle() {
//   var provider = new firebase.auth.GoogleAuthProvider();
//   firebase.auth().signInWithPopup(provider).then(function(result) {
//     // This gives you a Google Access Token. You can use it to access the Google API.
//     var token = result.credential.accessToken;
//     // The signed-in user info.
//     var user = result.user;
//     // ...
//   }).catch(function(error) {
//     // Handle Errors here.
//     var errorCode = error.code;
//     var errorMessage = error.message;
//     // The email of the user's account used.
//     var email = error.email;
//     // The firebase.auth.AuthCredential type that was used.
//     var credential = error.credential;
//     switch (errorCode) {
//       case "auth/email-already-in-use":
//         $(".android-login-err").html("E-Mail Adresse wird bereits verwendet");
//         break;
//       case "auth/invalid-email":
//         $(".android-login-err").html("Ungültige E-Mail Adresse");
//         break;
//       case "auth/operation-not-allowed":
//         $(".android-login-err").html("Dieser Account wurde gesperrt");
//         break;
//       case "auth/weak-password":
//         $(".android-login-err").html("Zu schwaches Passwort. Bitte mit einem neuen versuchen (mind. 6 Zeichen!)");
//         break;
//       default:
//         $(".android-login-err").html("Fehler bei der Anmeldung");
//     }
//   });
//
//   firebase.auth().onAuthStateChanged(function (user) {
//     if(user.uid !== null) {
//       var pwd = $("#firebasePwdTeacher").val();
//       var lehrerAbk = $("#firebaseAbkTeacher").val();
//       firebase.database().ref("Users/" + user.uid).update({
//         lehrerPwd:pwd,
//         abk:lehrerAbk
//       });
//     }
//   });
// }

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

function getKurse(id) {
  var auth = firebase.auth();
  if(auth.currentUser !== null){
    var uid = auth.currentUser.uid;

    firebase.database().ref("Data/lehrerRead").once('value').then(function (snapshot) {
      $(".operatorArea").show();
    });

      // Maybe Fix this --> Data consuming
      firebase.database().ref('Users/'+uid+'/Kurse').on('value', function (snapshot) {
        var data = snapshot.val();
        var output = "";
        snapshot.forEach(function (childSnapshot) {
          var kurs = childSnapshot.val();
          var name = kurs.name;
          var kursID = name.replace(/ /g, "__");
          output+= "<li class='mdl-list__item android-kursList'><span class='mdl-list__item-primary-content'><a id='"+kursID+"Id' href=\"javascript:setKurs(\'"+name+"\')\">"+name+"</a></span><i class='material-icons android-kursList-close' onclick=\"delDialogBox(\'android-delkurs-dialog\',\'"+name+"\')\">close</i></li>";
        });
        $('#' + id).html(output);
      });
  }
}

function addKurs(){
  var name = $("#kursTextfield").val();
  var secret = $("#secretTextfield").val();
  var auth = firebase.auth();
  var uid = auth.currentUser.uid;

  firebase.database().ref("Data/lehrerRead").once('value').then(function (snapshot) {
    //  Benutzer ist Lehrer
    firebase.database().ref('/Kurse/' + name  + "/secret").once('value').then(function(snapshot) {
      alert("Kurs Existiert bereits!");
    }, function (err) {
      if(err != "Error: permission_denied at /Kurse/D EFa/secret: Client doesn't have permission to access the desired data."){
        var username = snapshot.val().username;
        firebase.database().ref("Kurse/" + name + "/secret").set(secret);
      }else{
        alert("Kurs Existiert bereits!");
      }
    });
  }, function (err) {
  });

  firebase.database().ref('Users/'+uid+'/Kurse/' + name).set({
    name:name,
    secret: secret
  });

  closeDialogBox("android-kurs-dialog");
}

function delKurs(){
  var name = $("#delFach").html();
  var uid = firebase.auth().currentUser.uid;
  firebase.database().ref('Users/'+uid+'/Kurse/' + name).remove();
  closeDialogBox("android-delkurs-dialog");
}

function dialogBox(id) {
  $("#"+id).css({'display':'block'});
}
function delDialogBox(id, name) {
  $("#"+id).css({'display':'block'});
  $("#delFach").html(name);
}
function closeDialogBox(id) {
  $("#"+id).css({'display':'none'});
}
function setKurs(name) {
  $('main').load("content/kurs.html", function () {
    $("#card-kurs").html(name);
    firebase.database().ref("Data/lehrerRead").once('value').then(function (snapshot) {
       $(".operatorArea").show();
    }, function (err) {
      $(".operatorArea").hide();
    });
    addListener();
    checkAuth();
    getKursMessage();
    getKursMedia();
    setTimeMillForKursLocal(name)
    var i = document.getElementsByClassName("mdl-layout__drawer-button")[0].dataset.badge;
    if(i!=1){
      document.getElementsByClassName("mdl-layout__drawer-button")[0].dataset.badge = i-1;
      document.getElementById("mobileNavKurse").dataset.badge = i-1;
    }else{
      $(".mdl-layout__drawer-button").removeClass("mdl-badge");
      $("#mobileNavKurse").removeClass("mdl-badge");
    }

  });
}
function getBadge() {
  var ref="Users/" + firebase.auth().currentUser.uid + "/Kurse";
  // var count;
  firebase.database().ref(ref).on('value', function (snapshot) {
    var i=0;
    snapshot.forEach(function (childSnapshot) {
      var kurs = childSnapshot.val().name;
      var kursRef = "Kurse/" + kurs + "/timeStamp";
      firebase.database().ref(kursRef).on('value', function (snapshot) {
        if(snapshot.val()>=getTimeMillForKursLocal(kurs)){
          kursID= kurs.replace(/ /g, "__");
          document.getElementById(kursID + "Id").dataset.badge = "✶";
          $("#" + kursID + "Id").addClass("mdl-badge");
          i = i+1;
          if(i!== 0){
            document.getElementsByClassName("mdl-layout__drawer-button")[0].dataset.badge = i;
            $(".mdl-layout__drawer-button").addClass("mdl-badge");
            document.getElementById("mobileNavKurse").dataset.badge = i;
            $("#mobileNavKurse").addClass("mdl-badge");
          }

        }
      });
    });
    // $(".mdl-layout__drawer-button").addClass("mdl-badge--overlap");
  });
}
function setTimeMillForKursLocal(kurs) {
  var d = new Date();
  var currTimeMill = d.getTime();
  localStorage.setItem(kurs + "Mill", currTimeMill);
}
function getTimeMillForKursLocal(kurs) {
  var time = localStorage.getItem(kurs + "Mill");
  return time;
}
function setTimeMillForKursOnline(kurs) {
  var d = new Date();
  var currTimeMill = d.getTime();
  var ref = "Kurse/" + kurs + "/timeStamp";
  firebase.database().ref(ref).set(currTimeMill);
}
function getKursMedia() {
  var storage = firebase.storage();
  var ref = "Kurse/" + $("#card-kurs").text() + "/storagePath";
  // var output = "";
  var i = 0;

  firebase.database().ref(ref).on('value', function (snapshot) {
    output="";
    snapshot.forEach(function (childSnapshot) {
      // var gsPath = childSnapshot.val().p;
      // var fileName = gsPath.split('/').pop();
      // var pathRef = storage.refFromURL(gsPath);
      // pathRef.getDownloadURL().then(function (url) {
      //   // output += "<img src='"+url+"'/>";
      //   output+="<div class='mdl-card mdl-cell mdl-cell--4-col-desktop mdl-cell--3-col-tablet mdl-cell--2-col-phone mdl-shadow--4dp'><div class='mdl-card__title mdl-card--expand'></div><div class='mdl-card__supporting-text'><img class='android-mediaCard'src='"+url+"'/></div><div class='mdl-card__actions'><span class='demo-card-image__filename'>"+fileName+"</span></div><div class='mdl-card__menu'><button class='mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect'><a href='"+url+"' download><i class='material-icons'>file_download</i></a></button></div></div>";
      //   showMedia(output);
      // });

      var downloadUrl = childSnapshot.val().downloadUrl;
      var fileName = childSnapshot.val().title;
      output += "<div class='mdl-card mdl-cell mdl-cell--4-col-desktop mdl-cell--3-col-tablet mdl-cell--2-col-phone mdl-shadow--4dp'><div class='mdl-card__title mdl-card--expand'></div><div class='mdl-card__supporting-text'><img class='android-mediaCard'src='"+downloadUrl+"'/></div><div class='mdl-card__actions'><span class='demo-card-image__filename'>"+fileName+"</span></div><div class='mdl-card__menu'><button class='mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect'><a href='"+downloadUrl+"' download><i class='material-icons'>file_download</i></a></button></div></div>";
      showMedia(output);

    });
  });
  //pathRef.getDownloadURL().then(function (url) {
    // $("#teso").html(output);
  //})
}
function showMedia(media){
  $("#mediaDiv").html(media);
}

// function setKursMedia(file) {
//   var storage = firebase.storage();
//   var storageRef = storage.ref();
//
//   var kurs = $("#card-kurs").html();
//   var kurseRef = storageRef.child('kurse');
//   var kursRef = kurseRef.child(kurs);
//
//   var uploadTask = kursRef.child(file.name).put(file);
//   uploadTask.on('state_changed',
//   function progress (snapshot) {
//     var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//     document.getElementById("kursUploader").value=percentage;
//   }, function error (err) {
//     switch (err.code) {
//       case 'storage/unauthorized':
//           $(".maxDatei").css({'color': 'red', 'font-size':'1.5rem'});
//         break;
//       default:
//         alert("Upload abgebrochen/abgelehnt");
//     }
//   }, function complete() {
//     $(".maxDatei").css({'color': 'rgba(0,0,0,.54)', 'font-size':'1rem'});
//     var downLoadUrl = uploadTask.snapshot.downLoadUrl;
//     var gs = kursRef.toString() + "/"+ file.name;
//     var ref = "Kurse/" + $("#card-kurs").text() + "/storagePath";
//     firebase.database().ref(ref).push({
//       p:gs
//     });
//     setTimeMillForKursOnline(kurs);
//     setTimeMillForKursLocal(kurs);
//   });
// }

function handleFileSelect(evt) {
    //var files = evt.target.files; // FileList object
    uploadedFiles = evt.target.files;

    var uploadListElement = "<div class='uploadedItemsListElement'><i class='material-icons'>&#xE24D;</i>"
    var uploadListElements = "";
    for(i=0;i<uploadedFiles.length;i++){
      uploadListElements += uploadListElement+uploadedFiles[i].name+"</div>"
    }
    $("#uploadedItemsList").html(uploadListElements)

  }
  function handleFileDrop(evt) {
      evt.stopPropagation();
      evt.preventDefault();

      $(".android-kurs-dropZone").css({"border-color": "rgba(0,0,0,0.8)","border-width":"4px","background-color": "rgba(0,0,0,0)"});

      var files = evt.dataTransfer.files; // FileList object.
      uploadedFiles = files;

      var uploadListElement = "<div class='uploadedItemsListElement'><i class='material-icons'>&#xE24D;</i>"
      var uploadListElements = "";
      for(i=0;i<uploadedFiles.length;i++){
        uploadListElements += uploadListElement+uploadedFiles[i].name+"</div>"
      }
      $("#uploadedItemsList").html(uploadListElements)
    }

    function handleDragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.

      if(evt.target === document.getElementById('drop_zone')){
        $(".android-kurs-dropZone").css({"border-color": "#81C784","border-width":"4px","background-color": "rgba(129,199,132,0.2)"});
      }else{
        $(".android-kurs-dropZone").css({"border-color": "rgba(0,0,0,0.8)","border-width":"4px","background-color": "rgba(0,0,0,0)"});
      }

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
        setTimeMillForKursOnline($("#card-kurs").text());
        setTimeMillForKursLocal($("#card-kurs").text());
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
      }, function (err) {
        $("#messages").html("Dieser Kurs existiert nicht, oder das Passwort ist falsch!");
      });
    }

function getUserProfilePage() {
  var user = firebase.auth().currentUser;
  if(user != null){
    var email = user.email;
    var welcome = "Hallo, " + email
    // ???
    $("#profileHead").html(welcome);1
  }
}


function addListener() {
  document.getElementById('files').addEventListener('change', handleFileSelect, false);
  // Setup the dnd listeners
  var dropZone = document.getElementById('drop_zone');
  window.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleFileDrop, false);

  $('#uploadButton').click(function () {
    files = uploadedFiles;
    for (var i = 0, f; f = files[i]; i++) {
      uploadKursMediaDrive(f);
    }
  });

  $('#driveLogInButton').click(function () {
    handleAuthClick();
  });
}

/**Auto Function**/
window.onclick = function(event) {
    if (event.target == document.getElementById('android-kurs-dialog')){
        $('#android-kurs-dialog').css({'display':'none'});
    }else if (event.target == document.getElementById('android-delkurs-dialog')) {
      $('#android-delkurs-dialog').css({'display':'none'});
    }
}

//User uses Back/Forward Button
$(window).on('popstate', function() {
  changePage("content/" + location.pathname.split('/').pop());
  //  firebase.app().delete();
});
