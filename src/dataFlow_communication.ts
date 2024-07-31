import * as vscode from 'vscode';
import { ResultPanel } from './panelProvider';
import { fixSomeTooManyTabs, highlightUnknownTypes, replaceGTsymbols, replaceLTsymbols } from './helpers';
import * as child_process from 'child_process';
import { logMessage } from './helpers';
import * as fs from 'fs';

let server:child_process.ChildProcessWithoutNullStreams;
let SBTServerRunning = false;

let dealWithServerResponse = (context: vscode.ExtensionContext, response: string) => {
	if (
		response.includes(
			"Neither build.sbt nor a 'project' directory in the current directory"
		)
	) {
		vscode.window.showErrorMessage(
			"No Server In Directory.\n" +
				" You can run the server yourself manually\n" +
				" OR After setting up the server the first time, copy the contents to the folder " +
				"'server' in the extension directory to enable auto mode"
		);
		server.stdin.write("exit\n");
	} else if (
		response.includes("sbt:hmloc") &&
		!SBTServerRunning
	) {
		SBTServerRunning = true;
		vscode.window.showInformationMessage("SBT activated, starting server");
		server.stdin.write("run\n");
	} else if (response.includes("Server online")) {
		vscode.window.showInformationMessage("DataFlow Server started");
	} else if (response.includes("Bind failed for TCP channel on endpoint")) {
		vscode.window.showErrorMessage(
			"DataFlow Server PORT is already in use. \n" +
				"The Server could be online, in this case ignore this error. \n" +
				"OR another server is using the port, in which case close that server"
		);
	} else if (response.toString().toLowerCase().includes("error")) {
		vscode.window.showInformationMessage("DataFlow Server Error:\n" + response);
	}
}


export let runServer = (context: vscode.ExtensionContext): void => {
	//get the path of the vscode extension with folder 'server'
	const path = context.asAbsolutePath("server");

	const buildSBTPath = path + "/build.sbt";

	// check if the server folder exists or if empty
	if(!fs.existsSync(buildSBTPath)){
		vscode.window.showErrorMessage("DataFlow Server not found in extension directory!! Run it manually "+
			"or copy the server folder contents to the extension directory");
		return;
	}

	vscode.window.showInformationMessage("Starting SBT Server");


	// all the flags are so that it force runs and doesnt server lock
	server = child_process.spawn(
		"sbt --no-server --batch -Dsbt.server.forcestart=true",
		{ cwd: path, shell: true }
	);

	// log the output of the command
	server.stdout.on('data', (data) => {
		logMessage(context, `stdout: ${data}`);
		dealWithServerResponse(context, data.toString());
	});

	// log the error of the command
	server.stderr.on('data', (data) => {
		logMessage(context, `stderr: ${data}`);
		vscode.window.showErrorMessage("DataFlow Server error:\n" + data);
	});

	// log the closing of the command
	server.on('close', (code) => {
		logMessage(context, `child process exited with code ${code}`);
	});


}

export async function getDataflow(
	context: vscode.ExtensionContext,
	path: string,
	panel: vscode.WebviewPanel
): Promise<any> {
	let response = await fetchDataFlow(path);
	response = highlightUnknownTypes(response);
	response = fixSomeTooManyTabs(response);


	ResultPanel.inProcess.DataFlow = false;
	panel.webview.postMessage({
		command: "flow_results",
		value: response,
	});
}

async function fetchDataFlowTestRun(number: number): Promise<any> {
	const url = `http://localhost:8080/runTest/${number}`;
	try {
		const response = await fetch(url);
		//check response status
		if (!response.ok) {
			throw new Error('Network response was not ok.<br>status: ' + response.status +
				'<br>' + response.statusText
			);
		}
		const data:any = await response.text();
		return data;
	} catch (error: any) {
		console.error('Error:', error);
		return error.message;
	}
}

async function fetchDataFlow(path: string) {
	//chane all '\' in path to $
	path = path.replace(/\\/g, "$");
	const url = `http://localhost:8080/runPath/${path}`;
	try {
		const response = await fetch(url);
		//check response status
		if (!response.ok) {
			throw new Error('Network response was not ok.<br>status: ' + response.status +
				'<br>' + response.statusText
			);
		}
		const data:any = await response.text();
		return data;
	} catch (error: any) {
		console.error('Error:', error);
		return error.message;
	}
	return
}