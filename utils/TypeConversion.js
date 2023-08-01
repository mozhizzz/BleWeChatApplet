export function ab2hex(buffer) {
  let hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function(bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join(' ');
}

export function stringToAscii(str) {
  var hexArray = [];
  for (var i = 0; i < str.length; i++) {
      hexArray.push(str.charCodeAt(i).toString(16));
  }
  return hexArray;
}

export function stringToHexArray(str) {
  var result = new Uint8Array(Math.ceil(str.length / 2));
    for (var i = 0; i < str.length; i += 2) {
        result[i / 2] = parseInt(str.substring(i, i + 2), 16);
    }
    return result.buffer;
}

export function arrayBufferToHexString(buffer) {
  var byteArray = new Uint8Array(buffer);
  var hexString = '';
  var nextHexByte;

  for (var i=0; i<byteArray.byteLength; i++) {
      nextHexByte = byteArray[i].toString(16);  // Integer to base 16
      if (nextHexByte.length < 2) {
          nextHexByte = "0" + nextHexByte;     // Otherwise 10 becomes just a instead of 0a
      }
      hexString += nextHexByte + " ";
  }
  return hexString.trim();  // Remove trailing space
}