//lat,lng,zoom,language,menu_filter_area are set outside
var citybranding_mod_map;
var citybranding_markers = [];
var mc;
var infoWindow = new google.maps.InfoWindow({
  maxWidth: 350
});

function citybranding_mod_map_initialize() {
  var  center = new google.maps.LatLng(lat,lng);
  var mapOptions = {
    zoom: parseInt(zoom),
    center: center
  };
  citybranding_mod_map = new google.maps.Map(document.getElementById('citybranding-mod-map-canvas'),
      mapOptions);

  setMarkers(center, citybranding_mod_map);

  google.maps.event.addListener(citybranding_mod_map, 'click', function() {
    infoWindow.close();
    panelFocusReset();
  });  

  js("div[id^='citybranding-panel-']").mouseenter(function(e){
      markerBounce( this.id.substring(10) );
  });

  js("div[id^='citybranding-panel-']").mouseleave(function(e){
      markerIdle( this.id.substring(10) );
  });  
}


function setMarkers(center, map) {
    var json = (function () { 
        var json = null;

        jQuery.ajax({ 
            'async': true, 
            'global': false, 
            'url': "index.php?option=com_citybranding&task=pois.markers&format=json",
            'dataType': "json", 
            'success': function (data) {
                json = data; 

                //loop between each of the json elements
                for (var i = 0, length = json.data.length; i < length; i++) {
                    var data = json.data[i],
                    latLng = new google.maps.LatLng(data.latitude, data.longitude); 
                    // Create marker and putting it on the map
                    var marker = new google.maps.Marker({
                        position: latLng,
                        icon: data.category_image,
                        map: map,
                        title: data.title,
                        id: data.id
                    });
                    if(data.category_image == '')
                      marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
                    
                    citybranding_markers.push(marker);
                    //bounds.extends(marker.position);

                    infoBox(map, marker, data);

                    if(data.moderation == 1){
                      marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
                    }
                }
                resetBounds(map, citybranding_markers);
                if(clusterer){
                  mc = new MarkerClusterer(map, citybranding_markers);
                }
             },
             'error': function (error) {
                alert('Cannot read markers - See console for more information');
                console.log (error);
             }             
        });
        return json;
    })();

}


function infoBox(map, marker, data) {
    
    // Attaching a click event to the current marker
    google.maps.event.addListener(marker, "click", function(e) {
        infoWindow.setContent('<div class="infowindowcontent">'+data.title+'</div>');
        infoWindow.open(map, marker);
        panelFocus(data.id);
    });
    google.maps.event.addListener(infoWindow,'closeclick',function(){
        panelFocusReset();
    });

    // Creating a closure to retain the correct data 
    // Pass the current data in the loop into the closure (marker, data)
    (function(marker, data) {
      // Attaching a click event to the current marker
      google.maps.event.addListener(marker, "click", function(e) {
        if(data.state == 0){
          infoWindow.setContent('<div class="infowindowcontent citybranding-warning"><i class="icon-info-sign"></i> '+data.title+'</div>');
        } else {
          infoWindow.setContent('<div class="infowindowcontent">'+data.title+'</div>');
        }
        infoWindow.open(map, marker);
      });
    })(marker, data);
}

// Add a marker to the map and push to the array.
function addMarker(location, map) {
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
  citybranding_markers.push(marker);
}

// Sets the map on all citybranding_markers in the array.
function setAllMap(map) {
  for (var i = 0; i < citybranding_markers.length; i++) {
    citybranding_markers[i].setMap(map);
  }
}

// Removes the citybranding_markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}

// Shows any citybranding_markers currently in the array.
function showMarkers() {
  setAllMap(citybranding_mod_map);
}

// Deletes all citybranding_markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  citybranding_markers = [];
}

function markerBounce(id) {
  var index;
  for (var i=0; i<citybranding_markers.length; i++) {       
    if(citybranding_markers[i].id == id){
      citybranding_mod_map.setCenter( citybranding_markers[i].getPosition() );
      citybranding_markers[i].setAnimation(google.maps.Animation.BOUNCE);
      //google.maps.event.trigger(citybranding_markers[i], 'click');
      break;
    }
  }
}

function markerIdle(id) {
  var index;
  for (var i=0; i<citybranding_markers.length; i++) {       
    if(citybranding_markers[i].id == id){
      citybranding_markers[i].setAnimation(null);
      break;
    }
  }
}

function resetBounds(map, gmarkers) {
  var a = 0;
  bounds = null;
  bounds = new google.maps.LatLngBounds();
  for (var i=0; i<gmarkers.length; i++) {
    if(gmarkers[i].getVisible()){
      a++;
      bounds.extend(gmarkers[i].position);  
    }
  }
  if(a > 0){
    map.fitBounds(bounds);
    var listener = google.maps.event.addListener(map, 'idle', function() { 
      if (map.getZoom() > 16) map.setZoom(16); 
      google.maps.event.removeListener(listener); 
    });
  }
}

function panelFocus(id) {
  jQuery('#citybranding-panel-' + id)[0].scrollIntoView( true );

  //all
  jQuery("[id^=citybranding-panel-]").removeClass('citybranding-focus');
  jQuery("[id^=citybranding-panel-]").addClass('citybranding-not-focus');

  //selected
  jQuery('#citybranding-panel-'+id).removeClass('citybranding-not-focus');
  jQuery('#citybranding-panel-'+id).addClass('citybranding-focus');
  
}

function panelFocusReset() {
  jQuery("[id^=citybranding-panel-]").removeClass('citybranding-not-focus');
  jQuery("[id^=citybranding-panel-]").removeClass('citybranding-focus');
}