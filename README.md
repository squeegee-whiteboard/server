# Squeegee Whiteboard - Server

The server for the Squeegee Whiteboard application

[![Build Status](https://travis-ci.org/squeegee-whiteboard/server.svg?branch=master)](https://travis-ci.org/squeegee-whiteboard/server)

## Usage

To start the server: `npm start`.

To lint the code: `npm run lint`.

To start the dev server (auto reload on code change): `npm run dev`.

### Debug Messages

To insert debug messages, use the debug package: <https://github.com/visionmedia/debug>.
Essentially:

```javascript
const Debug = require('debug');

const debug = Debug('your:tag:here');

// ...

debug('debug message');
```

And then run the dev server (or regular server, using `npm start`) with:
`DEBUG=your:tag:here npm run dev` to get only debug messages from that specific tag.
Alternatively, to get debug messages from all tags use: `DEBUG=* npm run dev`. For more
info, see the above link to the debug project on github.




# REST API Documentation

Currently uses port `3000` by default.

## Normal Endpoints
* POST - /registerUser

## JWT Endpoints
* POST - /loginUser
* PATCH - /updateUsername

# Normal Endpoints
These endpoints don't require an auth token, but will return one.
It should be stored in the browser's local storage.
Example using axios (common js request library):
```javascript
axios.post('http://localhost:3000/loginUser', {
        email,
        password,
    }).then((response) => {
        localStorage.setItem('JWT', response.data.token);
    });
```

## POST - /registerUser
Registers a new user.
Email must be unique.
Returns your auth token on success.

### Input
POST request to the endpoint url.

Ex: `localhost:3000/registerUser`

JSON object in the form:
```javascript
{
	"email": <email>,
	"password": <password in plaintext>,
	"username": <username>
}
```
Ex:
```javascript
{
	"email": "joel@squeegee.xyz",
	"password": "hunter2",
	"username": "cool joe"
}
```

### Output
JSON object in the form:
```javascript
{
    "success": true,
    "token": <json auth token>,
    "message": <success message>
}
```
Ex:
```javascript
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicGFzc3dv",
    "message": "User successfully created."
}
```

### On Error
JSON object in the form:
```javascript
{
    "success": false,
    "message": <failure message>
}
```
```javascript
{
    "success": false,
    "message": "Email is already in use."
}
```

## POST - /loginUser
Logs the user in.
Returns your auth token on success.

### Input
POST request to the endpoint url.

Ex: `localhost:3000/loginUser`

JSON object in the form:
```javascript
{
	"email": <email>,
	"password": <password in plaintext>
}
```
Ex:
```javascript
{
	"email": "joel@squeegee.xyz",
	"password": "hunter2"
}
```

### Output
JSON object in the form:
```javascript
{
    "success": true,
    "token": <json auth token>,
    "message": <success message>
}
```
Ex:
```javascript
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicGFzc3dv",
    "message": "User successfully created."
}
```

### On Error
JSON object in the form:
```javascript
{
    "success": false,
    "message": <failure message>
}
```
```javascript
{
    "success": false,
    "message": "Incorrect email or password."
}
```

# JWT Endpoints
These endpoints require the auth token acquired through register or login.
Auth token is included in the request headers.
Ex: ```Authorization```  ```JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicGFzc3dv```

Example using axios (common js request library):
```javascript
const authToken = localStorage.getItem('JWT');
await axios.get('http://localhost:3000/updateUsername', {
          params: {
            username: newUsername,
          },
          headers: { Authorization: `JWT ${authToken}` },
        });
```

## PATCH - /updateUsername
Changes the user's name.

### Input
PATCH request to the endpoint url.

Ex: `localhost:3000/updateUsername`

JSON object in the form:
```javascript
{
	"username": <username you want to change to>
}
```
Ex:
```javascript
{
	"username":
}
```

### Output
JSON object in the form:
```javascript
{
    "success": true,
    "message": <success message>
}
```
Ex:
```javascript
{
    "success": true,
    "message": "Username updated."
}
```

### On Error
JSON object in the form:
```javascript
{
    "success": false,
    "message": <failure message>
}
```
```javascript
{
    "success": false,
    "message": "Invalid auth token."
}
```