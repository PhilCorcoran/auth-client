var express = require('express'),
settings=require('./settings.json'),
authClient=require('../lib/'),
routes=require('./routes');

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
var SuperUser={
	server:server,
	client:client,
	redirectLogin:true,
	role:'Superman'
}

var app = express();
app.use(express.logger({format:'dev',immediate:true}));
app.use(express.bodyParser());
app.use(express.cookieParser());
// GETs , POSTs, Whatever
app.all('/secure',authClient(DBAAjax),routes.secure);

app.get('/supersecure',authClient(SuperUser),routes.secure);
app.get('/anyauth',authClient(AnyAuthenticatedUser),routes.secure);
app.get('/open', routes.open);

app.listen(process.env.PORT || 8888);
console.log("Test Client Started"); 