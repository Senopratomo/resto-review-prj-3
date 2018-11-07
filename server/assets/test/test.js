
// Set listeners when all DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {

  const API_ROOT = 'http://localhost:1337';

  // Response body area
  const resp = document.querySelector('#response');
  resp.innerHTML = '';
  const log = text => {
    const textObj = /^[[{]/.test(text) ? JSON.parse(text) : null;
    resp.innerHTML = textObj ? JSON.stringify(textObj, null, 1) : text;
    console.log(textObj || text);
  };

  // Get all restaurants
  const gar = document.querySelector('#GAR');
  gar.addEventListener('submit', ev => {
    const url = `${API_ROOT}/restaurants/`;
    fetch(url, { method: 'GET' })
      .then(response => response.text())
      .then(result => log(result))
      .catch(err => log(`ERROR sending GET request ${url}\n${err}`));
    ev.preventDefault();
  });

  // Get favorite restaurants
  const gfr = document.querySelector('#GFR');
  gfr.addEventListener('submit', ev => {
    const url = `${API_ROOT}/restaurants/?is_favorite=true`;
    fetch(url, { method: 'GET' })
      .then(response => response.text())
      .then(result => log(result))
      .catch(err => log(`ERROR sending GET request ${url}\n${err}`));
    ev.preventDefault();
  });

  // Get restaurant by id
  const grbid = document.querySelector('#GRBID');
  grbid.addEventListener('submit', ev => {
    const url = `${API_ROOT}/restaurants/${grbid.querySelector('#restaurant_id').value}`;
    fetch(url, { method: 'GET' })
      .then(response => response.text())
      .then(result => log(result))
      .catch(err => log(`ERROR sending GET request ${url}\n${err}`));
    ev.preventDefault();
  });

  // Get all reviews
  const garv = document.querySelector('#GARV');
  garv.addEventListener('submit', ev => {
    const url = `${API_ROOT}/reviews/`;
    fetch(url, { method: 'GET' })
      .then(response => response.text())
      .then(result => log(result))
      .catch(err => log(`ERROR sending GET request ${url}\n${err}`));
    ev.preventDefault();
  });

  // Get all reviews of a restaurant
  const garvid = document.querySelector('#GARVID');
  garvid.addEventListener('submit', ev => {
    const url = `${API_ROOT}/reviews/?restaurant_id=${garvid.querySelector('#restaurant_id').value}`;
    fetch(url, { method: 'GET' })
      .then(response => response.text())
      .then(result => log(result))
      .catch(err => log(`ERROR sending GET request ${url}\n${err}`));
    ev.preventDefault();
  });

  // Get review by id
  const grvbid = document.querySelector('#GRVBID');
  grvbid.addEventListener('submit', ev => {
    const url = `${API_ROOT}/reviews/${grvbid.querySelector('#review_id').value}`;
    fetch(url, { method: 'GET' })
      .then(response => response.text())
      .then(result => log(result))
      .catch(err => log(`ERROR sending GET request ${url}\n${err}`));
    ev.preventDefault();
  });

  // Add review
  const addrv = document.querySelector('#ADDRV');
  addrv.addEventListener('submit', ev => {
    const url = `${API_ROOT}/reviews/`;
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        restaurant_id: addrv.querySelector('#restaurant_id').value,
        name: addrv.querySelector('#name').value,
        rating: addrv.querySelector('#rating').value,
        comments: addrv.querySelector('#comments').value,
      })
    })
      .then(response => response.text())
      .then(result => log(result))
      .catch(err => log(`ERROR sending POST request ${url}\n${err}`));
    ev.preventDefault();
  });

  // Changed PUT to PATCH because:
  // Using `PUT` to update a record is deprecated in Sails 1.0.  Use `PATCH` instead!

  // Favorite / Unfavorite restaurant by id
  const favbid = document.querySelector('#FAVBID');
  favbid.addEventListener('submit', ev => {
    const url = `${API_ROOT}/restaurants/${favbid.querySelector('#restaurant_id').value}/?is_favorite=${favbid.querySelector('#is_favorite').checked ? 'true' : 'false'}`;
    fetch(url, { method: 'PATCH' })
      .then(response => response.text())
      .then(result => log(result))
      .catch(err => log(`ERROR sending PATCH request ${url}\n${err}`));
    ev.preventDefault();
  });

  // Update review by id
  const updrv = document.querySelector('#UPDRV');
  updrv.addEventListener('submit', ev => {
    const url = `${API_ROOT}/reviews/${updrv.querySelector('#review_id').value}`;
    fetch(url, {
      method: 'PATCH',
      body: JSON.stringify({
        name: updrv.querySelector('#name').value,
        rating: updrv.querySelector('#rating').value,
        comments: updrv.querySelector('#comments').value,
      })
    })
      .then(response => response.text())
      .then(result => log(result))
      .catch(err => log(`ERROR sending PATCH request ${url}\n${err}`));
    ev.preventDefault();
  });

  // Delete review by id
  const delrv = document.querySelector('#DELRV');
  delrv.addEventListener('submit', ev => {
    const url = `${API_ROOT}/reviews/${delrv.querySelector('#review_id').value}`;
    fetch(url, { method: 'DELETE' })
      .then(response => response.text())
      .then(result => log(result))
      .catch(err => log(`ERROR sending DELETE request ${url}\n${err}`));
    ev.preventDefault();
  });

});
