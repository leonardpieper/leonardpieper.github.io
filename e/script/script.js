var uploadedFiles;
var currentPage = "";
var jahrgang;

var mAuth = firebase.auth();

$(document).ready(function () {
    // History Api
    var content = $('main');
    var footer = $('footer');
    var nav = $('nav');

    nav.find('a').on('click', function (evt) {
        var href = $(this).attr('href');
        evt.preventDefault();
        // Manipulate History
        var adressBarHref = href.split('/').pop();
        history.pushState(null, null, adressBarHref);
        currentPage = adressBarHref;
        //Fetch and insert
        changePage(href);
    });

    footer.find('a').on('click', function (evt) {
        var href = $(this).attr('href');
        evt.preventDefault();

        //Resets Color of Bottombar Navigation
        footer.find('a').css('color', '#607D8B');
        footer.find('a').find('i').css('color', '#607D8B');
        footer.find('a').find('img').attr('src', 'resources/icons/vertretungsplan-logo-alpha-bluegray.svg');
        //Sets Color of Bottombar Navigation
        evt.currentTarget.style.color = "#FF9800";
        $(evt.currentTarget).find('i').css('color', '#FF9800');
        $(evt.currentTarget).find('img').attr('src', 'resources/icons/vertretungsplan-logo-alpha-orange.svg')

        // Manipulate History
        var adressBarHref = href.split('/').pop();
        history.pushState(null, null, adressBarHref);
        currentPage = adressBarHref;
        //Fetch and insert
        changePage(href);
    });
    // End History Api
    isUserLoggedIn();
    if (LocalUser.getTeacherStatus() == "true") {
        $(".operatorArea").show();
    }

    //Apple Add to Homescreen annotation
    if(window.navigator.standalone == true){
        $("#main_div_addToHomescreenAnnotation").hide();
    }
    else if (getAppleHomescrennAnnotation() == null) {
        $("#main_div_addToHomescreenAnnotation").show();
    }



    //Service Worker
    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker.register('/sw.js').then(function(registration) {
    //     // Registration was successful
    //     console.log('ServiceWorker registration successful with scope: ', registration.scope);
    //   }).catch(function(err) {
    //     // registration failed :(
    //     console.log('ServiceWorker registration failed: ', err);
    //   });
    // }

});

function toggleDrawer() {
    var layout = document.querySelector('.mdl-layout');
    layout.MaterialLayout.toggleDrawer();
}

function changePage(href) {
    $("#waterfallHeader").addClass("is-casting-shadow");
    $('main').load(href, function () {
        if (href == "content/index.html") {
            getKurse("dashKurse");
            getBadge();
            getVPlanForYear(jahrgang, "home");
        } else if (href == "content/profile.html") {
            getUserProfilePage();
            isUserLoggedIn();
        }
        // else if (href == "content/vplan.html") {
        //     setFirstOpen();
        //     getVPlanForYear(jahrgang, "vplan");

        // }
        if (LocalUser.getTeacherStatus() == "true") {
            $(".operatorArea").show();
        }
    });
}

function changePageWithElement(href, element) {
    if (element !== null) {
        var href;

        if ($(element).attr('onclick') !== null) {
            href = $(element).attr('onclick');
            href = href.split('\'')[1];
        } else if ($(element).attr('href') !== null) {
            href = $(element).attr('href');
        }

        var adressBarHref = href.split('/').pop();
        history.pushState(null, null, adressBarHref);
        currentPage = adressBarHref;
    }
    $("#waterfallHeader").addClass("is-casting-shadow");
    $('main').load(href, function () {
        if (href == "content/kurse.html") {
            getKurse("kurs-liste");
            getBadge();
        } else if (href == "content/index.html") {
            getKurse("dashKurse");
            getBadge();
            getVPlanForYear("EF", "home");
            // getVPlanForToday();
            // getVPlanForTomorrow();
        } else if (href == "content/profile.html") {
            getUserProfilePage();
            isUserLoggedIn();
        } else if (href == "content/vplan.html") {
            getVPlanForYear("EF", "vplan");
            setFirstOpen();
        }
        if (LocalUser.getTeacherStatus() == "true") {
            $(".operatorArea").show();
        }
    });
}

function addHistoryAPIToNewAnchors(changeClass) {
    $("." + changeClass).on('click', function (evt) {
        var href = $(this).attr('href');

        evt.preventDefault();

        // Manipulate History
        history.pushState(null, null, href);

        //Fetch and insert
        changePage(href);

    })
}

function setAppleHomescrennAnnotation(showAnnotation) {
    localStorage.setItem("showAnnotation", showAnnotation);
    $("#main_div_addToHomescreenAnnotation").hide();
}

function getAppleHomescrennAnnotation() {
    return localStorage.getItem("showAnnotation");
}

function firebaseLogin() {
    var email = $("#firebaseEmail").val();
    var pwd = $("#firebasePwd").val();

    firebase.auth().signInWithEmailAndPassword(email, pwd).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        switch (errorCode) {
            case "auth/user-not-found":
                $(".android-login-err").html("Der Benutzer wurde nicht gefunden");
                break;
            case "auth/invalid-email":
                $(".android-login-err").html("Ungültige E-Mail Adresse");
                break;
            case "auth/wrong-password":
                $(".android-login-err").html("Passwort ungültig");
                break;
            default:
                $(".android-login-err").html("Fehler bei der Anmeldung");
        }
        // [END_EXCLUDE]
    });
    firebase.auth().onAuthStateChanged(function (user) {
        if (user !== null) {
            if (checkGAuth()) {
                history.pushState(null, null, "profile.html");
                changePage('content/profile.html');
            } else {
                changePage('content/g-auth.html');
            }

        }

    });


}

