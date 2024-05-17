import * as vscode from 'vscode';

export async function getConfigRequestValues(context: vscode.ExtensionContext):Promise<string[]>{
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


export async function resetRequestsThisMinute(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration("BEC"); 
    await config.update("requestsThisMinute", 0, vscode.ConfigurationTarget.Global);
}

export async function resetRequestsPerDay(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration("BEC");
    await config.update("requestsPerDay", 0, vscode.ConfigurationTarget.Global);
    await config.update("lastResetDate", new Date().toISOString().slice(0, 10), vscode.ConfigurationTarget.Global);
}

export async function setRequestValues(context: vscode.ExtensionContext, requestsThisMinute: number, requestsPerDay: number) {
    const config = vscode.workspace.getConfiguration("BEC");
    await config.update("requestsThisMinute", requestsThisMinute, vscode.ConfigurationTarget.Global);
    await config.update("requestsPerDay", requestsPerDay, vscode.ConfigurationTarget.Global);
}

