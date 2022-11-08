const nodeBase64 = require('nodejs-base64-converter');
import MarkerClusterer from '@googlemaps/markerclustererplus';
import iconMarkerPng from '../images/pin_32.png';

function getViewportWidth() {
  if(window.innerWidth) {
    return window.innerWidth;
  } else if(document.body && document.body.offsetWidth) {
    return document.body.offsetWidth;
  } else {
    return 0;
  }
}

function getViewportHeight() {
  if(window.innerHeight) {
    return window.innerHeight;
  } else if(document.body && document.body.offsetHeight) {
    return document.body.offsetHeight;
  } else {
    return 0;
  }
}

function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function moveAndResizeShopListInDesktop() {
  let viewportWidth = getViewportWidth();
  let viewportHeight = getViewportHeight();
  let bodyContainer = document.getElementById('hk-body');
  let searchContainer = document.getElementById('hk-search-container');
  let shopListContainer = document.getElementById('hk-shop-list-container');
  let map = document.getElementById('map');
  let khBody = document.getElementById('hk-body');
  let footer = document.getElementById('hk-footer');
  let padding = 32;
  if(viewportWidth >= 1024) {
    shopListContainer.style.height = (viewportHeight - searchContainer.offsetHeight - padding).toString();
    bodyContainer.appendChild(shopListContainer);
    insertAfter(khBody, map);
    insertAfter(map, footer);
  } else {
    insertAfter(searchContainer, map);
    shopListContainer.style.height = 'auto';
    insertAfter(shopListContainer, footer);
  }
}

async function getAllTiendas() {
  let requestOptions = {
    method: 'GET',
  };

  try {
    let response = await fetch('https://heineken.levelstage.com/wp-json/hk/v1/tiendas', requestOptions);
    return await response.json();
  } catch(error) {
    if(error) {
      let response = await fetch('https://unmundodecervezas.com/wp-json/hk/v1/tiendas', requestOptions);
      return await response.json();
    }
  }
}

function setImages() {
  let images = document.querySelectorAll("img");
  images.forEach((image) => {
    let imgsrc = image.getAttribute("src");
    let imagePos = image.style.position;
    if (imgsrc === "") {
      if(imagePos === 'absolute') {
        image.src = '';
      } else {
        image.src = iconMarkerPng;
      }
    }
  });
}

function prepareField(brandField) {
  brandField = brandField.trim();
  if(brandField.includes(";")) {
    return brandField.split(";");
  } else {
    return brandField;
  }
}

function getLat(tienda) {
  return tienda.latitud_longitud.split(",")[0].trim();
}

function getLong(tienda) {
  return tienda.latitud_longitud.split(",")[1].trim();
}

function getInitPromoBrands(json) {
  let brands = [];
  json.forEach(tienda => {
    let brand = prepareField(tienda.marca);
    if(typeof brand === 'string' || brand instanceof String) {
      brands.push(brand);
    } else {
      brand.forEach(brand => {
        brands.push(brand);
      });
    }
  });
  return brands.filter(removeDuplicates);
}

function getPromoBrands(arr) {
  let brands = [];
  arr.forEach(brand => {
    if(brand.includes(';')) {
      let someBrands = brand.split(";");
      someBrands.forEach(brand => {
        brands.push(brand);
      });
    } else {
      brands.push(brand);
    }
  });
  return brands.filter(removeDuplicates);
}

function removeDuplicates(value, index, self) {
  return self.indexOf(value) === index;
}

function showPromoBrands(brands) {
  const list = document.getElementById('hk-brand-list');
  list.innerHTML = '';
  brands.forEach(brand => {
    // create filter buttons for each brand
    let li = document.createElement('li');
    let item = document.createElement('a');
    item.className += 'hk-brand-filter-button';
    li.appendChild(item);
    addColourTextBrand(brand, item);
    item.addEventListener('click', function(e) {
      gtag('event', 'Filtrado', {
        'event_category': 'Marca',
        'event_label': item.textContent,
        'value': ''
      });
    })
    list.appendChild(li);
  });
  // create the all items button
  let li = document.createElement('li');
  li.className += 'hk-brand-filter-button-all-container';
  let item = document.createElement('a');
  item.className += 'hk-brand-filter-button-all';
  item.textContent += 'Borrar selección';
  li.appendChild(item);
  list.appendChild(li);
}