var email;
var pwd;

function firebaseSignUp1() {
    email = $("#firebaseEmail").val();
    pwd = $("#firebasePwd").val();
    if (email === "" || pwd === "") {
        $(".android-login-err").html("Du musst alle Felder angeben");
    } else {
        firebase.auth().createUserWithEmailAndPassword(email, pwd).catch(function (error) {
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
            if (user !== null) {
                changePage('content/vp-auth.html');
            }
        });
    }
}

function firebaseSignUp2() {
    var user = firebase.auth().currentUser;
    var pwd = $("#firebasePwdTeacher").val();
    var lehrerAbk = $("#firebaseAbkTeacher").val();
    var jahrgang = $("#vPlanYear option:selected").text();
    var vPlanUname = $("#vPlanUname").val();
    var vPlanPwd = $("#vPlanPwd").val();
    var lehrer = $("#teacherChckBx").is(":checked");
    if (vPlanUname !== "" || vPlanPwd !== "" || (jahrgang !== "Jahrgangsstufe") || lehrer === true) {
        firebase.database().ref("Users/" + user.uid).update({
            lehrerPwd: pwd,
            abk: lehrerAbk
        });
        firebase.database().ref("Users/" + user.uid + "/vPlan").update({
            uname: vPlanUname,
            pwd: vPlanPwd
        });
        if (lehrer === true) {
            jahrgang = 0
        }
        firebase.database().ref("Users/" + user.uid).update({
            year: jahrgang
        });
        setJahrgangOffline(jahrgang);
        LocalUser.setTeacherStatus(true);
        history.pushState(null, null, "profile.html");
        changePage('content/g-auth.html');
    } else {
        $("#firebaseSignUp2Err").html("Sie müssen Benutzername, Passwort und Jahrgang angeben.")
    }
}

function signOut() {
    firebase.auth().signOut().then(function () {
        console.log('Signed Out');
        kursCache.newCache();
    }, function (error) {
        console.error('Sign Out Error', error);
    });
}

function isUserLoggedIn() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user === null) {
            $('main').load('content/login.html');
            return true;
        } else {
            return false;
        }
    });
}

