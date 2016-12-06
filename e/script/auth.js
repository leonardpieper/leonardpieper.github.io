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
                history.pushState(null, null, "home.html");
                changePage('content/home.html');
                break;
            default:
                console.log("G-LoggedIn");
        }
    });
}

function noGAuth() {
    history.pushState(null, null, "home.html");
    changePage('content/home.html');
    localStorage.setItem("noGAuth", true);
}
