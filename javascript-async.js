
var async = {};
async.savedCalls = {};
async.functionSetup = function (func, recurseCount){
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
	for(var j = (awaitIndexSecondPart + awaitCode.length); found == false; j++)
	{
		if(secondPartAsArray[j] == "(") startParenCount++;
		if(secondPartAsArray[j] == ")") endParenCount++;
		if(foundFirst && startParenCount == endParenCount){
			parenCount = startParenCount;
			awaitInnerExpressionStart = secondPartAsArray.indexOf("(") + 1;
			awaitInnerExpressionEnd = j - 1;
			awaitOuterExpressionEnd = j
			found = true;
		}
		if(!foundFirst && startParenCount > 0) foundFirst = true;
	}
	
	var awaitPart = secondPart.substring(awaitInnerExpressionStart, awaitInnerExpressionEnd + 1);
	var awaitFuncName = awaitPart.substring(0,awaitPart.indexOf("("));
	
	//TODO... if it is in a clousure then cut, also if it is if while try catch finanly for, also it might be an argument to a function, it might be in the if or while condition or in the ternatery operator (but not in the case condition, we have to throw an error), and it might be to the right or left of a logical short circut eveluation (and what about bitwise??) or just a block...
	var newStubName = "stub"+recurseCount.toString();
	firstPart = firstPart.replace(callbackCode, newStubName);//To avoid coolisions		
	awaitPart = awaitPart.replace(callbackCode, newStubName);
	
	var callbackPart = secondPart.substring(awaitOuterExpressionEnd + 1, funcText.length);
			
	callbackPart = "function (argsFromAsyncOperation1234567890){\n\
									"+beforeAwaitPart+ " argsFromAsyncOperation1234567890;\n\
									" + callbackPart; //Should have the closing bracket
	var callbackMainHandler = 
   "function(argsFromAsyncOperation1234567890){\n \
		//Note we do not call the callbackpart directly, because we want to be able to return results for callers\n\
		var resultFromAsyncOperationCallBack1234567890 = ("+callbackPart+ ")(argsFromAsyncOperation1234567890) ;\n\
		//Call the callback if any\n\
		if(callbackFunc) callbackFunc(resultFromAsyncOperationCallBack1234567890);\n\
	}\n";
		
		
	
	var intro = "\n\
	//First thing capture the callback, note that this might not work in a multithreaded enviroment \n\
	var callbackFunc = null;\n\
	if(async.savedCalls[arguments.callee]) callbackFunc =  async.savedCalls[arguments.callee];\n\
";
	if(callbackMainHandler.indexOf(awaitCode) >= 0){
		var beginningPart = callbackMainHandler.substring(0, callbackMainHandler.indexOf(awaitCode));
		//TODO... we will have to change when we will add support for inner blocks
		var beginnigIndex = beginningPart.lastIndexOf("function");//TODO... so far we assume that it will never be proceded with a } before awaitCode
		beginningPart = callbackMainHandler.substring(0, beginnigIndex);//Rememeber that currently we don't handle inner scope
		var endingPart = callbackMainHandler.substring(callbackMainHandler.indexOf(awaitCode));
		var endingIndex = endingPart.indexOf("}");//see above
		endingPart = endingPart.substring(endingIndex + 1);
		var textToPass = callbackMainHandler.substring(beginnigIndex, callbackMainHandler.indexOf(awaitCode) + endingIndex + 1)
		var recurseResult = async.functionSetup(textToPass, recurseCount + 1);
		callbackMainHandler = beginningPart + recurseResult + endingPart;
	}
	var secondIntro = "if(async.savedCalls["+awaitFuncName+".toString()]){\n\
							async.savedCalls["+awaitFuncName+".toString()] = "+newStubName+";\n\
						} ";
	firstPart = firstPart.replace("{", "{" + intro + "\nvar " + newStubName+" = "+callbackMainHandler + secondIntro );
	
	funcText = firstPart + " ;\n " + awaitPart + ";\n }";//We are embedding it as a clausure, so it will have access to all local variables
	//TODO... put back the strings
	document.write("<br><br>", funcText.replace(/\n/g, "<br>"));
	return funcText;
}
	
async.function = function(func){
	var funcText = async.functionSetup(func,1);
	eval("var a = " +funcText);
	async.savedCalls[a.toString()] = {};	
	return a;
	//TODO... we can add a EndAsync call as well as EndAllAsync, also we can provide BeginAsyncBlock and EndAsyncBlock (these will be used to execute something asynchronosly using setTimeOut())
}
