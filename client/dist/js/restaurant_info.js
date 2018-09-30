let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt =  restaurant.alternative_text;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fetchReviews();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

const fetchReviews = () => {
  const restaurantID = parseInt(getParameterByName("id"));
  if (!restaurantID) {
    return;
  }

  DBHelper.fetchReviews(restaurantID, (err, reviews) => {
    self.reviews = reviews;
    if (err || !reviews) {
      return;
    }

    fillReviewsHTML(reviews);
  });
};


/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  if (!navigator.onLine) {
    const connection_status = document.createElement('p');
    connection_status.classList.add('offline_label')
      connection_status.innerHTML = "Offline"
      li.classList.add("reviews_offline")
      li.appendChild(connection_status);
  }

  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const cDate = document.createElement('p');
  const createdAt = new Date(review.createdAt).toLocaleDateString("en-US");
  cDate.innerHTML = `Created: ${createdAt}`;
  li.appendChild(cDate);

  const uDate = document.createElement('p');
  const updatedAt = new Date(review.createdAt).toLocaleDateString("en-US");
  uDate.innerHTML = `Updated: ${updatedAt}`;
  li.appendChild(uDate);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.className = 'breadcrumb';
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
}

/**
* Review submission form
*/

const reviewForm = document.querySelector('#add-review-form');
reviewForm.addEventListener('submit', e => {
    e.preventDefault();
    const rating = reviewForm.querySelector('#rating');

    const reviewObj = {
        restaurant_id: parseInt(getParameterByName('id')),
        name: reviewForm.querySelector('#name').value,
        rating: rating.options[rating.selectedIndex].value,
        comments: reviewForm.querySelector('#review-comment').value,
    }

    DBHelper.addReview(reviewObj, (error) => {
        if (error) {
            console.log(error);
        }
    }).then(data => {
        const reviewList = document.querySelector('#reviews-list');
        reviewObj.createdAt = + new Date();
        reviewObj.updatedAt = + new Date();
        reviewList.appendChild(createReviewHTML(reviewObj));
        reviewForm.reset();
    }).catch(e => console.log(e))
});

window.addEventListener('online', e => {
    e.preventDefault();
    DBHelper.openDatabase().then(async db => {
      if (!db) {
        return;
      }
      const tx = db.transaction('reviewOffline', "readwrite");
      const store = tx.objectStore('reviewOffline');
      const req = await store.openCursor();

      const onSuccess = function(event) {
        const cursor = this.result;
        if (cursor) {
          const newReviewObj = {
            restaurant_id: parseInt(cursor.value.restaurant_id),
            name: cursor.value.name,
            rating: cursor.value.rating,
            comments: cursor.value.comments,
          }
          // POST cursor value
          fetch(
              `http://localhost:1337/reviews`,
              {
                method: 'POST',
                body: JSON.stringify(newReviewObj),
                headers: {
                  'content-type': 'application/json'
                }
              }
           ).then(res => res.json).catch(err => console.log(err))
          // PUT into the other objectStore
          DBHelper.saveToIDB(newReviewObj, 'review');

          // DELETE item from idb
          store.delete(cursor.key);
          cursor.continue();
        } else {
          console.log(`No entries in: reviewOffline`);
        }
      }
      if(req) {
        req._request.onsuccess = onSuccess;
        req._request.onsuccess();
      }

    })
});

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