function addColourTextBrand(brand, item) {
  brand = brand.toLowerCase();
  brand = removeAccents(brand);
  switch(brand) {
    case 'hop house':
      item.style.backgroundColor = "transparent";
      item.style.color = "#333333";
      item.style.border = "1px solid #333333";
      item.style.padding = "2px 7px";
      item.textContent += 'Hop House';
      break;
    case 'heineken':
      item.style.backgroundColor = "#005c1f";
      item.style.color = "#fff";
      item.textContent += 'Heineken';
      break;
    case 'el aguila':
      item.style.backgroundColor = "#315470";
      item.style.color = "#fff";
      item.textContent += 'El Águila';
      break;
    case 'desperados':
      item.style.backgroundColor = "#fbd100";
      item.style.color = "#333333";
      item.textContent += 'Desperados';
      break;
    case 'amstel':
      item.style.backgroundColor = "#FF2B00";
      item.style.color = "#fff";
      item.textContent += 'Amstel';
      break;
    case 'la-18-70':
      item.style.backgroundColor = "#424949";
      item.style.color = "#fff";
      item.textContent += '18/70';
      break;
    case 'guinness':
      item.style.backgroundColor = "#F1C761";
      item.style.color = "#000";
      item.textContent += 'Guinness';
      break;
    case 'cruzcampo':
      item.style.backgroundColor = "#AD1E1C";
      item.style.color = "#FFFFFF";
      item.textContent += 'Cruzcampo';
      break;
    case 'ladron de manzanas':
      item.style.backgroundColor = "#F2F2D5";
      item.style.color = "#1A171B";
      item.textContent += 'Ladrón de Manzanas';
      break;
  }
}

function isEmpty(str) {
  return (!str || 0 === str.length);
}

function isString(str) {
  return typeof str === 'string' || str instanceof String;
}

function parseAddress(address) {
  let parseAddress = [];
  let arrayAddress = address.split(";");
  if(!isEmpty(arrayAddress[0])) {
    parseAddress.push(arrayAddress[0].trim());
    parseAddress.push(arrayAddress[1].trim());
    return parseAddress;
  } else {
    parseAddress.push(arrayAddress[1].trim());
    return parseAddress;
  }
}

function cleanList() {
  let container = document.getElementById('hk-shop-container');
  container.innerHTML = '';
}

function removeAccents(string) {
  const accents = {'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'};
  return string.split('').map(char => accents[char] || char).join('').toString();
}

// filter links functions
function filterLinks(element) {
  let shopItems = document.querySelectorAll('.hk-shop-container div.hk-shop-info');
  // get text
  let el = element.textContent;
  let linksPrepared = el.replace(" ", "-");
  linksPrepared = removeAccents(linksPrepared);
  // if all remove all elements
  if(el === 'Borrar selección') {
    // first show all view class
    each('.view', function(e) {
      e.classList.remove('view');
    });
    // no show init animation
    animate(shopItems);
  } else {
    // if not click all remove all elements
    each('.view', function(e) {
      e.classList.remove('view');
    });
    // show animation for current elements
    let currentElements = document.querySelectorAll('.hk-shop-info.' + linksPrepared);
    if(currentElements.length > 1) {
      currentElements.forEach(element => {
        addView(element);
      });
    } else {
      animate(currentElements);
    }
  }
}

function each(el, callback) {
  let allDivs = document.querySelectorAll(el),
    alltoArr = Array.prototype.slice.call(allDivs);
  Array.prototype.forEach.call(alltoArr, function(selector, index) {
    if(callback) {
      return callback(selector);
    }
  });
}

function addView(item) {
  item.classList.add('view');
}

function animate(item) {
  (function show(counter) {
    setTimeout(function() {
      if(item[counter] !== undefined) {
        item[counter].classList.add('view');
      }
      counter++;
      if(counter < item.length) {
        show(counter);
      }
    }, 50);
  })(0);
}

