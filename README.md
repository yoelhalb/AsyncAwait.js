AsyncAwait.js
=============

Bringing the .NET Async Await still of asynchronous coding to javascript

Please test carefully the result, as it needs still extended testing.:

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
	
Limitations As Of The Current Version (Hope To Fixed Soon [Anyone anxious for it, is welcome to help implementing]):
   
 	1. The async.await function must be in the outermost scope (i.e. it cannot be wrapped in a inner block, such as if/else, for/while, try/catch).
 	2. async.await and async.stub must be literal, an alias is not allowed, also it cannot be within an eval() string.
 	3. Having async.await or async.stub in a string, will mass up the function.
 	4. There is currently no error handler for the awaited function.
 	5. Returning from the code after async.await by using the return keyword (or throwing an excpetion) will prevent the caller code from being exceuted.
 	6. It is not yet possible to return data, besides an original callback function which can get the first argument
 		Exmaple Using JQuery $.get:
 			var result = $.get("my/path", async.Stub);
 
 	
 
