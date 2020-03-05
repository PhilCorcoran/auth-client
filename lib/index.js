var httpRequest = require('request'),
debug = require('debug')('auth-client');

module.exports = AC;

function AC(options) {
    if (!(this instanceof AC)) return new AC(options);
    this.options = options || {};
    if (!this.options.server || !this.options.client) {
        throw new Error('server and client are required');
    }
    this.options.authCode = this.options.authCode || 'code';
    this.options.tokenName = this.options.tokenName || 'access_token';
    if (!this.options.server.authURL || !this.options.server.swapCodeURL || !this.options.server.keepAliveURL) {
        throw new Error('server.swapCodeURL and server.authURL and server.keepAliveURL are required');
    }
    if (this.operation && this.role) {
        throw new Error('You cannot specify both an operation and a role. You must choose one.');
    }
    if ('promiscuous' == process.env.AUTH_CLIENT_MODE && 'development' != process.env.NODE_ENV) {
        throw new Error('Security set to promiscuous in production! You must remove the AUTH_CLIENT_MODE environment variable');
    }
}
AC.prototype.angXSRF = function(noRespond) {
    var self = this;
    return function xsrf(req, res, next) {
        if(validApiKey(req,self.options.apiKey) && getAuthHeader(req)) return next();
        debug("XSRF: cookie: %s, header:%s", req.cookies['XSRF-TOKEN'], req.header('X-XSRF-TOKEN'));
        if (req.cookies['XSRF-TOKEN'] && req.header('X-XSRF-TOKEN') && (req.cookies['XSRF-TOKEN'] == req.header('X-XSRF-TOKEN'))) {
            return next();
        }
        debug('XSRF error');
        if (noRespond) {
            return next(new Error('XSRF Error'));
        }
        return res.status(401).send({
            status: 'ERROR',
            message: 'XSRF error',
            location: self.options.server.authURL
        });
    }
}
AC.prototype.keepAlive = function() {
    var self = this;
    return function keepSessionAlive(req, res, next) {
        var token = req[self.options.tokenName];
        if (token) {
            var options = {
                url: self.options.server.keepAliveURL,
                json: {
                    access_token: token
                },
                method: 'POST'
            };
            debug('keepAlive() request:%s', JSON.stringify(options));
            httpRequest(options);
        }
        return next();
    }
}
AC.prototype.logout = function(opt) {
    var self = this;
    var noRespond = opt ? opt.noRespond : undefined;
    return function remoteLogout(req, res, next) {
        var token = req[self.options.tokenName] || req.cookies[self.options.tokenName];
        if (token) {
            var options = {
                url: self.options.server.logoutURL,
                json: {
                    access_token: token
                },
                method: 'POST'
            };
            debug('logout() request:%s', JSON.stringify(options));
            httpRequest(options);
        }
        if (noRespond) {
            return next();
        } else {
            return res.send('logout successful');
        }
    }
}
AC.prototype.swapCode = function(opt) {
    var self = this;
    self.scope = opt.scope;
    if (!self.scope) {
        throw new Error('scope resource name must be specified');
    }
    return function swapIt(req, res, next) {
        req.noRespond = opt.noRespond;
        req.tokenName = self.options.tokenName;
        var authCode = req.params&&req.params[self.options.authCode] || req.body&&req.body[self.options.authCode] || req.query&&req.query[self.options.authCode];
        debug('swapCode() self.options.authCodename:%s authCode:%s scope:%s', self.options.authCode, authCode, self.scope);
        if (!authCode) {
            return next();
        }
        req.authCode = authCode;
        debug('swapCode()  code:%s at url:%s', authCode, self.options.server.swapCodeURL);
        var options = {
            url: self.options.server.swapCodeURL,
            json: {
                requestToken: {
                    name: self.scope,
                    value: authCode
                }
            },
            method: 'POST'
        };
        debug('swapCode() request:%s', JSON.stringify(options));
        httpRequest(options, remoteSwapCode(req, res, next));
    }
}

