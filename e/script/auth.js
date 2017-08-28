var auth = {
    setreCAPTCHA: function () {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('login_btn_proove', {
            'size': 'invisible',
            'callback': function (response) {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
                auth.signInWithPhone();
            }
        });
        recaptchaVerifier.render().then(function (widgetId) {
            window.recaptchaWidgetId = widgetId;
        });
    },

    signInWithPhone: function () {
        var phoneNumber = "+49" + $("#login_input_phone").val();
        var appVerifier = window.recaptchaVerifier;

        $("#login_input_code").show();
        $("#login_btn_codeReady").show();

        $("#login_input_phoneCountryCode").hide();
        $("#login_input_phone").hide();
        $("#login_btn_proove").hide();

        firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
            .then(function (confirmationResult) {
                // SMS sent. Prompt user to type the code from the message, then sign the
                // user in with confirmationResult.confirm(code).
                window.confirmationResult = confirmationResult;
                this.completeTel();
            }).catch(function (error) {
                // Error; SMS not sent
                // ...
            });
    },

    signInWithEmail: function () {
        var email = $("#login_input_email").val();
        var password = $("#login_input_password").val();

        firebase.auth().signInWithEmailAndPassword(email, password).then(function (user) {
            changePage("content/home.html");
        }).catch(function (error) {
            var errorCode = error.code;
            if (errorCode === "auth/user-not-found") {
                firebase.auth().createUserWithEmailAndPassword(email, password).then(function (user) {
                    changePage("content/home.html");
                }).catch(function (createError) {
                    if (createError === "auth/operation-not-allowed") {
                        $("#login_div_err").html("Anmeldung per E-Mail-Adresse sind derzeit nicht erlaubt");
                    } else if (createError === "auth/weak-password") {
                        $("#login_div_err").html("Zu schwaches Passwort (mind. 6 Zeichen)");
                    }
                });
            } else if (errorCode === "auth/invalid-email") {
                $("#login_div_err").html("Bitte gültige E-Mail-Adresse eingeben");
            } else if (errorCode === "auth/user-disabled") {
                $("#login_div_err").html("Dieser Nutzer wurde gelöscht");
            } else if (errorCode === "auth/wrong-password") {
                $("#login_div_err").html("Falsches Passwort");
            } else {
                $("#login_div_err").html("Bei der Anmeldung ist ein Fehler unterlaufen.<br>Bitte versuchen Sie es später erneut.");
            }
        });
    },

    setJahrgang: function (jahrgang) {
        localStorage.setItem("jahrgang", jahrgang);
    },

    getJahrgang: function () {
        return localStorage.getItem("jahrgang");
    },

    completeTel: function () {
        var code = $("#login_input_code").val();
        confirmationResult.confirm(code).then(function (result) {
            changePage("content/home.html")
        })
        .catch(function (error) {
            $("#login_div_err").html("Du konntest nicht angemeldet werden.");
        })
    }
}

function vplanBtnClicked() {
    mAuth.signInAnonymously().then(function (user) {
        var uname = $("#login_input_vplan-uname").val();
        var pwd = $("#login_input_vplan-pwd").val();
        var jahrgang = $("#login_input_jahrgang").val();
        firebase.database().ref("Users/" + user.uid + "/vPlan").set({
            uname: uname,
            pwd: pwd
        }, function (error) {
            auth.setJahrgang(jahrgang);
            if(error){
                console.error(error);
            }else{
                changePage("content/home.html");
            }
        });
    }).catch(function (error) {
        if (error.code === 'auth/operation-not-allowed') {
            alert('Temporäre Störung! Bitte melde dich mit deiner Telefonnummer oder E-Mail-Adresse an.');
        } else {
            console.error(error);
        }
    });
}

function phoneBtnClicked() {
    $("#login_div_vplan").hide();
    $("#login_btn_phone").hide();
    $("#login_div_datenschutz").hide();
    $("#login_btn_email").hide();

    $("#login_input_phoneCountryCode").show();
    $("#login_input_phone").show();
    $("#login_btn_proove").show();

    auth.setreCAPTCHA();
}

function emailBtnClicked() {
    $("#login_div_vplan").hide();
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