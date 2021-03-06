// function getVPlan() {
//     var ref = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/EF" + "/0").on("value", function(snapshot) {
//         alert(snapshot.val().Datum);
//     });
// }

// function getVPlanForToday() {
//     var d = new Date();
//     var day = d.getDate();
//     var month = d.getMonth() + 1;
//     firebase.database().ref("vPlan" + "/EF").on("value", function(snapshot) {
//         var output = "<table class='android-vPlan-Table'>";
//         snapshot.forEach(function(childSnapshot) {
//             var datum = childSnapshot.val().Datum;
//             if (datum == day + "." + month + ".") {
//                 output += "<tr><td class='tdNonText'>" + childSnapshot.val().Fach + "</td>";
//                 output += "<td class='tdNonText'>" + childSnapshot.val().Stunde + "</td>";
//                 output += "<td class='tdNonText'>" + childSnapshot.val().Vertreter + "</td>";
//                 output += "<td class='tdNonText'>" + childSnapshot.val().Raum + "</td>";
//                 output += "<td>" + childSnapshot.val()['Vertretungs-Text'] + "</td></tr>";
//             }
//         });
//         output += "</table>";
//         $("#vPlanToday").html(output);
//     });
// }

// function getVPlanForTomorrow() {
//     var d = new Date();
//     var day = d.getDate() + 1;
//     var month = d.getMonth() + 1;
//     firebase.database().ref("vPlan" + "/EF").on("value", function(snapshot) {
//         var output = "<table class='android-vPlan-Table'>";
//         snapshot.forEach(function(childSnapshot) {
//             var datum = childSnapshot.val().Datum;
//             if (datum == day + "." + month + ".") {
//                 output += "<tr><td class='tdNonText'>" + childSnapshot.val().Fach + "</td>";
//                 output += "<td class='tdNonText'>" + childSnapshot.val().Stunde + "</td>";
//                 output += "<td class='tdNonText'>" + childSnapshot.val().Vertreter + "</td>";
//                 output += "<td class='tdNonText'>" + childSnapshot.val().Raum + "</td>";
//                 output += "<td>" + childSnapshot.val()['Vertretungs-Text'] + "</td></tr>";
//             }
//         });
//         output += "</table>";
//         $("#vPlanTomorrow").html(output);
//     });
// }

// function getVPlanForYear(year, location) {
//     // var years = ["EF", "Q1", "Q2"];
//     // for(var i = 0; i<years.length; i++){
//     if(year==0){
//       getVPlanForTeacher(location);
//       // $(".tabcontent").hide();
//       // $(".tablinks").removeClass("active");

//       $("#me").show();
//       return;
//     }
//     firebase.database().ref("vPlan" + "/" + year).on("value", function(snapshot) {
//         var output = "<table class='android-vPlan-Table'>";
//         var iDatum;
//         snapshot.forEach(function(childSnapshot) {
//             var datum = childSnapshot.val().Datum;
//             if (iDatum != datum && !(childSnapshot.val().Fach === undefined || childSnapshot.val().Fach === "Fach")) {
//                 output += "<tr class='trDate'><td class='tdDate' colspan='3'>" + childSnapshot.val().Tag + "</td>";
//                 output += "<td class='tdDate' colspan='2'>" + childSnapshot.val().Datum + "</td></tr>";
//             }
//             if (!(childSnapshot.val().Fach === undefined || childSnapshot.val().Fach === "Fach")) {
//                 output += "<tr><td class='tdNonText vTd'>" + childSnapshot.val().Fach + "</td>";
//                 output += "<td class='tdNonText vTd'>" + childSnapshot.val().Stunde + "</td>";
//                 output += "<td class='tdNonText vTd'>" + childSnapshot.val().Vertreter + "</td>";
//                 output += "<td class='tdNonText vTd'>" + childSnapshot.val().Raum + "</td>";
//                 output += "<td class='vTd'>" + childSnapshot.val()['Vertretungs-Text'] + "</td></tr>";
//             }
//             iDatum = datum;
//         });
//         output += "</table>"
//         if (location === "vplan") {
//             $("#vPlanAll" + year).html(output);
//         } else if (location === "home") {
//             $("#vPlanToday").html(output);
//         }

//         // $("#vPlanAll" + year + " tr:last").after(output);
//         // document.getElementById("vPlanAll" + year).innerHTML = output;
//     }, function(err) {
//         if (err.message.includes("permission_denied")) {
//             if (location === "vplan") {
//                 $("#vPlanAll" + year).html("<p class='noKurse'>Sie sind nicht im Vertretungsplan angemeldet<br />Überprüfen Sie Ihren Benutzernamen und Passwort</p>");
//             } else if (location === "home") {
//                 $("#vPlanToday").html("<p class='noKurse'>Sie sind nicht im Vertretungsplan angemeldet<br />Überprüfen Sie Ihren Benutzernamen und Passwort</p>");
//             }
//         }
//     });
//     // }
// }

