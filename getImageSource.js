'use strict';
/*
	Function to take the photo object and create a valid image uri based on the
	Flickr API documentation. 
*/
function getImageSource(photo: Object): {uri: ?string} {
  var uri = "https://farm" + photo.farm + ".staticflickr.com/" 
  uri += photo.server +"/" + photo.id + "_" + photo.secret +".jpg";
  return { uri };
}

module.exports = getImageSource;