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
* POST - /auth/register
* POST - /auth/login

## JWT Endpoints
* PATCH - /changeUser/username
* PATCH - /changeUser/email
* PATCH - /changeUser/password
* GET - /changeUser/info

* POST - /changeBoard/create
* PATCH - /changeBoard/name
* PUT - /changeBoard/addMember
* DELETE - /changeBoard/delete

* GET - /boardInfo/owned
* GET - /boardInfo/member

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

## POST - /auth/register
Registers a new user.
Email must be unique.
Returns your auth token on success.

### Input
POST request to the endpoint url.

Ex: `localhost:3000/auth/register`

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
    "token": "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicGFzc3dv",
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

## POST - /auth/login
Logs the user in.
Returns your auth token on success.

### Input
POST request to the endpoint url.

Ex: `localhost:3000/auth/login`

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
    "token": "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicGFzc3dv",
    "message": "User logged in."
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

## PATCH - /changeUser/username
Changes the user's name.
Requires a user's auth token in the message header.

### Input
PATCH request to the endpoint url.

Ex: `localhost:3000/changeUser/username`

JSON object in the form:
```javascript
{
	"username": <username you want to change to>
}
```
Ex:
```javascript
{
	"username": "joel"
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

## PATCH - /changeUser/email
Changes the user's email.
Requires a user's auth token in the message header.

### Input
PATCH request to the endpoint url.

Ex: `localhost:3000/changeUser/email`

JSON object in the form:
```javascript
{
	"email": <email you want to change to>
}
```
Ex:
```javascript
{
	"email": "joel@squeegee.xyz"
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
    "message": "Email updated."
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

## PATCH - /changeUser/password
Changes the user's password.
Requires a user's auth token in the message header.

### Input
PATCH request to the endpoint url.

Ex: `localhost:3000/changeUser/password`

JSON object in the form:
```javascript
{
    "oldPassword": <password changing from>,
    "newPassword": <password changing to>
}
```
Ex:
```javascript
{
	"oldPassword": "hunter2",
    "newPassword": "letmein"
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
    "message": "Password updated."
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
    "message": "Failed to update password."
}
```

## GET - /changeUser/info
Gets the logged in user's username and email address.
Does not get password, since passwords aren't even stored as plaintext.

### Input
GET request to the endpoint url.

Ex: `localhost:3000/changeUser/info'

### Output
JSON object in the form:
```javascript
{
    "success": true,
    "message": <success message>,
    "username": <user's username>,
    "email": <user's email>
}
```
Ex:
```javascript
{
    "success": true,
    "message": "Successfully retrieved user info.",
    "username": "JollyJoel",
    "email": "joel@email.com"
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
    "message": "Failed to retrieve owned boards"
}
```


## POST - /changeBoard/create
Creates a board and adds the creating user as an owner.

### Input
POST request to the endpoint url.

Ex: `localhost:3000/changeBoard/create`

JSON object in the form:
```javascript
{
    "name": <board name>
}
```
Ex:
```javascript
{
	"name": "ex name"
}
```

### Output
JSON object in the form:
```javascript
{
    "success": true,
    "message": <success message>,
    "board_id": <the boards identifier (may be int or hash)>
}
```
Ex:
```javascript
{
    "success": true,
    "message": "Board created."
    "board_id": 1
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
    "message": "Failed to create board."
}
```

## PATCH - /changeBoard/name
Creates a board and adds the creating user as an owner.

### Input
PATCH request to the endpoint url.

Ex: `localhost:3000/changeBoard/name`

JSON object in the form:
```javascript
{
    "name": <board name>,
    "board_id": <the boards identifier (may be int or hash)>
}
```
Ex:
```javascript
{
    "name": "ex name",
    "board_id": 1
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
    "message": "Board name updated."
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
    "message": "Failed to update name."
}
```

## PUT - /changeBoard/addMember
Creates a board and adds the creating user as an owner.

### Input
PUT request to the endpoint url.

Ex: `localhost:3000/changeBoard/addMember'

JSON object in the form:
```javascript
{
    "board_id": <the boards identifier (may be int or hash)>
}
```
Ex:
```javascript
{
	"board_id": 1
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
    "message": "User added to board."
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
    "message": "Failed to add user to board."
}
```

## POST - /changeBoard/delete
Creates a board and adds the creating user as an owner.

### Input
POST request to the endpoint url.

Ex: `localhost:3000/changeBoard/delete'

JSON object in the form:
```javascript
{
    "board_id": <the boards identifier (may be int or hash)>
}
```
Ex:
```javascript
{
	"board_id": 1
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
    "message": "Board deleted."
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
    "message": "Failed to delete board."
}
```

## GET - /boardInfo/owned
Gets the list of boards owned by the user.
If user owns no board, return empty list.

### Input
GET request to the endpoint url.

Ex: `localhost:3000/boardInfo/owned'

### Output
JSON object in the form:
```javascript
{
    "success": true,
    "message": <success message>,
    "boards": [
        {
            "board_id": <base64 board identifier string>,
            "board_name": <board name>,
        },
        ...
    ]
}
```
Ex:
```javascript
{
    "success": true,
    "message": "Successfully retrieved boards.",
    "boards": [
        {
            "board_id": "sdaksjka2y92723h2dhui2d",
            "board_name": "AwesomeBoard",
        },
        {
            "board_id": "dasdajdajkk28832",
            "board_name": "secondBoard",
        }
    ]
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
    "message": "Failed to retrieve owned boards"
}
```

## GET - /boardInfo/member
Gets the list of boards the user is a member of.
If user is not a member of any boards, return empty list.

### Input
GET request to the endpoint url.

Ex: `localhost:3000/boardInfo/member'

### Output
JSON object in the form:
```javascript
{
    "success": true,
    "message": <success message>,
    "boards": [
        {
            "board_id": <board identifier (may be int or hash)>,
            "board_name": <board name>,
        },
        ...
    ]
}
```
Ex:
```javascript
{
    "success": true,
    "message": "Successfully retrieved boards.",
    "boards": [
       {
            "board_id": "asdsadaaggasdasd",
            "board_name": "AwesomeBoard",
        },
        {
            "board_id": "safaf4f28282",
            "board_name": "secondBoard",
        },
	{
            "board_id": "ferf343364436346",
            "board_name": "Someone Else's Board",
        }
    ]
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
    "message": "Failed to retrieve member boards"
}
```
