AsyncAwait.js
=============

Bringing the .NET Async Await still of asynchronous coding to javascript

Please test carefully the result, as it needs still extended testing.:

Sample Usage:

Original JS Function Requiring A Callback:

	var setTimeoutAsync = async.function(function(timeout){
	 	async.await( setTimeout(async.callback, timeout) );}
	);

Using An Already Transformed Async Fucntion:

	var myfunc = async.function(function(){
  		async.await( setTimeoutAsync(5000) );
  		alert("this is displayed after 5 seconds");
		return "it works";
	});
	
	var myfunc2 = async.function(function(){
		var result = async.await( myfunc());
		alert(result + " first time");
		result = async.await( myfunc());
		alert(result + " second time");
	});
	
	myfunc2();
	
Limitations As Of The Current Version (Hope To Fixed Soon [Anyone anxious for it, is welcome to help implementing]):
   
 	1. The async.await function must be in the outermost scope (i.e. it cannot be wrapped in a inner block, such as if/else, for/while, try/catch).
 	2. async.await and async.callback must be literal, an alias is not allowed, also it cannot be within an eval() string.
 	3. Having async.await or async.callback in a string, will mass up the function.
 	4. There is currently no error handler for the awaited function. 	
 	5. For the original callback function, we can get so far only the first argument
 		Exmaple Using JQuery $.get:
 			var result = async.await($.get("my/path", async.callback));
	6. Please note that on the async.await statment before the call to async.await, only variable assigment is allowed and not any other operation (however within the parameters of async.await other operations are also allowed)
 
 	
 
