/**
 * Common database helper functions.
 */

let dbPromise;
const port = 1337; // Change this to your server port

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    return `http://localhost:${port}/restaurants`;
  }

  static get DATABASE_URL_REVIEWS() {
    return `http://localhost:${port}/reviews?restaurant_id=`;
  }
  /**
   * Open a IDB Database
   * **/
  static openDatabase() {
    return idb.open('resto' , 1  , function(upgradeDb) {
      const restoStore = upgradeDb.createObjectStore('resto' ,{keyPath: 'id'});
      restoStore.createIndex("by-id","id");
      const reviewStore = upgradeDb.createObjectStore('review' ,{keyPath: 'id'});
      reviewStore.createIndex("restaurant_id", "restaurant_id");
      upgradeDb.createObjectStore('reviewOffline', {
        keyPath: "updatedAt"
      });
    });
  }
  /*
   * Save data to IDB database
  */
  static saveToIDB(data, storeToSaveInto = 'resto') {
    return DBHelper.openDatabase().then(db => {
      if (!db) {
        return;
      }
      switch (storeToSaveInto) {
        case 'review': {
          const tx = db.transaction('review', "readwrite");
          const store = tx.objectStore('review');
          store.put(data);
          return tx.complete;
        }
        case 'reviewOffline': {
          const tx = db.transaction('reviewOffline', "readwrite");
          const store = tx.objectStore('reviewOffline');
          store.put(data);
          return tx.complete;
        }
        default: {
          const tx = db.transaction('resto', "readwrite");
          const store = tx.objectStore('resto');
          data.forEach(restaurant => {
            store.put(restaurant);
          });
          return tx.complete;
        }
      }
    });
  }

  /**
   *
   * Show cached reviews stored in IDB
   *
   */
  static fetchCachedReviews(id) {
    return DBHelper.openDatabase().then(db => {
      if (!db) {
        return;
      }
      const tx = db.transaction('review', "readonly");
      const store = tx.objectStore('review').index("restaurant_id");

      return store.getAll(id);
    });
  }

  /**
   * Fetch all reviews.
   */
  static fetchReviews(id, callback) {
    if(!navigator.onLine) {
      DBHelper.fetchCachedReviews(id).then(function(data) {
        // if we have data from cache , serve the object from cache.
        if (data.length > 0) {
          return callback(null, data);
        }
      });
    }
    // Populate the cache by fetching restaurants from the server.
    fetch(`${DBHelper.DATABASE_URL_REVIEWS}${id}`).then(res => {
      console.log('res fetched is: ', res);
      return res.json()})
        .then(data => {
          DBHelper.openDatabase().then(function(db){
            if(!db) return db;
            console.log('data fetched is: ', data);
            const tx = db.transaction('review' , 'readwrite');
            const store = tx.objectStore('review');
            data.forEach(review => store.put(review));
            // limit the data for 20
            store.openCursor(null , 'prev').then(function(cursor){
              return cursor.advance(20);
            }).then(function deleteRest(cursor){
              if(!cursor) return;
              cursor.delete();
              return cursor.continue().then(deleteRest);
            });
          });
          return callback(null,data);
        })
        .catch(err => {
          return callback(err , null)
        });

  }

  static addReview(data, callback) {
    return fetch(`http://localhost:${port}/reviews`, {
      body: JSON.stringify(data),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: "POST"
    }).then(res => {
      res.json().then(data => {
        DBHelper.saveToIDB(data, 'review');
        return data;
      })
      callback(null);
    })
    .catch(err => {
      data["updatedAt"] = new Date().getTime();
      data["createdAt"] = new Date().getTime();

      DBHelper.saveToIDB(data, 'reviewOffline');
    });
  }

  static setFavorite(resto_id, fav) {
    dbPromise = DBHelper.openDatabase();
    fetch(`http://localhost:1337/restaurants/${resto_id}/?is_favorite=${fav}`, {method: 'PUT'}
      ).then(() => {
        console.log(`resto ${resto_id} fav status changed to ${fav}`);
        this.openDatabase()
            .then(db => {
                const tx = db.transaction('resto', 'readwrite');
                const restaurantsStore = tx.objectStore('resto');
                restaurantsStore.get(resto_id)
                    .then(restaurant => {
                        restaurant.is_favorite = fav;
                        restaurantsStore.put(restaurant);
                    });
            })
    }).catch(err => console.log(err));
  }

  /**
   * Show cached restaurants stored in IDB
   */
  static getDataFromCache(){
    dbPromise = DBHelper.openDatabase();
    return dbPromise.then(function(db){
    // For first time of the page loading, don't need to go to idb
        if(!db) return;
        const tx = db.transaction('resto');
        const store = tx.objectStore('resto');

        return store.getAll();
    });
  }
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    DBHelper.getDataFromCache().then(function(data){
        // if we have data from cache , serve the object from cache.
        if(data.length > 0){
          return callback(null , data);
        }
        // Populate the cache by fetching restaurants from the server.
        fetch(DBHelper.DATABASE_URL)
            .then(res => {
              console.log('res fetched is: ', res);
              return res.json()})
            .then(data => {
              dbPromise.then(function(db){
                if(!db) return db;
                console.log('data fetched is: ', data);
                const tx = db.transaction('resto' , 'readwrite');
                const store = tx.objectStore('resto');

                data.forEach(restaurant => store.put(restaurant));

                // limit the data for 20
                store.openCursor(null , 'prev').then(function(cursor){
                  return cursor.advance(20);
                })
                .then(function deleteRest(cursor){
                  if(!cursor) return;
                  cursor.delete();
                  return cursor.continue().then(deleteRest);
                });
              });
              return callback(null,data);
            })
            .catch(err => {
              return callback(err , null)
            });
      });
  }


  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Send offline review data when online
   */
  static sendOfflineDataOnceOnline(offline_obj) {
    console.log('Offline OBJ', offline_obj);
    localStorage.setItem('data', JSON.stringify(offline_obj.data));
    console.log(`Local Storage: ${offline_obj.object_type} stored`);
    window.addEventListener('online', (event) => {
      console.log('Browser: Online again!');
      let data = JSON.parse(localStorage.getItem('data'));
      console.log('updating and cleaning ui');
      [...document.querySelectorAll(".reviews_offline")].forEach(el => {
        el.classList.remove("reviews_offline");
        el.querySelector(".offline_label").remove();
      });
      if (data !== null) {
        if (offline_obj.name === 'addReview') {
          DBHelper.addReview(offline_obj.data);
        }
        console.log('LocalState: data sent to api');
        localStorage.removeItem('data');
        console.log(`Local Storage: ${offline_obj.object_type} removed`);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.webp`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
