import * as vscode from 'vscode';
import { logMessage, checkOCamlInstallation, 
	 getInstallInstructions,
	 isOcamlFileType, 
 } from './helpers';
import { runChildExec, runChildSpawn, runChildSpawnSimplified } from './compilers';
import { getConfigRequestValues, resetRequestsPerDay, 
	resetRequestsThisMinute, setRequestValues } from './ai_helpers';
import { sendAwanllmRequest, sendGeminiRequest } from './ai_communication';
import { generateWebViewContent } from './panels';

let statusBar: vscode.StatusBarItem;
let requestsThisMinute: number = 0;
let requestsPerDay: number = 0;
let lastResetDate: string = "";
let lastMinuteResetTime: number = Date.now();

const REQUESTS_PER_MINUTE_LIMIT: number = 10;
const REQUESTS_PER_DAY_LIMIT: number = 100;
const MINUTE_IN_MILLISECONDS: number = 60000;


export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "BEC" is now active!');
	logMessage(context, 'Congratulations, your extension "BEC" is now active!');

	setupStatusBarButton(context);


	if (!checkOCamlInstallation()) {
		vscode.window.showErrorMessage(
			"OCaml is not installed. " + getInstallInstructions()
		);
		logMessage(context, "OCaml is not installed. " + getInstallInstructions());
		return;
	}

	// get the stored values from the workspace state
	let workspaceValues = await getConfigRequestValues(context);
	requestsThisMinute = parseInt(workspaceValues[0]);
	requestsPerDay = parseInt(workspaceValues[1]);
	lastResetDate = workspaceValues[2];


	// register command that only increments the values and checks limits
	let incrementRequestDisposable = vscode.commands.registerCommand(
		"BEC.incrementRequest",
		async () => {
			logMessage(context, "Incrementing request values");
			if (
				requestsThisMinute >= REQUESTS_PER_MINUTE_LIMIT &&
				Date.now() - lastMinuteResetTime < MINUTE_IN_MILLISECONDS
			) {
				vscode.window.showErrorMessage(
					"You have reached the requests per minute limit"
				);
				logMessage(context, "You have reached the requests per minute limit");
				return;
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
				return;
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

			//let response = await sendAwanllmRequest("Hello", context);
			let response = await sendGeminiRequest(context);
			//use the generated web panel with no error no warning only output
			let panel = vscode.window.createWebviewPanel(
				"better-errors",
				"Better Errors",
				vscode.ViewColumn.Beside,
				{ enableScripts: true }
			);
			panel.webview.html = generateWebViewContent(context, "", "", response);

		}
	);

	let ocamlCompilerDisposable = vscode.commands.registerCommand(
		"BEC.compileOCaml",
		async () => {
			const ocamlFile = vscode.window.activeTextEditor?.document.uri.fsPath;
			if (
				!ocamlFile ||
				!isOcamlFileType(vscode.window.activeTextEditor?.document)
			) {
				vscode.window.showErrorMessage("No OCaml file opened");
				return;
			}

			// easy to show error messages in, but shows just the number values if evaluation
			// and does not show what it evaluated, and there is no space between different evaluations
			let withoutErrors = runChildExec(context, ocamlFile);

			if (withoutErrors) {
				// to show manual complex evaluation in, but error messages are about the wrong lines
				// as i had to manually add in the extra lines and print statements
				runChildSpawn(context, ocamlFile);
			}

			// shows the 'val' evaluations, but no space after let evaluations
			// better than the first one, but checks stdout for errors using text search
			runChildSpawnSimplified(context, ocamlFile);
		}
	);

	context.subscriptions.push(ocamlCompilerDisposable);
	context.subscriptions.push(incrementRequestDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
		statusBar.dispose();
}

function updateStatusBarVisibility() {
	if (vscode.window.activeTextEditor && isOcamlFileType(vscode.window.activeTextEditor.document)) {
		statusBar.show();
	} else {
		statusBar.hide();
	}
}

function setupStatusBarButton(context: vscode.ExtensionContext) {
	statusBar = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		1
	);
	statusBar.command = "BEC.compileOCaml";
	statusBar.text = "$(debug-console) BEC";
	statusBar.tooltip = "Compile OCaml code with Better Errors";
	statusBar.backgroundColor = new vscode.ThemeColor(
		"statusBarItem.errorBackground"
	);

	// Register event listeners
	vscode.window.onDidChangeActiveTextEditor(
		updateStatusBarVisibility,
		null,
		context.subscriptions
	);
	vscode.workspace.onDidOpenTextDocument(
		updateStatusBarVisibility,
		null,
		context.subscriptions
	);
	vscode.workspace.onDidCloseTextDocument(
		updateStatusBarVisibility,
		null,
		context.subscriptions
	);

	// Initial update of the status bar visibility
	updateStatusBarVisibility();

	context.subscriptions.push(statusBar);
}
