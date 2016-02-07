'use strict';

function getImageSource(photo: Object): {uri: ?string} {
  var uri = "https://farm" + photo.farm + ".staticflickr.com/" + photo.server +"/" + photo.id + "_" + photo.secret +".jpg";
  return { uri };
}

module.exports = getImageSource;