function changevPlanData() {
    var uname = $("#vPlanChangeU").val();
    var pwd = $("#vPlanChangeP").val();
    firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/vPlan").update({
        uname: uname,
        pwd: pwd
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

    $("#card-login-basic").html("Registrieren");
}

function showSignUpTeacher() {
    if (document.getElementById('teacherChckBx').checked) {
        $(".android-sign_up_teacher").show();
    } else {
        $(".android-sign_up_teacher").hide();
    }
}

// function getKurse(id) {
//   var auth = firebase.auth();
//   if(auth.currentUser !== null){
//     var uid = auth.currentUser.uid;
//
//     firebase.database().ref("Data/lehrerRead").once('value').then(function (snapshot) {
//       $(".operatorArea").show();
//     });
//
//       // Maybe Fix this --> Data consuming
//       firebase.database().ref('Users/'+uid+'/Kurse').on('value', function (snapshot) {
//         var data = snapshot.val();
//         var output = "";
//         snapshot.forEach(function (childSnapshot) {
//           var kurs = childSnapshot.val();
//           var name = kurs.name;
//           var kursID = name.replace(/ /g, "__");
//           output+= "<li class='mdl-list__item android-kursList'><span class='mdl-list__item-primary-content'><a id='"+kursID+"Id' href=\"javascript:setKurs(\'"+name+"\')\">"+name+"</a></span><i class='material-icons android-kursList-close' onclick=\"delDialogBox(\'android-delkurs-dialog\',\'"+name+"\')\">close</i></li>";
//         });
//         $('#' + id).html(output);
//       });
//   }
// }

function addKurs() {
    var name = $("#kursTextfield").val();
    var secret = $("#secretTextfield").val();
    var auth = firebase.auth();
    var uid = auth.currentUser.uid;

    firebase.database().ref("Data/lehrerRead").once('value').then(function (snapshot) {
        //  Benutzer ist Lehrer
        firebase.database().ref('/Kurse/' + name + "/secret").once('value').then(function (snapshot) {
            alert("Kurs existiert bereits!");
        }, function (err) {
            if (err != "Error: permission_denied at /Kurse/D EFa/secret: Client doesn't have permission to access the desired data.") {
                var username = snapshot.val().username;
                firebase.database().ref("Kurse/" + name + "/secret").set(secret);
                setKurs(name);
            } else {
                alert("Kurs Existiert bereits!");
            }
        });
    }, function (err) { });

    firebase.database().ref('Users/' + uid + '/Kurse/' + name).set({
        name: name,
        secret: secret,
        type: "online"
    });

    cacheKurse.addcache(name, 0, "online");

    closeDialogBox("android-kurs-dialog");
}



function dialogBox(id) {
    if (mAuth.currentUser.isAnonymous) {
        if(confirm("Um Kurse hinzuzufügen ist eine Anmeldung mittels E-Mail-Adresse oder Telefonnummer erforderlich.")==true){
            changePage("content/signup.html")
        }
    } else {

        $("#" + id).css({
            'display': 'block'
        });
    }
}

function delDialogBox(id, name) {
    $("#" + id).css({
        'display': 'block'
    });
    $("#delFach").html(name);
}

function closeDialogBox(id) {
    $("#" + id).css({
        'display': 'none'
    });
}

