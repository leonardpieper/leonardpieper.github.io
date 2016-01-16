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
    alert('iOS');
	return 'iOS';
  }
  else if( userAgent.match( /Android/i ) )
  {
	alert('Android');
	window.location = "http://google.com"
    return 'Android';
  }
  else
  {
	alert('unknown');
    return 'unknown';
  }
}