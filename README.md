auth-client
===========

Checks Authorisation using tokens from a remote web server

# Install

```bash
  npm install auth-client
```
# Examples:

## Initialization

```js
var ac=require('auth-client')(options);
```

### Options

- `server`: configuration for the remote authorization server with the following attributes;
- `authURL`: The login authorization url
- `logoutURL`: The url for logging out
- `keepAliveURL`: The url for keeping a session active
- `swapCodeURL`: The url for exchanging an authorization code for an access_token
- `userAuthURL`: The url for authorizing a role with a token
- `client`: The relying party client information including the following attributes;
- `client_id`: a client id which was registered with the authorization server
- `client_secret`: a client password which was registered with the authorization server
- `authCode`: the name of the code parameter. Defaults to `code` as specified by OAUTH
- `tokenName`: the name of the token used to access the user info. Defaults to access_token
- `redirectURI`: a url to be redirected to following authorization. Defaults to the current url.
- `scope`: The scope of the authorization request, the name of the resource to be accessed.
- `role`: a user role to be checked. If undefined then any authenticated user will be accepted.
- `redirectLogin`: if undefined the user's browser will not be redirected. A 401 will be sent instead. This is to support AJAX


## Secure URLs

Secure a URL for any authenticated user and secure a url for users with a particular role.
```js

var AnyAuthenticatedUser={
	scope:'Profile',
	redirectLogin:true
}
var DBAAjax={
	scope:'Profile',
	role:'DBA',
	redirectURI:'http://localhost:8888/index.html'	
}
app.all('/sosecure',ac.swapCode(DBAAjax),ac.check(DBAAjax),ac.keepAlive(),routes.secure);
app.get('/anyauth',,ac.check(AnyAuthenticatedUser),routes.secure);

```

#Test
Install the required node modules and run `node app.js` in the test directory.
Browse to 
`http://localhost:8888/secure`


## Release History
|Version|Date|Description|
|:--:|:--:|:--|
|v0.2.0|2014-06-13|Added swapCode,keepAlive and angularJS XSRF check|
|v0.1.0|2014-05-28|Created|

# License 

(The MIT License)

Copyright (c) 2014 PC 