function setKurs(name) {
    $('main').load("content/kurs.html", function () {
        $("#card-kurs").html(name);
        // firebase.database().ref("Data/lehrerRead").once('value').then(function(snapshot) {
        //     $(".operatorArea").show();
        // }, function(err) {
        //     $(".operatorArea").hide();
        // });
        addListener();
        checkAuth();
        getKursMessage();
        getKursMedia();
        setTimeMillForKursLocal(name)
        var i = document.getElementsByClassName("mdl-layout__drawer-button")[0].dataset.badge;
        if (i != 1) {
            document.getElementsByClassName("mdl-layout__drawer-button")[0].dataset.badge = i - 1;
            document.getElementById("mobileNavKurse").dataset.badge = i - 1;
        } else {
            $(".mdl-layout__drawer-button").removeClass("mdl-badge");
            $("#mobileNavKurse").removeClass("mdl-badge");
        }

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
    var currTimeMillNeg = currTimeMill;
    var ref = "Kurse/" + kurs + "/timestamp";
    firebase.database().ref(ref).set(currTimeMillNeg);
}

function setJahrgangOffline(year) {
    localStorage.setItem("Jahrgang", year);
    Jahrgang = year;
}

function getJahrgang() {
    var year = localStorage.getItem("Jahrgang");
    if (year === null || year === "null") {
        firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/year").once('value').then(function (snapshot) {
            year = snapshot.val();
            setJahrgangOffline(year);
            return year;
        });
    } else {
        return year;
    }
}

function setLehrerAbkOffline(abk) {
    localStorage.setItem("lehrer-abk", abk);
}

function getLehrerAbk() {
    if (getJahrgang() == 0) {
        var abk = localStorage.getItem("lehrer-abk");
        if (abk === null || abk === "null") {
            firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/abk").once('value').then(function (snapshot) {
                abk = snapshot.val();
                setLehrerAbkOffline(abk);
                return abk;
            });
        } else {
            return abk;
        }
    } else {
        return -1;
    }
}

function handleFileSelect(evt) {
    //var files = evt.target.files; // FileList object
    uploadedFiles = evt.target.files;

    var uploadListElement = "<div class='uploadedItemsListElement'><i class='material-icons'>&#xE24D;</i>"
    var uploadListElements = "";
    for (i = 0; i < uploadedFiles.length; i++) {
        uploadListElements += uploadListElement + uploadedFiles[i].name + "</div>"
    }
    $("#uploadedItemsList").html(uploadListElements)

}

function handleFileDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    $(".android-kurs-dropZone").css({
        "border-color": "rgba(0,0,0,0.8)",
        "border-width": "4px",
        "background-color": "rgba(0,0,0,0)"
    });

    var files = evt.dataTransfer.files; // FileList object.
    uploadedFiles = files;

    var uploadListElement = "<div class='uploadedItemsListElement'><i class='material-icons'>&#xE24D;</i>"
    var uploadListElements = "";
    for (i = 0; i < uploadedFiles.length; i++) {
        uploadListElements += uploadListElement + uploadedFiles[i].name + "</div>"
    }
    $("#uploadedItemsList").html(uploadListElements)
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.

    if (evt.target === document.getElementById('drop_zone')) {
        $(".android-kurs-dropZone").css({
            "border-color": "#81C784",
            "border-width": "4px",
            "background-color": "rgba(129,199,132,0.2)"
        });
    } else {
        $(".android-kurs-dropZone").css({
            "border-color": "rgba(0,0,0,0.8)",
            "border-width": "4px",
            "background-color": "rgba(0,0,0,0)"
        });
    }

}

function sendKursMessage() {
    var nachricht = $("#nachricht").val();
    var sender = firebase.auth().currentUser.email;
    var uid = firebase.auth().currentUser.uid;

    // var abkRef = "Users/" + firebase.auth().currentUser.uid + "/abk";
    // firebase.database().ref(abkRef).on('value', function(snapshot) {
    //     sender = snapshot.val();

    var ref = "Kurse/" + $("#card-kurs").text() + "/messages";
    firebase.database().ref(ref).push({
        sender: sender,
        body: nachricht,
        uid: uid
    });
    setTimeMillForKursOnline($("#card-kurs").text());
    setTimeMillForKursLocal($("#card-kurs").text());
    $("#nachricht").val("");
    // });
}

function getKursMessage() {
    var ref = "Kurse/" + $("#card-kurs").text() + "/messages";
    firebase.database().ref(ref).on('value', function (snapshot) {
        var output = "";
        snapshot.forEach(function (childSnapshot) {
            output += childSnapshot.val().sender;
            output += ": "
            output += childSnapshot.val().body;
            output += "<br />"
        });
        $("#kursMessages").html(output);
        $("#kursMessages").scrollTop($("#kursMessages")[0].scrollHeight);
    }, function (err) {
        $("#kursMessages").html("Dieser Kurs existiert nicht, oder das Passwort ist falsch!");
    });

}

