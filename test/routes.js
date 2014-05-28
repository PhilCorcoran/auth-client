exports.open=function(req,res,next){
	console.log("url:%s and user:%s",req.url,req.user);
	res.send({success:"Open route with no access control"});
}
exports.secure=function(req,res,next){
	console.log("url:%s and user:%s",req.url,req.user);
	res.send({success:"got it",user:req.user});
}

