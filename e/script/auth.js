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
        var phoneNumber = $("#login_input_phone").val();
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
    }
}

function phoneBtnClicked() {
    $("#login_btn_phone").hide();
    $("#login_div_datenschutz").hide();
    $("#login_btn_email").hide();

    $("#login_input_phone").show();
    $("#login_btn_proove").show();

    auth.setreCAPTCHA();
}