function remoteSwapCode(req, res, next) {
    return function(error, response, body) {
        if (error || !body) {
            console.error('remoteSwapCode() Error swapping code:%s', error);
            return res.status(503).send('Failed to exchange code');
        }
        var result = body;
        debug('remoteSwapCode() result:%s', JSON.stringify(result));
        if (!result.session || !result.session.token) {
            debug('Session has expired or other error:%s', JSON.stringify(result));
            return res.status(503).send('No user session for code');
        }
        debug('setting cookie:%s', result.session.token);
        res.cookie(req.tokenName, result.session.token);    
        res.cookie('XSRF-TOKEN', result.session.token);
        req[req.tokenName] = result.session.token;
        if (req.noRespond) {
            return next();
        } else return res.send('swapped the code');
    }
}
AC.prototype.check = function(opt) {
    var self = this;
    var operation = opt.operation;
    var redirectLogin = opt.redirectLogin;
    var redirectBackURI = opt.redirectURI;
    var scope = opt.scope;
    if (!scope) {
        throw new Error('scope resource name must be specified');
    }
    if (!redirectLogin && !redirectBackURI) {
        throw new Error('redirectLogin OR redirectURI must be specified');
    }
    return function checkit(req, res, next) {
        if (process.env.AUTH_CLIENT_MODE == 'promiscuous') {
            debug('check() is in promiscous mode. I\'m saying yes to everything');
            return next();
        }
        debug("Checking authorisation for scope:%s, operation:%s, originalURL:%s", scope, operation, req.originalUrl);
        var clientRequest = opt.clientReq ? req[opt.clientReq] : {};
        var redirectURL = self.options.server.authURL + '?response_type=code&scope=' + scope + '&client_id=' + self.options.client.client_id + '&redirect_uri=';
        if (redirectBackURI) {
            redirectURL = redirectURL + redirectBackURI;
        } else {
            redirectURL = redirectURL + req.protocol + '://' + req.get('host') + req.originalUrl;
        }
        res.locals.redirectURL = redirectURL;
        var token = getAuthHeader(req) || req[self.options.tokenName] || req.body&&req.body[self.options.tokenName] || req.query&&req.query[self.options.tokenName] || req.cookies&&req.cookies[self.options.tokenName] ;
        debug('cookieName:%s cookie:%s', self.options.tokenName, token)
        if (!token) {
            debug('No %s token. redirectOr401 to redirectURL:%s', self.options.tokenName, redirectURL);
            redirectOr401(req, res, 'No token');
        } else {
            req[self.options.tokenName] = token;
            var options = {
                url: self.options.server.userAuthURL,
                json: {
                    token: token,
                    resource: scope,
                    operation: operation,
                    clientRequest: clientRequest
                },
                method: 'POST'
            };
            debug('checkit() options:%s', JSON.stringify(options));
            httpRequest(options, remoteIsAuthorized(req, res, next, opt));
        }
    };

    function redirectOr401(req, res, message) {
        // If cookie was source of token clear it when not authorized.
        if(req.cookies&&req.cookies[self.options.tokenName])
            res.clearCookie(self.options.tokenName);
        if (redirectLogin) {
            res.redirect(res.locals.redirectURL);
        } else {
            res.status(401).send({
                location: res.locals.redirectURL,
                message: message
            });
        }
    }

    function remoteIsAuthorized(req, res, next, opt) {
        return function(error, response, body) {
            if (error || !body) {
                console.error('remoteIsAuthorized() Error checking authorization%s', error);
                return res.status(503).send('Failed to authorize');
            }
            var result = body;
            debug('remoteIsAuthorized() result:%s', JSON.stringify(result));
            if (!result.authorised || !(result.authorised == 'Y') && redirectLogin){
                debug('Session has expired or other error:%s', JSON.stringify(result));
                res.redirect(res.locals.redirectURL);
            }else{
                if (!result.authorised) {
                    debug('Session has expired or other error:%s', JSON.stringify(result));
                    return redirectOr401(req, res, 'No user session for user token');
                }
                if (!(result.authorised == 'Y')) {
                    res.status(403).send({
                        status: 'Error',
                        message: 'Error: User does not have the required role or permision',
                        location: res.locals.redirectURL
                    });
                } else {
                    // By default place any authDetails on the original clientReq.
                    // clientRes can be used to override this.
                    var authDetailsDest = opt.clientRes || opt.clientReq;
                    req[authDetailsDest] = req[authDetailsDest] || {};
                    req[authDetailsDest].authDetails = result.authDetails || {};
                    return next();
                }
            }
        }
    }
}

function getClientRequest(req) {
    if (!isEmpty(req.body)) {
        return req.body;
    }
    if (!isEmpty(req.query)) {
        return req.query;
    }
    if (!isEmpty(req.params)) {
        var o = {};
        for (var k in req.params) {
            o[k] = req.params[k];
        }
        return o;
    }
    return undefined;

    function isEmpty(map) {
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }
}

function getAuthHeader(req){
    var bearer=req.get('Authorization');
    if(bearer) bearer=bearer.trim().split(' ')[1];
    return bearer; 
}

function validApiKey(req,apiKey){
    if(!apiKey){
        debug('apiKey not configured');
        return false;
    }
    var headerApiKey=req.get('X-Api-Key');
    if(!headerApiKey){
        return false;
    }
    if(typeof(apiKey)=='string')apiKey=[{thirdParty:'legacy',key:apiKey}]; //handle legacy key setting
    for (var i = 0; i < apiKey.length; i++) {
        if(headerApiKey.trim()==apiKey[i].key.trim()){
            return apiKey[i].thirdParty;
        }
    }
    debug('invalid X-Api-Key');
    return false;
}
AC.prototype.validApiKey=validApiKey;