function animateAndFilter(items) {
  animate(items);
  // filter on click
  each('.hk-brand-list li a', function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      filterLinks(el);
    });
  });
}

function addClass(element, name) {
  let i, arr1, arr2;
  arr1 = element.className.split(" ");
  arr2 = name.split(" ");
  for(i = 0; i < arr2.length; i++) {
    if(arr1.indexOf(arr2[i]) === -1) {
      element.className += " " + arr2[i];
    }
  }
}

function removeClass(element, name) {
  let i, arr1, arr2;
  arr1 = element.className.split(" ");
  arr2 = name.split(" ");
  for(i = 0; i < arr2.length; i++) {
    while(arr1.indexOf(arr2[i]) > -1) {
      arr1.splice(arr1.indexOf(arr2[i]), 1);
    }
  }
  element.className = arr1.join(" ");
}

// calculate distance functions
function getUserPosition() {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(returnPosition);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function returnPosition(position) {
  console.log(position);
  return position;
}

function setUserCurrentPosition(locationButton, map) {
  //map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          // infoWindow.setPosition(pos);
          // infoWindow.setContent("Location found.");
          // infoWindow.open(map);
          map.setCenter(pos);
          map.setZoom(13);
          return pos;
        },
        () => {
          handleLocationError(true, map.getCenter());
        }, {timeout:10000}
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, map.getCenter());
    }
  });
}

function handleLocationError(browserHasGeolocation, pos) {
  console.log(browserHasGeolocation ? "Error: The Geolocation service failed. Position: " + pos : "Error: Your browser doesn't support geolocation.");
  let span = document.getElementById('hk-info-no-location');
  span.textContent = 'Lo sentimos, pero no ha sido posible determinar su ubicación.'
}

function rad(x) {
  return x * Math.PI / 180;
}

function getDistance(p1, p2) {
  let R = 6378137; // Earth’s mean radius in meter
  let dLat = rad(p2.lat() - p1.lat());
  let dLong = rad(p2.lng() - p1.lng());
  let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c;
  let km = d / 1000;
  return km.toFixed(2); // returns the distance in meter
}

function getCoordinates(item) {
  let coordinates = [];
  let text = item.textContent;
  let lat = text.split(",")[0].trim();
  let lng = text.split(",")[1].trim();
  coordinates.push(lat, lng);
  return coordinates;
}

function addCoordinates(map, index) {
  let coordinateElement = document.getElementsByClassName('hk-shop-info-coordinates-' + index)[0];
  let coordinates = getCoordinates(coordinateElement);
  let parent = coordinateElement.parentNode;
  parent.addEventListener('click', function(){
    map.setCenter({lat: parseFloat(coordinates[0]), lng: parseFloat(coordinates[1])});
    map.setZoom(17);
  });
}

