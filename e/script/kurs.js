var kurse = [];

function getKurse(outputElementId) {

    var ref = "Users/" + firebase.auth().currentUser.uid + "/Kurse";

    var d = new Date();
    var currTimeMill = d.getTime();

    if (cacheKurse.getTime() > currTimeMill + 604800000 || cacheKurse.getTime() === -1) {


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
                cacheKurse.newCache();
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

                        cacheKurse.addcache(name, timestamp)
                        // }
                    }, function(err) {
                        if (err.message.includes("permission_denied")) {
                            output += "Das Passwort für " + kurs + " ist falsch, bitte versuchen Sie es erneut<a class='kurs-false-icon' href=\"javascript:wrongKurs(\'" + kurs + "\')\"><i class='material-icons'>&#xE872;</i></a><br />"
                            $("#" + outputElementId).html(output);
                        }
                    });
                    $("#" + outputElementId).html(output);
                });
            }
        });
    }else{
      var cache = cacheKurse.returnCache();
      output = "";
      for(var kurs in cache){
        var name = cache[kurs].kurs;
        var timestamp = cache[kurs].timestamp;
        var kursID = name.replace(/ /g, "__");

        // var timestamp = snapshot.val().timestamp;
        if (outputElementId === "kurs-liste") {
            output += "<li class='mdl-list__item android-kursList' data-timestamp='" + timestamp + "' data-kurs='" + name + "'><img class='kursIcon' alt='" + name + " Icon' src='" + getIcon(name) + "'><a id='" + kursID + "Id' class='kursLink " + outputElementId + "' href=\"javascript:setKurs(\'" + name + "\')\">" + name + "</a><a class='kurs-close-icon' href=\"javascript:leaveKursDialog(\'" + kursID + "\')\"><i class='material-icons'>&#xE879;</i></a><a class='kurs-rem-icon' href=\"javascript:removeKursDialog(\'" + kursID + "\')\"><i class='material-icons'>&#xE92B;</i></a></li>";
        } else {
            output += "<li class='mdl-list__item android-kursList' data-timestamp='" + timestamp + "' data-kurs='" + name + "'><img class='kursIcon' alt='" + name + " Icon' src='" + getIcon(name) + "'><a id='" + kursID + "Id' class='kursLink " + outputElementId + "' href=\"javascript:setKurs(\'" + name + "\')\">" + name + "</a></li>";
        }
      }
      $("#" + outputElementId).html(output);

      // $("#d" + outputElementId).find(".android-kursList").sort(function(a, b) {
      //     a.dataset.timestamp = a.dataset.timestamp * -1;
      //     b.dataset.timestamp = b.dataset.timestamp * -1;
      //     return +a.dataset.timestamp - +b.dataset.timestamp;
      // }).appendTo("#" + outputElementId);

      getBadge();
      // kurse.push(snapshot);
      // getKurseReady(snapChildren, i);
    }
}
var cacheKurse = {
    newCache: function() {
        localStorage.setItem("kurse", undefined);
    },

    addcache: function(newKurs, timestamp) {
        var d = new Date();
        var currTimeMill = d.getTime();
        var oldCache = localStorage.getItem("kurse");
        if (oldCache != null && oldCache != undefined && oldCache != "null" && oldCache != "undefined") {
            var cache = JSON.parse(oldCache);

            cache.mill = currTimeMill;
            cache["kurse"].push({
                "kurs": newKurs,
                "timestamp": timestamp
            });

            localStorage.setItem("kurse", JSON.stringify(cache));
        } else {
            var cache = new Object();

            cache.mill = currTimeMill;
            cache["kurse"] = [];
            cache["kurse"].push({
                "kurs": newKurs,
                "timestamp": timestamp
            });

            localStorage.setItem("kurse", JSON.stringify(cache));
        }
    },

    returnCache: function () {
      var oldCache = localStorage.getItem("kurse");
      var cache = JSON.parse(oldCache);
      return cache.kurse;
    },

    getTime: function() {
        var oldCache = localStorage.getItem("kurse");
        var cache = JSON.parse(oldCache);
        if(cache==null){
          return -1;
        }else{
          return cache.mill;
        }
    }
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
    var alleFacherIcons = ["bi", "ch", "d", "e", "ek", "el", "ew", "f", "ge", "if", "ku", "m", "mu", "ph", "pl", "s", "sp", "sw"];
    fach = fach.split(' ')[0];
    fach = fach.toLowerCase();
    if (alleFacherIcons.indexOf(fach) > -1) {
        return "resources/kurs-icons/" + fach + ".svg";
    } else {
        return "resources/kurs-icons/default.svg";
    }

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

function wrongKurs(kurs) {
    var uid = firebase.auth().currentUser.uid;
    firebase.database().ref('Users/' + uid + '/Kurse/' + kurs).remove();
}
