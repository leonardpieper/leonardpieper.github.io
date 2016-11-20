var kurse = [];

function getKurse(outputElementId){
  var output = "";
  var ref="Users/" + firebase.auth().currentUser.uid + "/Kurse";

  firebase.database().ref(ref).once('value').then(function (snapshot) {
    var snapChildren = snapshot.numChildren();

    var i = 1;
    snapshot.forEach(function (childSnapshot) {
      var kurs = childSnapshot.val().name;
      var kursRef = "Kurse/" + kurs;

      firebase.database().ref(kursRef).once('value').then(function (snapshot) {
          // if(snapshot.val()>=getTimeMillForKursLocal(kurs)){
            // var kurs = snapshot.getKey();

            var name = snapshot.getKey();
            var kursID = name.replace(/ /g, "__");
            var timestamp = snapshot.val().timestamp;
            // output += "<li class='mdl-list__item android-kursList' data-timestamp='"+timestamp+"' data-kurs='"+name+"'><img alt='"+name+" Icon' src='"+getIcon(name)+"'><span class='mdl-list__item-primary-content dash-kurs_span'><a id='"+kursID+"Id' class='kursLink' href=\"javascript:setKurs(\'"+name+"\')\">"+name+"</a></span></li>";
            output += "<li class='mdl-list__item android-kursList' data-timestamp='"+timestamp+"' data-kurs='"+name+"'><img class='kursIcon' alt='"+name+" Icon' src='"+getIcon(name)+"'><a id='"+kursID+"Id' class='kursLink "+outputElementId+"' href=\"javascript:setKurs(\'"+name+"\')\">"+name+"</a></li>";

            $("#" + outputElementId).html(output);

            $("#d" + outputElementId).find(".android-kursList").sort(function (a,b) {
              a.dataset.timestamp = a.dataset.timestamp *-1;
              b.dataset.timestamp = b.dataset.timestamp *-1;
              return +a.dataset.timestamp - +b.dataset.timestamp;
            }).appendTo("#" + outputElementId);

            getBadge();
            kurse.push(snapshot);
            getKurseReady(snapChildren, i);
            i++;
          // }
      });
    });
    $("#dashKurse").html(output);
  });
}

function getKurseReady(snapshotChildren, count) {
  if(snapshotChildren === count){
    showRecentMedia();
  }
}

function getBadge(){
  for(i=0; i<$(".android-kursList").length; i++){
    var onlineTimestamp = $(".android-kursList")[i].dataset.timestamp * -1;
    var offlineTimestamp = getTimeMillForKursLocal($(".android-kursList")[i].dataset.kurs);

    if(offlineTimestamp<onlineTimestamp){
      document.getElementsByClassName("kursLink")[i].setAttribute("data-badge", "*")  ;
      document.getElementsByClassName("kursLink")[i].className += " mdl-badge";
    }
  }
}

function getIcon(fach) {
  fach = fach.split(' ')[0];
  fach = fach.toLowerCase();
  return "resources/kurs-icons/"+fach+".svg";
}