function showShopListFromData(index, marker) {
  // create containers
  let listContainer = document.getElementById('hk-shop-list-container');
  listContainer.style.padding = '1rem';
  let mainContainer = document.getElementById('hk-shop-container');
  let divShop = document.createElement('div');
  divShop.className += 'hk-shop-info view';
  let divHeader = document.createElement('div');
  divHeader.className += 'hk-shop-info-header';
  let divShopInfo = document.createElement('div');
  divShopInfo.className += 'hk-shop-info-shop-container';
  let divBrands = document.createElement('div');
  divBrands.className += 'hk-shop-info-brand-container';

  // create elements
  let shopName = document.createElement('h3');
  shopName.className += 'hk-shop-info-shopname';
  let distance = document.createElement('span');
  distance.className += 'hk-shop-info-distance';
  distance.className += ' hk-shop-info-distance-' + index;
  let getDirections = document.createElement('a');
  getDirections.className += 'hk-shop-info-getdirections';
  getDirections.setAttribute('target', '_blank');
  getDirections.textContent += 'Cómo llegar';
  getDirections.addEventListener('click', function(e) {
    gtag('event', 'Click en Cómo llegar', {
      'event_category': 'Cómo llegar',
      'event_label': marker.customInfo.title + marker.customInfo.direccion,
      'value': ''
    });
  })
  let promo = document.createElement('ul');
  promo.textContent += 'Promociones disponibles:';
  promo.className += 'hk-shop-info-promo';
  let mainAddress = document.createElement('p');
  mainAddress.className += 'hk-shop-info-address';
  let completeAddress = document.createElement('p');
  completeAddress.className += 'hk-shop-info-complete-address';
  let coordinates = document.createElement('span');
  coordinates.className += 'hk-shop-info-coordinates-' + index;
  coordinates.style.display = 'none';


  // set info to each element
  shopName.textContent += marker.customInfo.title;
  getDirections.href = marker.customInfo.direccion_en_maps;
  coordinates.textContent += marker.customInfo.latitud_longitud;
  let promoField = prepareField(marker.customInfo.nombre_de_la_promocion);
  let brandField = prepareField(marker.customInfo.marca);
  if(isString(brandField)) {
    let brand = document.createElement('span');
    brand.textContent += marker.customInfo.marca;
    // todo create function por prepare string classes
    // classes
    let stringBrand = marker.customInfo.marca.replace(" ", "-").toLowerCase();
    stringBrand = removeAccents(stringBrand);
    divShop.className += ' ' + stringBrand;
    brand.className += 'hk-shop-info-brand hk-shop-info-brand-' + stringBrand;
    divBrands.appendChild(brand);
    // promo
    let promoElement = document.createElement('li');
    let spanBrand = document.createElement('span');
    let spanPromo = document.createElement('span');
    spanBrand.textContent +=  marker.customInfo.marca + ' - ';
    spanBrand.className += 'hk-shop-promo-' + stringBrand;
    spanPromo.textContent += marker.customInfo.nombre_de_la_promocion;
    promoElement.appendChild(spanBrand);
    promoElement.appendChild(spanPromo);
    promo.appendChild(promoElement);
  } else {
    brandField.forEach((brand, index) => {
      let brandElement = document.createElement('span');
      brandElement.textContent += brand;
      // promo
      let promoElement = document.createElement('li');
      let spanBrand = document.createElement('span');
      let spanPromo = document.createElement('span');
      spanBrand.textContent +=  brand + ' - ';
      spanPromo.textContent += promoField[index];
      promoElement.appendChild(spanBrand);
      promoElement.appendChild(spanPromo);
      promo.appendChild(promoElement);
      // classes
      brand = brand.replace(" ", "-").toLowerCase();
      brand = removeAccents(brand);
      spanBrand.className += 'hk-shop-promo-' + brand;
      divShop.className += ' ' + brand;
      brandElement.className += 'hk-shop-info-brand hk-shop-info-brand-' + brand;
      divBrands.appendChild(brandElement);
    });
  }
  let address = parseAddress(marker.customInfo.direccion);
  if(address.length > 1) {
    completeAddress.textContent += address[1];
    mainAddress.textContent += address[0];
  } else {
    completeAddress.textContent += address[0];
    mainAddress.textContent += '';
  }

  // append elements
  divShopInfo.appendChild(shopName);
  divShopInfo.appendChild(distance);
  divHeader.appendChild(divBrands);
  divHeader.appendChild(promo);
  divHeader.appendChild(divShopInfo);
  divHeader.appendChild(mainAddress);
  divHeader.appendChild(completeAddress);
  divShop.appendChild(divHeader);
  divShop.appendChild(getDirections);
  divShop.appendChild(coordinates);
  mainContainer.appendChild(divShop);
}

// Listen for orientation changes
window.addEventListener("orientationchange", moveAndResizeShopListInDesktop, false);

window.addEventListener('resize', moveAndResizeShopListInDesktop);

const styles = [{
  width: 30,
  height: 30,
  className: "custom-clustericon-1",
},
  {
    width: 40,
    height: 40,
    className: "custom-clustericon-2",
  },
  {
    width: 50,
    height: 50,
    className: "custom-clustericon-3",
  },
];

let map;

