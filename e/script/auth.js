function checkGAuth() {
    if (gapi.auth.getToken() !== null) {
        return true;
    } else {
        return false;
    }
}

function doGAuth(place) {
    gapi.auth.authorize({
        client_id: CLIENT_ID,
        scope: SCOPES,
        immediate: false
    }, function() {
        switch (place) {
            case "login":
                history.pushState(null, null, "index.html");
                changePage('content/index.html');
                break;
            default:
                console.log("G-LoggedIn");
        }
    });
}

function noGAuth() {
    history.pushState(null, null, "index.html");
    changePage('content/index.html');
    localStorage.setItem("noGAuth", true);
}

var auth = {
    setreCAPTCHA: function () {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('login_btn_proove', {
            'size': 'invisible',
            'callback': function(response) {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
                auth.signInWithPhone();
            }
        });
        recaptchaVerifier.render().then(function(widgetId) {
            window.recaptchaWidgetId = widgetId;
        });
    },

    signInWithPhone: function () {
        var phoneNumber = "+49" + $("#login_input_phone").val();
        var appVerifier = window.recaptchaVerifier;

        firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
        .then(function (confirmationResult) {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            window.confirmationResult = confirmationResult;
        }).catch(function (error) {
            // Error; SMS not sent
            // ...
        });
    },

    signInWithEmail: function(){
        var email = $("#login_input_email").val();
        var password = $("#login_input_password").val();

        firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
            var errorCode = error.code;
            if(errorCode==="auth/user-not-found"){
                firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (createError) {
                    if(createError==="auth/operation-not-allowed"){
                        $("#login_div_err").html("Anmeldung per E-Mail-Adresse sind derzeit nicht erlaubt");
                    }else if(createError==="auth/weak-password"){
                        $("#login_div_err").html("Zu schwaches Passwort (mind. 6 Zeichen)");
                    }
                });
            }else if(errorCode==="auth/invalid-email"){
                $("#login_div_err").html("Bitte gültige E-Mail-Adresse eingeben");
            }else if(errorCode==="auth/user-disabled"){
                $("#login_div_err").html("Dieser Nutzer wurde gelöscht");
            }else if(errorCode==="auth/wrong-password"){
                $("#login_div_err").html("Falsches Passwort");
            }else{
                $("#login_div_err").html("Bei der Anmeldung ist ein Fehler unterlaufen.<br>Bitte versuchen Sie es später erneut.");
            }
        });
    }
}

function phoneBtnClicked() {
    $("#login_btn_phone").hide();
    $("#login_div_datenschutz").hide();
    $("#login_btn_email").hide();

    $("#login_input_phoneCountryCode").show();
    $("#login_input_phone").show();
    $("#login_btn_proove").show();

    auth.setreCAPTCHA();
}

function emailBtnClicked() {
    $("#login_btn_phone").hide();
    $("#login_div_datenschutz").hide();
    $("#login_btn_email").hide();

    $("#login_input_email").show();
    $("#login_input_password").show();
    $("#login_btn_ready").show();

    $("#login_div_err").html("");
}

function showDataprotection() {
    alert("Ceciplan benötigt Ihre Anmeldedaten in Form von Telefonnummer oder E-Mail-Adresse um Missbrauch des Service zu vermindern."
    + "Da es möglich ist nutzergenerierte Inhalte innerhalb der App zu erstellen, wird zum Schutz aller Benutzer eine Kontaktmöglichkeit vorausgesetzt. "
    + "Die App soll keine Möglichkeit für anonymes Mobbing geben. Ferner soll sichergestellt werden, dass gesetzeswidrige Medien oder Schriften nicht über diese Plattform verbreitet werden."
    + "Sollten Sie Datenschutzbedenken haben lesen Sie sich bitte die Datenschutzbestimmungen unter http://leonardpieper.github.io/ceciplan/content/datenschutz.html durch");
}