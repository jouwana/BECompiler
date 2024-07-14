import * as vscode from 'vscode';
import { ResultPanel } from './panelProvider';
import { fixSomeTooManyTabs, highlightUnknownTypes, replaceGTsymbols, replaceLTsymbols } from './helpers';


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