function getUserProfilePage() {
    var user = firebase.auth().currentUser;
    if (user != null) {
        var email = user.email;
        name = email.split("@").shift();
        var welcome = "Hallo, " + name
        // ???
        $("#profileHead").html(welcome);
        if(mAuth.currentUser.phoneNumber!=null){
            $("#settingsEmail").html(mAuth.currentUser.phoneNumber);
        }else{
            $("#settingsEmail").html(firebase.auth().currentUser.email);
        }
        
        var year = getJahrgang();
        var abk = getLehrerAbk();
        if (year == 0) {
            $("#settingsYear").html("Lehrer");
        } else {
            $("#settingsYear").html(year);
            $("#settingsKrzlDesc").hide();
            $("#settingsKrzl").hide();
        }
        $("#settingsKrzl").html(abk);
    }
}

function loadSetting(name) {
    $(".firstShownCard").removeClass("firstShownCard");
    $("#settingsCard").show();
    switch (name) {
        case "info":
            $("#settingsTitle").html("Info");
            $("#settingsContent").load("content/settings/info.html", function () {

                if(mAuth.currentUser.phoneNumber!=null){
                    $("#settingsEmail").html(mAuth.currentUser.phoneNumber);
                }else{
                    $("#settingsEmail").html(firebase.auth().currentUser.email);
                }
                if (firebase.auth().currentUser.isAnonymous) {
                    $("#settingsEmail").html("Keine E-Mail-Adresse angegeben");
                }

                var jahrgang = getJahrgang();
                var abk = getLehrerAbk();
                if (jahrgang == "lehrer") {
                    $("#settingsYear").html("Lehrer");
                } else {
                    $("#settingsYear").html(jahrgang);
                    $("#settingsKrzlDesc").hide();
                    $("#settingsKrzl").hide();
                }
                $("#settingsKrzl").html(abk);
            });

            break;
        case "vplan":
            $("#settingsTitle").html("Vertretungsplan");
            $("#settingsContent").load("content/settings/vplan.html");
            break;
        case "gDrive":
            $("#settingsTitle").html("<img src='resources/product32.png'>Google Drive");
            $("#settingsContent").load("content/settings/g-auth.html");
            break;
        default:

    }
}

function closeCard(element) {
    $(element).parent().parent().hide();
}

var LocalUser = {
    setJahrgangText: function (jahrgang) {
        localStorage.setItem("LU_jahrgang", jahrgang);
    },
    getJahrgangText: function () {
        return localStorage.getItem("LU_jahrgang");
    },
    setJahrgang: function (jahrgang) {
        localStorage.setItem("LU_jahrgangNumber", jahrgang);
    },
    getJahrgang: function () {
        return localStorage.getItem("LU_jahrgangNumber");
    },
    setTeacherStatus: function (isTrue) {
        localStorage.setItem("LU_isTeacher", isTrue);
    },
    getTeacherStatus: function () {
        return localStorage.getItem("LU_isTeacher");
    },
    setTeacherName: function (teacherName) {
        localStorage.setItem("LU_lehrer-abk", teacherName);
    },
    getTeacherName: function () {
        return localStorage.getItem("LU_lehrer-abk");
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
window.onclick = function (event) {
    if (event.target == document.getElementById('android-kurs-dialog')) {
        $('#android-kurs-dialog').css({
            'display': 'none'
        });
    } else if (event.target == document.getElementById('android-delkurs-dialog')) {
        $('#android-delkurs-dialog').css({
            'display': 'none'
        });
    }
}

//User uses Back/Forward Button
$(window).on('popstate', function () {
    changePage("content/" + location.pathname.split('/').pop());
    //  firebase.app().delete();
});
