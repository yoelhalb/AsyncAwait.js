AsyncAwait.js
=============

Bringing the .NET Async Await still of asynchronous coding to javascript

Please note that as of now the async.await function must be in the outermost scope (i.e. it cannot be wrapped in a inner block, such as if/else, for/while, try/catch), we hope to add this functionality in a future release.

Also please note that async.await and async.stub must be literal, an alias is not allowed.

Please test carefully the result, as it needs still extended testing.

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
