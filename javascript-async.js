
var async = {};
async.savedCalls = {};
async.function = function Function(func){
	var funcText = func.toString();
	//TODO... the following has to be done in a loop
	var awaitCode ="async.await";
	var callbackCode = "async.callback";
	
	var foundBackSlash = false;
	var foundForwardSlash = false;
	var inSingleLineComment = false;
	var inMultiLineComment = false;
	var inSingleQoutedString = false;
	var inDoubleQoutedString = false;
	var foundAsterisk = true;
	var startOfString = null;
	var stringArray = [];
	var funcTextArray = funcText.split("");
	var newFuncTextArray = [];
	for(var i = 0; i < funcTextArray.length; i++){
		switch(funcTextArray[i]){
			case "/":
				if(foundForwardSlash){ foundForwardSlash = false; inSingleLineComment = true;newFuncTextArray.pop();/*remove the last entry*/;foundBackSlash = false;foundAsterisk=false;}//found forward slash can be set only if we are not already in a comment
				else if(inMultiLineComment && foundAsterisk){ foundAsterisk = false;inMultiLineComment=false; }
				else if(!inSingleLineComment && !inMultiLineComment && !inSingleQoutedString && !inDoubleQoutedString){foundForwardSlash = true;newFuncTextArray.push("/");foundBackSlash = false;foundAsterisk=false;}
				break;
			case "\\":
				foundForwardSlash = false; foundAsterisk = false;
				if(inSingleQoutedString || inDoubleQoutedString){
					if(foundBackSlash){ foundBackSlash = false;}
					else { foundBackSlash = true;}
				}
				if(!inSingleLineComment && !inMultiLineComment && !inSingleQoutedString && !inDoubleQoutedString){ newFuncTextArray.push("\\");}
				break;
			case "*":
				if(!inSingleLineComment && !inSingleQoutedString && !inDoubleQoutedString){
					if(inMultiLineComment){ foundAsterisk = true; foundBackSlash = false; foundForwardSlash = false;}
					else if(foundForwardSlash){ inMultiLineComment = true; foundForwardSlash = false; }
					else { foundBackSlash = false;foundAsterisk = false;newFuncTextArray.push("*");}
				}
				break;
			case "\n": 				
				if(!inMultiLineComment && !inDoubleQoutedString && !inSingleQoutedString){newFuncTextArray.push("\n");}
				inSingleLineComment = false;
				foundAsterisk = false;
				foundBackSlash = false;
				foundForwardSlash = false;
			case "\"":
				if(inMultiLineComment || inSingleLineComment || inSingleQoutedString) { foundAsterisk = false; break;}
				else if(inDoubleQoutedString && foundBackSlash){ foundBackSlash = false;}
				else if(inDoubleQoutedString && !foundBackSlash){ inDoubleQoutedString = false;stringArray.push(funcText.substring(startOfString, i +1));startOfString = null;newFuncTextArray.push("#"+stringArray.length - 1);}
				else { inDoubleQoutedString = true; startOfString = i; foundForwardSlash = false; foundBackSlash = false;foundAsterisk = false;}
				break;
			case "'":
				if(inMultiLineComment || inSingleLineComment || inDoubleQoutedString) { foundAsterisk = false; break;}
				else if(inSingleQoutedString && foundBackSlash){ foundBackSlash = false;}
				else if(inSingleQoutedString && !foundBackSlash){ inSingleQoutedString = false;stringArray.push(funcText.substring(startOfString, i +1));startOfString = null;newFuncTextArray.push("#"+stringArray.length - 1);}
				else { inSingleQoutedString = true; startOfString = i; foundForwardSlash = false; foundBackSlash = false;foundAsterisk = false;}
				break;
			default:
				foundAsterisk = false;
				foundBackSlash = false;
				foundForwardSlash = false;
				if(!inMultiLineComment && !inSingleLineComment&&!inDoubleQoutedString && !inSingleQoutedString){newFuncTextArray.push(funcTextArray[i]);}
				break;
		}
	}
	//TODO... remove comments and strings	
    for(var i = 0; i < 1/*funcText.indexOf(awaitCode) >= 0*/;i++)
	{
		var awaitIndex = funcText.indexOf(awaitCode);
		if(awaitIndex == -1) throw new Exception("no await found");
		//TODO... we have to consider end brackets
		var firstPart = funcText.substring(0, (funcText.substring(0,awaitIndex).lastIndexOf(";") >= 0 ? funcText.substring(0,awaitIndex).lastIndexOf(";") : funcText.substring(0,awaitIndex).lastIndexOf("{")) + 1);//TODO... what if he just terminated with a new line??? but we cannot look for a new line as the current line has all rights to be separated on two lines
		var beforeAwaitPart = funcText.substring(firstPart.length, awaitIndex);	
		
		var secondPart = funcText.substring(awaitIndex,funcText.length);
		var awaitIndexSecondPart = secondPart.indexOf(awaitCode);
		var secondPartAsArray = secondPart.split("");
		var parenCount = null;
		var awaitInnerExpressionStart = null;
		var awaitInnerExpressionEnd = null;
		var awaitOuterExpressionEnd = null;
		var startParenCount = 0;
		var endParenCount = 0;
		var foundFirst = false;
		var found = false;
		for(var i = (awaitIndexSecondPart + awaitCode.length); found == false; i++)
		{
			if(secondPartAsArray[i] == "(") startParenCount++;
			if(secondPartAsArray[i] == ")") endParenCount++;
			if(foundFirst && startParenCount == endParenCount){
				parenCount = startParenCount;
				awaitInnerExpressionStart = secondPartAsArray.indexOf("(") + 1;
				awaitInnerExpressionEnd = i - 1;
				awaitOuterExpressionEnd = i;
				found = true;
			}
			if(!foundFirst && startParenCount > 0) foundFirst = true;
		}
		
		var awaitPart = secondPart.substring(awaitInnerExpressionStart, awaitInnerExpressionEnd + 1);
		var awaitFuncName = awaitPart.substring(0,awaitPart.indexOf("("));
		
		//TODO... if it is in a clousure then cut, also if it is if while try catch finanly for, also it might be an argument to a function, it might be in the if or while condition or in the ternatery operator (but not in the case condition, we have to throw an error), and it might be to the right or left of a logical short circut eveluation (and what about bitwise??) or just a block...
		var newStubName = "stub"+i.toString();
		firstPart = firstPart.replace("this.Stub", newStubName);//To avoid coolisions		
		awaitPart = awaitPart.replace(callbackCode, newStubName);
		
		var callbackPart = secondPart.substring(awaitOuterExpressionEnd + 1, funcText.length);
		callbackPart = callbackPart.replace(/(.*)}([^}]*)/,"$1$2");
		callbackPart += ";for(var functionString in async.savedCalls[randomNameToTest1234567890.toString()]){ if(async.savedCalls[randomNameToTest1234567890.toString()][functionString]){ for(var callbackName in async.savedCalls[randomNameToTest1234567890.toString()][functionString]) {(async.savedCalls[randomNameToTest1234567890.toString()][functionString][callbackName])();}}}";//TODO... handle returns
		callbackPart += "}";		
		
		//So far we support only a single callback
		callbackPart = callbackPart.replace(/(.*)}([^}]*)/,"$1$2; if(async.savedCalls["+awaitFuncName+".toString()] && async.savedCalls["+awaitFuncName+".toString()][randomNameToTest1234567890.toString()]){ async.savedCalls["+awaitFuncName+".toString()][randomNameToTest1234567890.toString()]['"+newStubName+"'] = null; }} ");//Register for the current call, and unregister when the callback completed
			
		callbackPart = "function (args){"+beforeAwaitPart+ " args; " + callbackPart; //Should have the closing bracket
		
		var intro = "var randomNameToTest1234567890 = arguments.callee; if(async.savedCalls["+awaitFuncName+".toString()] && !async.savedCalls["+awaitFuncName+".toString()][randomNameToTest1234567890.toString()]) { async.savedCalls["+awaitFuncName+".toString()][randomNameToTest1234567890.toString()] = {};}";
		var secondIntro = "if(async.savedCalls["+awaitFuncName+".toString()] && async.savedCalls["+awaitFuncName+".toString()][randomNameToTest1234567890.toString()]){ async.savedCalls["+awaitFuncName+".toString()][randomNameToTest1234567890.toString()]['"+newStubName+"'] = "+newStubName+"; } ";
		firstPart = firstPart.replace("{", "{" + intro + "var " + newStubName+" = "+callbackPart + ";" + secondIntro );
		
		funcText = firstPart + " ; " + awaitPart + "; }";//We are embedding it as a clausure, so it will have access to all local variables
		//TODO... put back the strings
		
		
	}
	eval("var a = " +funcText);
	async.savedCalls[a.toString()] = {};	
	return a;
	//TODO... we can add a EndAsync call as well as EndAllAsync, also we can provide BeginAsyncBlock and EndAsyncBlock (these will be used to execute something asynchronosly using setTimeOut())
}