async function initMap() {
  let jsondata = await getAllTiendas();

  //console.log(jsondata);

  // get the brands and create the filters
  let brands = getInitPromoBrands(jsondata);
  showPromoBrands(brands);

  const madrid = new google.maps.LatLng(40.4166802, -3.7055517);
  const mapOptions = {
    center: madrid,
    zoom: 5.2,
  };

  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  const divShop = document.getElementById('shop-container');

  let clusterMarkers = [];

  jsondata.forEach((tienda, index) => {
    // move the list beyond the map in mobile
    // moveShopListInMobile();
    moveAndResizeShopListInDesktop();
    // show complete list
    // showShopListFromData(index, tienda);
    // add coordinates
    // addCoordinates(map, index);
    // Prepare address for infoWindow
    let address = parseAddress(tienda.direccion);
    let mainAddress;
    let completeAddress;
    if(address.length > 1) {
      mainAddress = address[0];
      completeAddress = address[1];
    } else {
      mainAddress = '';
      completeAddress = address[0];
    }
    // add markers to the map
    const iconMarker = iconMarkerPng;
    let marker = new google.maps.Marker({
      position: new google.maps.LatLng(getLat(tienda), getLong(tienda)),
      map: map,
      title: tienda.title,
      icon: iconMarker,
      customInfo: tienda,
    });
    let infoWindow = new google.maps.InfoWindow({
      content: '<div class="hk-infowindow"><h3>' + tienda.title + '</h3><p>' + mainAddress + '</p><p>' + completeAddress + '</p></div>',
      maxWidth: 200,
    });
    // This event expects a click on a marker
    // When this event is fired the Info Window is opened.
    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
    // Event that closes the Info Window with a click on the map
    google.maps.event.addListener(map, 'click', function() {
      infoWindow.close();
    });
    clusterMarkers.push(marker);
  });

  // group markers into clusters
  let markerClusterer = new MarkerClusterer(map, clusterMarkers, {
    styles: styles,
    clusterClass: "custom-clustericon",
  });


  map.addListener("bounds_changed", () => {
    let brandsFromMarkers = [];
    const place = map.getCenter();
    let bounds = map.getBounds();
    // clean previous list, if exists
    cleanList();
    // get each marker from the clusterMarkers
    clusterMarkers.forEach((marker, index) => {
      if(bounds.contains(marker.getPosition())) {
        // get the brands
        brandsFromMarkers.push(marker.customInfo.marca);
        let json = null;
        // show the list
        showShopListFromData(index, marker);
        // get and add distance to each element
        let distance = getDistance(marker.getPosition(), place);
        document.getElementsByClassName('hk-shop-info-distance-' + index)[0].textContent = distance + ' Km';
        // clean text distance when it´s 0
        if(document.getElementsByClassName('hk-shop-info-distance-' + index)[0].textContent === '0.00 Km') {
          document.getElementsByClassName('hk-shop-info-distance-' + index)[0].textContent = '';
        }
        // add coordinates
        addCoordinates(map, index);
        setTimeout(() => setImages(), 1500);
      }
    });
    // prepare and show the brands filters
    brandsFromMarkers = getPromoBrands(brandsFromMarkers);
    showPromoBrands(brandsFromMarkers);
    let shopItems = document.querySelectorAll('.hk-shop-container div.hk-shop-info');
    animateAndFilter(shopItems);
  });

  // create autocomplete Maps search
  const input = document.getElementById("hk-search-input");
  let options = {
    types: ['geocode'],
    componentRestrictions: {country: "es"}
  };

  let autocomplete = new google.maps.places.Autocomplete(input, options);
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    gtag('event', 'Introducir CP o Dirección', {
      'event_category': 'CP - Dirección',
      'event_label': nodeBase64.encode(place.formatted_address),
      'value': ''
    });
    // If the place has a geometry, then present it on a map.
    if(place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport, 120);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
  });

  const locationButton = document.getElementById('btn-location');
  let userCurrentPosition = setUserCurrentPosition(locationButton, map);
  let shopItems = document.querySelectorAll('.hk-shop-container div.hk-shop-info');
  animateAndFilter(shopItems);
}
setTimeout(() => setImages(), 3000);
// for webpack
window.initMap = initMap;
