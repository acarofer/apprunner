function capitalizeFLetter(string) {
  string = string.toLowerCase();
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function getAllTiendas_() {
  let myHeaders = new Headers();
  let username = 'hnk_admin';
  let password = 'ZOW9Am!#EqCO3x@Ey#';
  //myHeaders.append("Authorization", "Basic " + btoa(username + ":" + password));

  let requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };
  try {
    let response = await fetch('https://heineken.levelstage.com/wp-json/hk/v1/tiendas', requestOptions);
    return await response.json();
  } catch(error) {
    console.log(error);
  }
}

async function getAllTiendas() {
  let myHeaders = new Headers();
  myHeaders.set("Authorization", "Basic aG5rX2FkbWluOlpPVzlBbSEjRXFDTzN4QEV5Iw==");

  let requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };
  try {
    let response = await fetch('https://unmundodecervezas.com/wp-json/hk/v1/tiendas', requestOptions);
    return await response.json();
  } catch(error) {
    console.log(error);
  }
}
