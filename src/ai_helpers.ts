import * as vscode from 'vscode';
import { WebviewState, logMessage } from './helpers';
import { MINUTE_IN_MILLISECONDS, REQUESTS_PER_DAY_LIMIT, REQUESTS_PER_MINUTE_LIMIT } from './consts';
import { sendGeminiRequest } from './ai_communication';
import { _getHtmlForWebview } from './parsers';
import { ResultPanel } from './panelProvider';


let requestsThisMinute: number = 0;
let requestsPerDay: number = 0;
let lastResetDate: string = "";
let lastMinuteResetTime: number = Date.now();

export async function checkAndRunRequests(context: vscode.ExtensionContext, code: string, errors: string, 
	panel: vscode.WebviewPanel) {
	//if there are errors, and run the AI and show the results
	let response = "";

	let canContinue = await updateAndCheckRequests(context);

	if (!canContinue) {
		response = `<h2>Request limit reached</h2>`
	}
	//let response = await sendAwanllmRequest(context);
	else response = await sendGeminiRequest(context, code, errors);


	ResultPanel.inProcess.LLM_errors = false;
	panel.webview.postMessage({
		command: "ai_results",
		value: response,
	});
}

export async function updateAndRequestAST(context: vscode.ExtensionContext, code: string, webstate:WebviewState, panel: vscode.WebviewPanel) {
	//if there are errors, and run the AI and show the results
	let response = "";

	if(webstate.getWebviewState().ast_results !== "") {
		response = webstate.getWebviewState().ast_results;
	}
	else{
		let canContinue = await updateAndCheckRequests(context);

		if (!canContinue) {
			response = `<h2>Request limit reached</h2>`
		}
		//let response = await sendAwanllmRequest(context);
		else {		
			vscode.window.showInformationMessage(
			"AST is being generated, please wait. This may take a few seconds.");
			response = await sendGeminiRequest(context, code, "", true);
		}
		
		//delete all lines that include ' "type": "type" ' or ' "type": "param" ' from the response
		response = response.replace(/"type": "type",/g, "");
		response = response.replace(/"type": "param",/g, "");

		//between every consecutive '}' and '{' add a ',' if there isnt any
		response = response.replace(/}\n{/g, "},\n{");

		//add [ and ] to the start and end of the response
		response = "[" + response + "]";
		
		ResultPanel.inProcess.AST = false;

		webstate.setWebviewState({ast_results: response});
	}

	logMessage(context, "AST response: " + response);
	panel.webview.postMessage({
		command: "ast",
		value: "this is to allow button to be reclicked now",
	});
	return _getHtmlForWebview(context, response);
}

async function updateAndCheckRequests(context: vscode.ExtensionContext) {
	// get the stored values from the workspace state
	let workspaceValues = await getConfigRequestValues(context);
	requestsThisMinute = parseInt(workspaceValues[0]);
	requestsPerDay = parseInt(workspaceValues[1]);
	lastResetDate = workspaceValues[2];

	logMessage(context, "Incrementing request values");
	if (
		requestsThisMinute >= REQUESTS_PER_MINUTE_LIMIT &&
		Date.now() - lastMinuteResetTime < MINUTE_IN_MILLISECONDS
	) {
		vscode.window.showErrorMessage(
			"You have reached the requests per minute limit"
		);
		logMessage(context, "You have reached the requests per minute limit");
		return false;
	}

	// check if the day has passed
	const today = new Date().toISOString().slice(0, 10);
	if (lastResetDate !== today) {
		requestsPerDay = 0;
		await resetRequestsPerDay(context);
	}

	if (requestsPerDay >= REQUESTS_PER_DAY_LIMIT) {
		vscode.window.showErrorMessage(
			"You have reached the requests per day limit"
		);
		logMessage(context, "You have reached the requests per day limit");
		return false;
	}

	if (
		requestsThisMinute > 0 &&
		Date.now() - lastMinuteResetTime > MINUTE_IN_MILLISECONDS
	) {
		requestsThisMinute = 0;
		await resetRequestsThisMinute(context);
		lastMinuteResetTime = Date.now();
	}

	requestsThisMinute++;
	requestsPerDay++;

	await setRequestValues(context, requestsThisMinute, requestsPerDay);

	return true;
}

async function getConfigRequestValues(context: vscode.ExtensionContext):Promise<string[]>{
	const config = vscode.workspace.getConfiguration("BEC");
	let storedRequestsThisMinute = config.get<number>("requestsThisMinute", -1);
	let storedRequestsPerDay = config.get<number>("requestsPerDay", -1);
	let storedLastResetDate = config.get<string>("lastResetDate", "");

	if (storedRequestsThisMinute === -1 || storedRequestsPerDay === -1 
        || storedLastResetDate === "" 
        || storedLastResetDate !== new Date().toISOString().slice(0, 10)) {
            await saveToGlobalConfig();
            storedRequestsThisMinute = 0;
            storedRequestsPerDay = 0;
            storedLastResetDate = new Date().toISOString().slice(0, 10);
        }


	return [
		storedRequestsThisMinute.toString(),
        storedRequestsPerDay.toString(),
        storedLastResetDate
	];
}

async function saveToGlobalConfig() {
	const config = vscode.workspace.getConfiguration("BEC");
	await config.update(
		"requestsThisMinute",
		0,
		vscode.ConfigurationTarget.Global
	);
	await config.update("requestsPerDay", 0, vscode.ConfigurationTarget.Global);
	await config.update(
		"lastResetDate",
		new Date().toISOString().slice(0, 10),
		vscode.ConfigurationTarget.Global
	);
}

async function resetRequestsThisMinute(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration("BEC"); 
    await config.update("requestsThisMinute", 0, vscode.ConfigurationTarget.Global);
}

async function resetRequestsPerDay(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration("BEC");
    await config.update("requestsPerDay", 0, vscode.ConfigurationTarget.Global);
    await config.update("lastResetDate", new Date().toISOString().slice(0, 10), vscode.ConfigurationTarget.Global);
}

async function setRequestValues(context: vscode.ExtensionContext, requestsThisMinute: number, requestsPerDay: number) {
    const config = vscode.workspace.getConfiguration("BEC");
    await config.update("requestsThisMinute", requestsThisMinute, vscode.ConfigurationTarget.Global);
    await config.update("requestsPerDay", requestsPerDay, vscode.ConfigurationTarget.Global);
}

