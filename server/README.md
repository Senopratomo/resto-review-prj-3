# Local Development API Server

Updated from Sails v0.12 to [Sails v1](https://sailsjs.com/) by [Francesc Busquets](mailto:francesc@gmail.com)

### Main changes introduced

- Generated from scratch with [sails-generate](https://github.com/balderdashy/sails-generate)

- Created custom models for "restaurants" and "reviews" in `api/models`

- Created a simple API test suite in `assets/test`

- Created two scripts (`utils/generate-restaurants.js` and `utils/generate-reviews.js`), useful for generating the restaurants API test data. To reset the database at its original state, just stop Sails (if running) and launch:

  ```
  npm run reset-db
  ```

### Startup

The steps to reproduce to launch the API server are:
Install Sails v1 [globally](https://sailsjs.com/get-started):
```
npm install -g sails
```
Install the NPM dependencies:
```
npm install
```
Launch Sails in development mode:
```
sails lift
```

To launch Sails in production mode, use:
```
npm run start
```

In both cases, the API test suite will be available at:
```
http://localhost:1337/test
```

Notice that the `PUT` method has been replaced by `PATCH`, as [proposed](https://sailsjs.com/documentation/reference/blueprint-api/update) by Sails v1.

---


Original README follows (it must be updated!):

---

## Usage
#### Get Restaurants
```
curl "http://localhost:1337/restaurants"
```
#### Get Restaurants by id
````
curl "http://localhost:1337/restaurants/{3}"
````

## Architecture
Local server
- Node.js
- Sails.js

## Contributors

- [Brandy Lee Camacho - Technical Project Manager](mailto:brandy.camacho@udacity.com)
- [David Harris - Web Services Lead](mailto:david.harris@udacity.com)
- [Omar Albeik - Frontend engineer](mailto:omaralbeik@gmail.com)

## Getting Started

### Development local API Server
_Location of server = /server_
Server depends on [node.js LTS Version: v6.11.2 ](https://nodejs.org/en/download/), [npm](https://www.npmjs.com/get-npm), and [sails.js](http://sailsjs.com/)
Please make sure you have these installed before proceeding forward.

Great, you are ready to proceed forward; awesome!

Let's start with running commands in your terminal, known as command line interface (CLI)

###### Install project dependancies
```Install project dependancies
# npm i
```
###### Install Sails.js globally
```Install sails global
# npm i sails -g
```
###### Start the server
```Start server
# node server
```
### You should now have access to your API server environment
debug: Environment : development
debug: Port        : 1337


## Endpoints

### GET Endpoints

#### Get all restaurants
```
http://localhost:1337/restaurants/
```

#### Get favorite restaurants
```
http://localhost:1337/restaurants/?is_favorite=true
```

#### Get a restaurant by id
```
http://localhost:1337/restaurants/<restaurant_id>
```

#### Get all reviews for a restaurant
```
http://localhost:1337/reviews/?restaurant_id=<restaurant_id>
```

#### Get all restaurant reviews
```
http://localhost:1337/reviews/
```

#### Get a restaurant review by id
```
http://localhost:1337/reviews/<review_id>
```


### POST Endpoints

#### Create a new restaurant review
```
http://localhost:1337/reviews/
```

###### Parameters
```
{
    "restaurant_id": <restaurant_id>,
    "name": <reviewer_name>,
    "rating": <rating>,
    "comments": <comment_text>
}
```


### PUT Endpoints

#### Favorite a restaurant
```
http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=true
```

#### Unfavorite a restaurant
```
http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=false
```

#### Update a restaurant review
```
http://localhost:1337/reviews/<review_id>
```

###### Parameters
```
{
    "name": <reviewer_name>,
    "rating": <rating>,
    "comments": <comment_text>
}
```


### DELETE Endpoints

#### Delete a restaurant review
```
http://localhost:1337/reviews/<review_id>
```


If you find a bug in the source code or a mistake in the documentation, you can help us by
submitting an issue to our [Waffle Dashboard](https://waffle.io/udacity/mwnd-issues). Even better you can submit a Pull Request with a fix :)