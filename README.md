auth-client
===========

Checks Authorisation by getting the user and roles from a remote web server

# Install

```bash
  npm install auth-client
```
# Examples:

## Initialization

```js
var authClient=require('auth-client');
```

### Options

- `server`: configuration for the remote authorization server with the following attributes;
- `authURL`: The authorization url
- `logoutURL`: The url for logging out
- `userInfoURL`: The url for retrieving user information such as name, email, roles
- `client`: The relying party client information including the following attributes;
- `client_id`: a client id which was registered with the authorization server
- `client_secret`: a client password which was registered with the authorization server
- `authCode`: the name of the code parameter. Defaults to `code` as specified by OAUTH
- `tokenName`: the name of the token used to access the user info. Defaults to access_token
- `redirectURI`: a url to be redirected to following authorization. Defaults to the current url.
- `role`: a user role to be checked. If undefined then any authenticated user will be accepted.
- `redirectLogin`: if undefined the user's browser will not be redirected. A 401 will be sent instead. This is to support AJAX


## Retrieve and Serve cached data:

Relies on  `expressjs`.
The following code instructs `express` to use the `serve` method of `cache-ex` on all requests. Subsequent handlers are only called if the object has not been served from the cache.
```js
var server=settings.authServer;
var client=settings.client;

var AnyAuthenticatedUser={
	server:server,
	client:client,
	redirectLogin:true
}
var DBAAjax={
	server:server,
	client:client,
	role:'DBA'
}
app.all('/sosecure',authClient(DBAAjax),routes.secure);
app.get('/anyauth',authClient(AnyAuthenticatedUser),routes.secure);

```

#Test
Install the required node modules and run `node app.js` in the test directory.
Browse to 
`http://localhost:8888/secure`


## Release History
|Version|Date|Description|
|:--:|:--:|:--|
|v0.1.0|2014-05-28|Created|

# License 

(The MIT License)

Copyright (c) 2013 PC 