const debug = require('debug')('auth-client');
const axios = require('axios');

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
}
AC.prototype.angXSRF = function(noRespond) {
    return (req, res, next) =>{
        if(validApiKey(req,this.options.apiKey) && getAuthHeader(req)) return next();
        debug("XSRF: cookie: %s, header:%s", req.cookies && req.cookies['XSRF-TOKEN'], req.header('X-XSRF-TOKEN'));
        if (req.cookies && req.cookies['XSRF-TOKEN'] && req.header('X-XSRF-TOKEN') && (req.cookies['XSRF-TOKEN'] == req.header('X-XSRF-TOKEN'))) {
            return next();
        }
        debug('XSRF error');
        if (noRespond) {
            return next(new Error('XSRF Error'));
        }
        return res.status(401).send({
            status: 'ERROR',
            message: 'XSRF error',
            location: this.options.server.authURL
        });
    }
}
AC.prototype.keepAlive = function() {
    return (req, res, next) => {
        const token = req[this.options.tokenName] || (req.cookies && req.cookies[this.options.tokenName]);
        if(token) {
            const json = {access_token : token}
            debug('keepAlive() request:', JSON.stringify(json));
            axios.post(this.options.server.keepAliveURL, json)
        }
        return next();
    }
}
AC.prototype.logout = function(opt) {
    return (req, res, next) => {
        const noRespond = opt && opt.noRespond;
        const token = req[this.options.tokenName] || (req.cookies && req.cookies[this.options.tokenName]);
        if (token) {
            const json = {access_token : token}
            debug('logout() request:', JSON.stringify(json));
            axios.post(this.options.server.logoutURL, json)
        }
        if (noRespond) {
            return next();
        } else {
            return res.send('logout successful');
        }
    }
}
AC.prototype.swapCode = function(opt) {
    const scope = opt.scope;
    if (!scope) {
        throw new Error('scope resource name must be specified');
    }
    return (req, res, next) => {
        const noRespond = opt.noRespond;
        const tokenName = this.options.tokenName;
        const authCode = this.options.authCode;
        const authCodeValue = req.params&&req.params[authCode] || req.body&&req.body[authCode] || req.query&&req.query[authCode];
        debug('swapCode() authCode:%s authCodeValue:%s scope:%s', authCode, authCodeValue, scope);
        if (!authCodeValue) {
            return next();
        }
        req.authCode = authCodeValue;
        const json = {requestToken: {name: scope,value: authCodeValue}}
        debug('swapCode() request:', JSON.stringify(json));
        axios.post(this.options.server.swapCodeURL, json)
        .then(response=>{
            const result = response.data;
            debug('swapCode() result:', result);
            if (!result.session || !result.session.token) {
                debug('Session has expired or other error:', result);
                return res.status(503).send('No user session for code');
            }
            debug('setting cookie:', result.session.token);
            res.cookie(tokenName, result.session.token);
            res.cookie('XSRF-TOKEN', result.session.token);
            req[tokenName] = result.session.token;
            if (noRespond) {
                return next();
            }
            return res.send('swapped the code');
        })
        .catch(error=>{
            if(error.response) {
                debug('swapCode() Error swapping code:', error.response.status, JSON.stringify(error.response.data));
            } else {
                debug('swapCode() Error swapping code:', error.message);
            }
            return res.status(503).send('Failed to exchange code');
        })
    }
}

AC.prototype.check = function(opt) {
    const operation = opt.operation;
    const redirectLogin = opt.redirectLogin;
    const redirectBackURI = opt.redirectURI;
    const scope = opt.scope;
    if (!scope) {
        throw new Error('scope resource name must be specified');
    }
    if (!redirectLogin && !redirectBackURI) {
        throw new Error('redirectLogin OR redirectURI must be specified');
    }
    return (req, res, next) => {
        debug("Checking authorisation for scope:%s, operation:%s, originalURL:%s", scope, operation, req.originalUrl);
        const options = this.options;
        const clientRequest = opt.clientReq ? req[opt.clientReq] : {};
        let redirectURL = options.server.authURL + '?response_type=code&scope=' + scope + '&client_id=' + options.client.client_id + '&redirect_uri=';
        if (redirectBackURI) {
            redirectURL = redirectURL + redirectBackURI;
        } else {
            redirectURL = redirectURL + req.protocol + '://' + req.get('host') + req.originalUrl;
        }
        res.locals.redirectURL = redirectURL;
        const tokenName = options.tokenName;
        const token = getAuthHeader(req) || req[tokenName] || req.body&&req.body[tokenName] || req.query&&req.query[tokenName] || req.cookies&&req.cookies[tokenName] ;
        debug('cookieName:%s cookie:%s', tokenName, token)
        if (!token) {
            debug('No %s token. redirectOr401 to redirectURL:%s', tokenName, redirectURL);
            redirectOr401('No token');
        } else {
            req[tokenName] = token;
            const json ={
                token: token,
                resource: scope,
                operation: operation,
                clientRequest: clientRequest
            };
            debug('check() request:', JSON.stringify(json));
            axios.post(options.server.userAuthURL, json)
            .then(response=>{
                const result = response.data
                debug('check() result:', result);
                if (!result.authorised) {
                    debug('Session has expired or other error:', result);
                    return redirectOr401('No user session for user token');
                }
                if (result.authorised !== 'Y') {
                    if(redirectLogin){
                        return res.redirect(redirectURL);
                    }
                    return res.status(403).send({
                        status: 'Error',
                        message: 'Error: User does not have the required role or permision',
                        location: redirectURL
                    });
                } else {
                    // By default place any authDetails on the original clientReq.
                    // clientRes can be used to override this.
                    const authDetailsDest = opt.clientRes || opt.clientReq;
                    req[authDetailsDest] = req[authDetailsDest] || {};
                    req[authDetailsDest].authDetails = result.authDetails || {};
                    return next();
                }
            })
            .catch((error)=>{
                if(error.response) {
                    debug('check() Error checking authorization:', error.response.status, JSON.stringify(error.response.data));
                } else {
                    debug('check() Error checking authorization:', error.message);
                }
                return res.status(503).send('Failed to authorize');
            })
        }

        function redirectOr401(message) {
            // If cookie was source of token clear it when not authorized.
            if(req.cookies && req.cookies[tokenName])
                res.clearCookie(tokenName);
            if (redirectLogin) {
                res.redirect(res.locals.redirectURL);
            } else {
                res.status(401).send({
                    location: res.locals.redirectURL,
                    message: message
                });
            }
        }
    }
};

function getAuthHeader(req){
    const bearer=req.get('Authorization');
    return bearer && bearer.trim().split(' ')[1];
}

function validApiKey(req,apiKey){
    if(!apiKey){
        debug('apiKey not configured');
        return false;
    }
    const headerApiKey = req.get('X-Api-Key');
    if(!headerApiKey){
        return false;
    }
    if(typeof(apiKey)=='string') {
        apiKey=[{thirdParty:'legacy',key:apiKey}]; //handle legacy key setting
    }
    for (let i = 0; i < apiKey.length; i++) {
        if(headerApiKey.trim()==apiKey[i].key.trim()){
            return apiKey[i].thirdParty;
        }
    }
    debug('invalid X-Api-Key', headerApiKey);
    return false;
}
AC.prototype.validApiKey=validApiKey;