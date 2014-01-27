AsyncAwait.js
=============

Bringing the .NET Async Await still of asynchronous coding to javascript

Sample Usage:

Original JS Function Requiring A Callback:

	var setTimeOutAsync = async.function(function(timeout){
	 	async.await( setTimeOut(async.Stub, args) );}
	);

Using An Already Transformed Async Fucntion:

	var myfunc = async.function(function(){
  		async.await( setTimeOutAsync(3000) );
  		alert("this is displayed after 3 seconds");
	});
