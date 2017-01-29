var kurse = [];

function getKurse(outputElementId) {

    var ref = "Users/" + firebase.auth().currentUser.uid + "/Kurse";

    var d = new Date();
    var currTimeMill = d.getTime();

    if (cacheKurse.getTime() + 604800000 < currTimeMill || cacheKurse.getTime() === -1) {


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

                    if(childSnapshot.val().type==="online"){

                      firebase.database().ref(kursRef).once('value').then(function(snapshot) {
                          // if(snapshot.val()>=getTimeMillForKursLocal(kurs)){
                          // var kurs = snapshot.getKey();

                          var name = snapshot.getKey();
                          var kursID = name.replace(/ /g, "__");
                          var timestamp = snapshot.val().timestamp;
                          // output += "<li class='mdl-list__item android-kursList' data-timestamp='"+timestamp+"' data-kurs='"+name+"'><img alt='"+name+" Icon' src='"+getIcon(name)+"'><span class='mdl-list__item-primary-content dash-kurs_span'><a id='"+kursID+"Id' class='kursLink' href=\"javascript:setKurs(\'"+name+"\')\">"+name+"</a></span></li>";
                          if (outputElementId === "kurs-liste") {
                              output += "<li class='mdl-list__item android-kursList' data-timestamp='" + timestamp + "' data-kurs='" + name + "'><img class='kursIcon' alt='" + name + " Icon' src='" + getIcon(name) + "'><a id='" + kursID + "Id' class='kursLink " + outputElementId + "' href=\"javascript:setKurs(\'" + name + "\')\">" + name + "</a><a class='kurs-close-icon' href=\"javascript:leaveKursDialog(\'" + kursID + "\')\"><i class='material-icons'>&#xE879;</i></a><a class='kurs-rem-icon operatorArea' href=\"javascript:removeKursDialog(\'" + kursID + "\')\"><i class='material-icons'>&#xE92B;</i></a></li>";
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

                          cacheKurse.addcache(name, timestamp, "online");
                          // }
                      }, function(err) {
                          if (err.message.includes("permission_denied")) {
                              output += "Das Passwort für " + kurs + " ist falsch, bitte versuchen Sie es erneut<a class='kurs-false-icon' href=\"javascript:wrongKurs(\'" + kurs + "\')\"><i class='material-icons'>&#xE872;</i></a><br />"
                              $("#" + outputElementId).html(output);
                          }
                      });
                    }else {
                      var kursID = kurs.replace(/ /g, "__");
                      if (outputElementId === "kurs-liste") {
                          output += "<li class='mdl-list__item android-kursList' data-kurs='" + kurs + "'><img class='kursIcon' alt='" + kurs + " Icon' src='" + getIcon(kurs) + "'><p id='" + kursID + "Id' class='kursLink " + outputElementId + "' >" + kurs + "</p><a class='kurs-close-icon' href=\"javascript:leaveKursDialog(\'" + kursID + "\')\"><i class='material-icons'>&#xE879;</i></a></li>";
                      } else {
                          output += "<li class='mdl-list__item android-kursList' data-kurs='" + kurs + "'><img class='kursIcon' alt='" + kurs + " Icon' src='" + getIcon(kurs) + "'><p id='" + kursID + "Id' class='kursLink " + outputElementId + "' >" + kurs + "</p></li>";
                      }
                      cacheKurse.addcache(kurs, 0, "offline");
                    }
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
        if(cache[kurs].type==="online"){
          if (outputElementId === "kurs-liste") {
              output += "<li class='mdl-list__item android-kursList' data-timestamp='" + timestamp + "' data-kurs='" + name + "'><img class='kursIcon' alt='" + name + " Icon' src='" + getIcon(name) + "'><a id='" + kursID + "Id' class='kursLink " + outputElementId + "' href=\"javascript:setKurs(\'" + name + "\')\">" + name + "</a><a class='kurs-close-icon' href=\"javascript:leaveKursDialog(\'" + kursID + "\')\"><i class='material-icons'>&#xE879;</i></a><a class='kurs-rem-icon operatorArea' href=\"javascript:removeKursDialog(\'" + kursID + "\')\"><i class='material-icons'>&#xE92B;</i></a></li>";
          } else {
              output += "<li class='mdl-list__item android-kursList' data-timestamp='" + timestamp + "' data-kurs='" + name + "'><img class='kursIcon' alt='" + name + " Icon' src='" + getIcon(name) + "'><a id='" + kursID + "Id' class='kursLink " + outputElementId + "' href=\"javascript:setKurs(\'" + name + "\')\">" + name + "</a></li>";
          }
        }else {
          if (outputElementId === "kurs-liste") {
              output += "<li class='mdl-list__item android-kursList' data-kurs='" + name + "'><img class='kursIcon' alt='" + name + " Icon' src='" + getIcon(name) + "'><p id='" + kursID + "Id' class='kursLink " + outputElementId + "' >" + name + "</p><a class='kurs-close-icon' href=\"javascript:leaveKursDialog(\'" + kursID + "\')\"><i class='material-icons'>&#xE879;</i></a></li>";
          } else {
              output += "<li class='mdl-list__item android-kursList' data-kurs='" + name + "'><img class='kursIcon' alt='" + name + " Icon' src='" + getIcon(name) + "'><p id='" + kursID + "Id' class='kursLink " + outputElementId + "' >" + name + "</p></li>";
          }
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

    addcache: function(newKurs, timestamp, type) {
        var d = new Date();
        var currTimeMill = d.getTime();
        var oldCache = localStorage.getItem("kurse");
        if (oldCache != null && oldCache != undefined && oldCache != "null" && oldCache != "undefined") {
            var cache = JSON.parse(oldCache);

            cache.mill = currTimeMill;
            cache["kurse"].push({
                "kurs": newKurs,
                "timestamp": timestamp,
                "type":type
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
    },
    removeFromCache: function (fach) {
        var oldCache = localStorage.getItem("kurse");
        var cache = JSON.parse(oldCache);

        for(var element in cache.kurse){
          if(cache.kurse[element].kurs==fach){
            cache.kurse.splice(element, 1);
          }
        }

        localStorage.setItem("kurse", JSON.stringify(cache));

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

        if (offlineTimestamp < onlineTimestamp && (offlineTimestamp !== null || offlineTimestamp!="NaN")) {
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

    var isOffline = $("#checkboxOfflineKurs").is(":checked");
    var type;

    if(isOffline==true){
      type="offline";
    }else {
      type="online";
    }
    if(isOffline==true){
      firebase.database().ref('Users/' + uid + '/Kurse/' + name).set({
          name: name,
          type: "offline"
      });
    }else if (isOffline==false) {
      firebase.database().ref('Users/' + uid + '/Kurse/' + name).set({
          name: name,
          secret: secret,
          type: "online"
      });
    }

    closeDialogBox("android-joinkurs-dialog");

    cacheKurse.addcache(name, 0, type);
}

function offlineKursCheckbox() {
  var isOffline = $("#checkboxOfflineKurs").is(":checked");
  if(isOffline==true){
    $("#joinSecretTextfield").prop( "disabled", true );
  }else{
    $("#joinSecretTextfield").prop( "disabled", false );
  }
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

    cacheKurse.removeFromCache(name);
}

function delKurs(delElement) {
    var name = $("#delFach").html();
    firebase.database().ref('Kurse/' + name).remove();
    closeDialogBox("android-delkurs-dialog");

    cacheKurse.removeFromCache(name);
}

function wrongKurs(kurs) {
    var uid = firebase.auth().currentUser.uid;
    firebase.database().ref('Users/' + uid + '/Kurse/' + kurs).remove();

    cacheKurse.removeFromCache(name);
}