function getVPlanForTeacher(location){
  firebase.database().ref("vPlan").on("value", function(snapshot) {
    var tage = {"Mo":"","Di":"","Mi":"","Do":"","Fr":""}
    var datumTage = new Object();
    var output = "<table class='android-vPlan-Table'>";
    var iDatum;
    snapshot.forEach(function (childSnapshot) {
      childSnapshot.forEach(function(babySnapshot) {
          var datum = babySnapshot.val().Datum;
          if(babySnapshot.val().Vertreter !== undefined && babySnapshot.val().Vertreter.toLowerCase()===getLehrerAbk().toLowerCase()){
            currTag = babySnapshot.val().Tag
            tage[currTag] += "<tr><td class='tdNonText vTd'>" + babySnapshot.val().Fach + "</td>";
            tage[currTag] += "<td class='tdNonText vTd'>" + babySnapshot.val().Stunde + "</td>";
            tage[currTag] += "<td class='tdNonText vTd'>" + babySnapshot.val().Vertreter + "</td>";
            tage[currTag] += "<td class='tdNonText vTd'>" + babySnapshot.val().Raum + "</td>";
            tage[currTag] += "<td class='tdNonText vTd'>" + babySnapshot.val()['Vertretungs-Text'] + "</td>";
            datumTage[currTag] = babySnapshot.val().Datum
          }
        });
    });
    for(obj in tage){
      if(datumTage[obj]!==undefined){
        output += "<tr class='trDate'><td class='tdDate' colspan='3'>" + obj + "</td>";
        output += "<td class='tdDate' colspan='2'>" + datumTage[obj]+ "</td></tr>";
        output += tage[obj];
      }
    }
    output += "</table>"
    if (location === "vplan") {
        $("#vPlanMe").html(output);
    } else if (location === "home") {
        $("#vPlanToday").html(output);
    }

  });
}

function changeVPlanYear(evt, year) {
    var i, tabcontent, tablins;

    vplan.getVPlanForYear(year, function (vertretungsplan) {
        $("#vPlanAll" + year).html(vertretungsplan)
    });

    $(".tabcontent").hide();
    $(".tablinks").removeClass("active");

    $("#" + year).show();
    evt.currentTarget.className += " active";
}

function setFirstOpen() {
    $(".tabcontent").hide();
    $(".tablinks").removeClass("active");

    jahrgang = auth.getJahrgang();
        
    $("#tab" + jahrgang).addClass("active");

    $("#waterfallHeader").removeClass("is-casting-shadow");

}

var vplan = {
    getVPlanForYear: function (jahrgang, fn) {
        firebase.database().ref("vPlan" + "/" + jahrgang).on("value", function(snapshot) {
        var output = "<table class='android-vPlan-Table'>";
        var iDatum;
        snapshot.forEach(function(childSnapshot) {
            var datum = childSnapshot.val().Datum;
            if (iDatum != datum && !(childSnapshot.val().Fach === undefined || childSnapshot.val().Fach === "Fach")) {
                output += "<tr class='trDate'><td class='tdDate' colspan='3'>" + childSnapshot.val().Tag + "</td>";
                output += "<td class='tdDate' colspan='2'>" + childSnapshot.val().Datum + "</td></tr>";
            }
            if (!(childSnapshot.val().Fach === undefined || childSnapshot.val().Fach === "Fach")) {
                output += "<tr><td class='tdNonText vTd'>" + childSnapshot.val().Fach + "</td>";
                output += "<td class='tdNonText vTd'>" + childSnapshot.val().Stunde + "</td>";
                output += "<td class='tdNonText vTd'>" + childSnapshot.val().Vertreter + "</td>";
                output += "<td class='tdNonText vTd'>" + childSnapshot.val().Raum + "</td>";
                output += "<td class='vTd'>" + childSnapshot.val()['Vertretungs-Text'] + "</td></tr>";
            }
            iDatum = datum;
        });
        output += "</table>"
        fn(output);
        });
    }
    // function(err) {
    //     if (err.message.includes("permission_denied")) {
    //         if (location === "vplan") {
    //             $("#vPlanAll" + year).html("<p class='noKurse'>Sie sind nicht im Vertretungsplan angemeldet<br />Überprüfen Sie Ihren Benutzernamen und Passwort</p>");
    //         } else if (location === "home") {
    //             $("#vPlanToday").html("<p class='noKurse'>Sie sind nicht im Vertretungsplan angemeldet<br />Überprüfen Sie Ihren Benutzernamen und Passwort</p>");
    //         }
    //     }
    // }
    // );
    // }
};