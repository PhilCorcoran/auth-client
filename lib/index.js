var httpRequest=require('request');

module.exports=function (options){
	options=options || {};
	if(!options.server || !options.client){
		throw new Error('server and client are required');
	}
	var authURL=options.server.authURL;
	var userInfoURL=options.server.userInfoURL;
	var client_id=options.client.client_id;
	var client_secret=options.client.client_secret;
	var authCode=options.authCode || 'code';
	var tokenName=options.tokenName || 'access_token';
	var redirectURI=options.redirectURI;// return to this uri after login is complete
	var role=options.role;
	var operation=options.operation;
	var redirectLogin=options.redirectLogin;
	if(!userInfoURL || !authURL){
		throw new Error('server.userInfoURL and server.authURL are required');
	}
	if(operation && role){
		throw new Error('You cannot specify both an operation and a role. You must choose one.');
	}
	return function check(req,res,next){
		console.info("Checking authorisation for role:%s, operation:%s, originalURL:%sreq.originalUrl",role,operation);
		var redirectURL= authURL +'?response_type=code&redirect_uri=';
		if(redirectURI){
			redirectURL=redirectURL+redirectURI;
		}
		else {
			redirectURL=redirectURL + req.protocol + '://' + req.get('host') + req.originalUrl;
		}
		redirectURL+='&client_id='+client_id;
		res.locals.redirectURL=redirectURL;
		console.info('Checking for a token called:%s',tokenName);
		var token=req.param(authCode);// Try the query param first since the cookie may be old.
		if(!token && !(token=req.cookies[tokenName])){
			console.info('No %s token. redirectOr401 to redirectURL:%s',tokenName,redirectURL);
			redirectOr401(res,'No token');
		}else{
			var fullURL=userInfoURL+'?'+tokenName+'='+token+'&client_id='+client_id+'&client_secret='+client_secret;
			console.info('Getting user with token:%s from url:%s',token,fullURL);
			httpRequest(fullURL,remoteGetUser(req,res,next));
		}

	};
	function redirectOr401(res,message){
		if(options.redirectLogin){
			res.redirect(res.locals.redirectURL);
		}else{
			res.status(401).send({location:res.locals.redirectURL,message:message});
		}
	}
	function remoteGetUser(req,res,next){
		return function(error,response,body){
			if(error || ! body ){
				console.error('Error getting user from UserInfo endpoint. %s',error);
				return res.status(503).send('Failed to authorize');
			}
			var user=JSON.parse(body);
			if(!user.session || ! user.session.token){
				console.info('Session has expired or other error:%s',JSON.stringify(user));
				return redirectOr401(res,'No user session for user token');
			}
			req.user=user;
			console.info("user roles :%s",JSON.stringify(req.user.roles));
			res.cookie(tokenName,user.session.token);
			if(!hasRoleOperation(role,operation,req.user)){
				res.status(403).send('Error: User does not have the required role or permision');
			}else{
				return next();
			}
		}
	}	

	function hasRoleOperation(role,operation,user){
		if(!role && !operation){
			return true;
		}
		if(role){
			return hasRole(role,user);
		}else{
			return hasOperation(operation,user);
		}
	}
	
	function hasRole(role,user){
		if(!role){
			return true;
		}
		if(!user.roles){
			console.warn('user %s has no roles',user.name);
			return false;
		}
		if(user.roles.indexOf(role)==-1){
			console.info('user:%s does not have the required role:',user.name,role);
			return false;
		}
		return true;
	}

	function hasOperation(operation,user){
		if(!operation){
			return true;
		}
		if(!user.operations){
			console.info('user %s has no operations',user.name);
			return false;
		}
		if(operation.resource){
			return false;//operations on roles not implemented yet
		}
		if(user.operations.indexOf(operation)==-1){
			console.info('user:%s does not have the required operation:',user.name,operation);
			return false;
		}
		return true;
	}

}