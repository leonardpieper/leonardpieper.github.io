var kurse = [];

function getKurse(outputElementId) {

    var ref = "Users/" + firebase.auth().currentUser.uid + "/Kurse";

    firebase.database().ref(ref).on('value', function(snapshot) {
        var snapChildren = snapshot.numChildren();
        kurse = [];
        var output = "";

        if (snapshot.val() === null && outputElementId !== "kurs-liste") {
            $("#" + outputElementId).html("<p class='noKurse'>Keine Kurse gefunden<br /><a class='android-pointer' onclick=\"changePageWithElement(\'content/kurse.html\', this)\">Kurse hinzufügen</a></p>");
        } else if (snapshot.val() === null) {
            $("#" + outputElementId).html("<p class='noKurse'>Keine Kurse gefunden</p>");
        } else {
            var i = 1;
            snapshot.forEach(function(childSnapshot) {
                var kurs = childSnapshot.val().name;
                var kursRef = "Kurse/" + kurs;

                firebase.database().ref(kursRef).once('value').then(function(snapshot) {
                    // if(snapshot.val()>=getTimeMillForKursLocal(kurs)){
                    // var kurs = snapshot.getKey();

                    var name = snapshot.getKey();
                    var kursID = name.replace(/ /g, "__");
                    var timestamp = snapshot.val().timestamp;
                    // output += "<li class='mdl-list__item android-kursList' data-timestamp='"+timestamp+"' data-kurs='"+name+"'><img alt='"+name+" Icon' src='"+getIcon(name)+"'><span class='mdl-list__item-primary-content dash-kurs_span'><a id='"+kursID+"Id' class='kursLink' href=\"javascript:setKurs(\'"+name+"\')\">"+name+"</a></span></li>";
                    if (outputElementId === "kurs-liste") {
                        output += "<li class='mdl-list__item android-kursList' data-timestamp='" + timestamp + "' data-kurs='" + name + "'><img class='kursIcon' alt='" + name + " Icon' src='" + getIcon(name) + "'><a id='" + kursID + "Id' class='kursLink " + outputElementId + "' href=\"javascript:setKurs(\'" + name + "\')\">" + name + "</a><a class='kurs-close-icon' href=\"javascript:leaveKursDialog(\'" + kursID + "\')\"><i class='material-icons'>&#xE879;</i></a><a class='kurs-rem-icon' href=\"javascript:removeKursDialog(\'" + kursID + "\')\"><i class='material-icons'>&#xE92B;</i></a></li>";
                    } else {
                        output += "<li class='mdl-list__item android-kursList' data-timestamp='" + timestamp + "' data-kurs='" + name + "'><img class='kursIcon' alt='" + name + " Icon' src='" + getIcon(name) + "'><a id='" + kursID + "Id' class='kursLink " + outputElementId + "' href=\"javascript:setKurs(\'" + name + "\')\">" + name + "</a></li>";
                    }


                    $("#" + outputElementId).html(output);

                    $("#d" + outputElementId).find(".android-kursList").sort(function(a, b) {
                        a.dataset.timestamp = a.dataset.timestamp * -1;
                        b.dataset.timestamp = b.dataset.timestamp * -1;
                        return +a.dataset.timestamp - +b.dataset.timestamp;
                    }).appendTo("#" + outputElementId);

                    getBadge();
                    kurse.push(snapshot);
                    getKurseReady(snapChildren, i);
                    i++;
                    // }
                }, function(err) {
                    if (err.message.includes("permission_denied")) {
                        output += "Das Passwort für " + kurs + " ist falsch, bitte versuchen Sie es erneut<a class='kurs-false-icon' href=\"javascript:leaveKurs(\'this\')\"><i class='material-icons'>&#xE872;</i></a><br />"
                        $("#" + outputElementId).html(output);
                    }
                });
                $("#" + outputElementId).html(output);
            });
        }
    });
}

function getKurseReady(snapshotChildren, count) {
    if (snapshotChildren === count) {
        showRecentMedia();
    }
}

function getBadge() {
    for (i = 0; i < $(".android-kursList").length; i++) {
        var onlineTimestamp = $(".android-kursList")[i].dataset.timestamp * -1;
        var offlineTimestamp = getTimeMillForKursLocal($(".android-kursList")[i].dataset.kurs);
        onlineTimestamp = onlineTimestamp * -1;

        if (offlineTimestamp < onlineTimestamp || (offlineTimestamp === null && onlineTimestamp !== null)) {
            var list = document.getElementsByClassName("android-kursList")[i];
            var badge = "<div class='badge'></div>"
            $(badge).insertBefore(list.children[1]);
            // list.insertBefore(badge, list.children[1]);

            // var name = document.getElementsByClassName("kursLink")[0].innerHTML;
            // name = name + "<div class='badge'></div>";
            // document.getElementsByClassName("kursLink")[0].innerHTML = name;
            // document.getElementsByClassName("kursLink")[i].setAttribute("data-badge", "*");
            // document.getElementsByClassName("kursLink")[i].className += " mdl-badge";
        }
    }
}

function joinKurs() {
    var name = $("#joinKursTextfield").val();
    var secret = $("#joinSecretTextfield").val();
    var auth = firebase.auth();
    var uid = auth.currentUser.uid;

    firebase.database().ref('Users/' + uid + '/Kurse/' + name).set({
        name: name,
        secret: secret
    });

    closeDialogBox("android-joinkurs-dialog");
}

function getIcon(fach) {
    fach = fach.split(' ')[0];
    fach = fach.toLowerCase();
    return "resources/kurs-icons/" + fach + ".svg";
}

function editKurse() {
    $(".kurs-close-icon").show();
    $(".kurs-rem-icon").show();
}

function leaveKursDialog(kursName) {
    $("#android-leavekurs-dialog").show();
    $("#leaveFach").html(kursName.replace('__', " "));
}

function removeKursDialog(kursName) {
    $("#android-delkurs-dialog").show();
    $("#delFach").html(kursName.replace('__', " "));
}

function leaveKurs(delElement) {
    var name = $("#leaveFach").html();
    var uid = firebase.auth().currentUser.uid;
    firebase.database().ref('Users/' + uid + '/Kurse/' + name).remove();
    closeDialogBox("android-leavekurs-dialog");
}

function delKurs(delElement) {
    var name = $("#delFach").html();
    firebase.database().ref('Kurse/' + name).remove();
    closeDialogBox("android-delkurs-dialog");
}
