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
var ac=require('auth-client')({server:settings.authServer,client:settings.client}),
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
- `redirectLogin`: if undefined the user's browser will not be redirected. A 401 will be sent instead. This is to support AJAX

### Options for swapCode function
- `noRespond`: don't do a res.send so this can be chained

### Options for check function

- `scope`: The scope of the authorization request, the name of the resource to be accessed.
- `operation`: The operation on the resource to be checked
- `clientReq`: The name of the object on the express `req` object to sent as the original client request

### Environment variables
- `AUTH_CLIENT_MODE`: If this is set to `promiscuous` And  `NODE_ENV` ==  `development` then the authorization check always allows access to anyone.

## Secure URLs

Secure a URL for any authenticated user with permission to perform an operation on a resource
```js

// Traditional web app with no AJAX
var Support={scope:'aProtectedResource',
	operation:'Update',
	redirectURI:'http://localhost:8888/secure',
	redirectLogin:true, //301 will be sent by server
	noRespond:true // swapCode will not do a res.send so it can be chained with other functions
}
app.get('/secure',noCache,ac.swapCode(Support),ac.check(Support),ac.keepAlive(),routes.secure);

// AJAX application
var SupportAJAX={
	scope:'aProtectedResource',
	operation:'Update',
	client_id:'MemberSearch',
	noRespond:true,
	redirectURI:'http://localhost:8888/index.html%23/' 
	// no redirectLogin means that 401 is sent by server instead of 301
}
app.all('/ajaxsecure',ac.swapCode(SupportAJAX),ac.check(SupportAJAX),routes.secure);
```


## Release History
|Version|Date|Description|
|:--:|:--:|:--|
|v0.4.4|2015-09-28|Clear token cookie on unauthorised (401)|
|v0.4.3|2014-09-04|Debug module|
|v0.4.2|2014-09-02|Location in 403 response|
|v0.4.1|2014-08-22|Resource check|
|v0.3.3|2014-08-20|Added promiscuous mode|
|v0.3.2|2014-08-05|Check looks for token in body,query, cookie|
|v0.3.1|2014-07-18|Can set original client request as an object from express req object|
|v0.3.0|2014-07-16|Added logout and checks for operations on resources|
|v0.2.0|2014-06-13|Added swapCode,keepAlive and angularJS XSRF check|
|v0.1.0|2014-05-28|Created|

# License 

(The MIT License)

Copyright (c) 2014 PC 
