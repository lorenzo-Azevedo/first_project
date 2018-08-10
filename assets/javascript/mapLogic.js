let place, service, placeLoc, marker, userMarker, infowindow, map, infoWindow, pos, feature, pyrmont, myLocation = {}, markers = [], placeGlobal;
let standart = {
  lat: 40.775812,
  lng: -73.971636
};

let icons = {
  user: 'assets/images/mapIcons/crab.png',
  liquor_store: 'assets/images/mapIcons/liquor.png',
  atm: 'assets/images/mapIcons/atm.png',
  bar: 'assets/images/mapIcons/bar.png'
};

function initMap() { //initialize the map
  map = new google.maps.Map(document.getElementById('map'), {
    // center: pyrmont,
    zoom: 12
  });

  infowindow = new google.maps.InfoWindow(); //init new infoWindow class that dispalays info when you click marker
  service = new google.maps.places.PlacesService(map);//init new places service class that contains methods related to searching for places

  if (navigator.geolocation) { //get location

    navigator.geolocation.getCurrentPosition(function(position) {
      pyrmont = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      Object.assign(myLocation, pyrmont); //copy location to new obj

      map.setCenter(pyrmont); //set map at the user location
      setUserMarker(pyrmont);
    }, function() {
      pyrmont = {};
      Object.assign(pyrmont, standart);
      $('#myLocation').hide();
      map.setCenter(pyrmont);
      setUserMarker(pyrmont);
    });
  }

  map.addListener('click', function(event) { //place user marker on clicked place
    pyrmont.lat = event.latLng.lat();
    pyrmont.lng = event.latLng.lng();
    userMarker.setPosition(pyrmont);
    map.setCenter(pyrmont);
    // userMarker.setMap(map);
  });
};

function setUserMarker(pos) { // create user marker
  if (userMarker != null) userMarker.setMap(null);
  userMarker = new google.maps.Marker({
    position: pos,
    icon: icons.user,
    map: map,
    title: 'Here I am'
  });
  map.panTo(userMarker.getPosition());
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (let i = 0; i < results.length; i++) {
      createMarker(results[i], feature); //create markers around user marker by provided parameter
    }
  }
}

function createMarker(place, feature) { //create markers with provided icons
  placeLoc = place.geometry.location;
  marker = new google.maps.Marker({
    map: map,
    icon: icons[feature],
    position: placeLoc
  });

  markers.push(marker);

  google.maps.event.addListener(marker, 'click', function() { //show info when marker clicked
    let status = '', rating = '';
    if(place.opening_hours === undefined) status = 'Nobody nows!';
    else if(place.opening_hours.open_now === true) status = 'Open!';
    else if(place.opening_hours.open_now === false) status = 'Closed!';
    if(place.rating >= 0) rating = place.rating;
    else rating = 'no info.';
    infowindow.setContent(`<p>${place.name}</p><p>${place.vicinity}</p><p>Rating: ${rating}</p><p>${status}</p>`);
    infowindow.open(map, this);
  });
}

function setMapOnAll(map) { //place all markers on the emap
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function clearMarkers() { //set all markers to null
  setMapOnAll(null);
};

function showMarkers() { //set markers to the map
  setMapOnAll(map);
};

function nearby (feature, loc) { //search for services
  service.nearbySearch({
    location: loc,
    radius: 1000,
    type: feature,
  }, callback);
};

//program execution
$(document).on('click', '#bar, #atm, #liquor_store, #myLocation', function(){
  feature = $(this).attr('id');
  if(feature != 'myLocation') {
    clearMarkers();
    nearby(feature, pyrmont);
  } else {
    setUserMarker(myLocation);
    Object.assign(pyrmont, myLocation); //object behavior
  };
  map.panTo(userMarker.getPosition());
});

$('#claerMap').on('click', function(){
  clearMarkers();
});
