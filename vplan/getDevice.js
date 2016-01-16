/**
 * Determine the mobile operating system.
 * This function either returns 'iOS', 'Android' or 'unknown'
 *
 * @returns {String}
 */
function getDevice() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if( userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i ) )
  {
    document.getElementById("deviceDialogContent").innerHTML = "Wenn du die Webseite als Webapp verwendest kannst du sie auch offline nutzen!"
	return 'iOS';
  }
  else if( userAgent.match( /Android/i ) )
  {
	document.getElementById("deviceDialogContent").innerHTML = "Es gibt auch eine Android App im Google Play Store"
    return 'Android';
  }
  else
  {
	alert('unknown');
	document.getElementById("deviceDialogContent").innerHTML = "Windows."
	//window.location.replace("index.html#myPopupDialog");
    return 'unknown';
  }
}