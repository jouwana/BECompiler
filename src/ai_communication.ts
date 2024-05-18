import * as vscode from "vscode";
import { logMessage } from "./helpers";
import { PROMPT_REQUEST_EXPLANATION, PRMOPT_PRE_CODE, PRMOPT_PRE_ERROR, PROMPT_RESPONSE_DESIGN, PROMPT_HEADER } from "./consts";
const { GoogleGenerativeAI } = require("@google/generative-ai");

const AWANLLM_API_KEY = "b79fefdf-fd1e-48cb-b943-c560c240916b";
const GEMMA_API_KEY = "AIzaSyAjvF9UQP7c8B7o4SiMM_-qlipEWna062o";

const genAI = new GoogleGenerativeAI(GEMMA_API_KEY);
// For text-only input, use the gemini-pro model
const model = genAI.getGenerativeModel({ model: "gemini-pro"});
	

export async function sendAwanllmRequest(context: vscode.ExtensionContext, code: string, errors: string): Promise<string> {
	const prompt =
		PROMPT_HEADER +
		PROMPT_REQUEST_EXPLANATION +
		PRMOPT_PRE_CODE +
		code +
		PRMOPT_PRE_ERROR +
		errors +
		PROMPT_RESPONSE_DESIGN;
	try {
        logMessage(context, "API KEY: " + AWANLLM_API_KEY);
		let response: any = await fetch("https://api.awanllm.com/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${AWANLLM_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "Awanllm-Llama-3-8B-Dolfin",
				messages: [{ role: "user", content: prompt}],
			}),
		}).then((response) => response.json());
        logMessage(context, "Sent request to OpenAI");
        logMessage(context, response.choices[0].message.content);
        return response.choices[0].message.content;
	} catch (error) {
		logMessage(context, "Error sending request to AwanLLM");
        vscode.window.showErrorMessage("Error sending request to AwanLLM");
		throw error;
	}
}

export async function sendGeminiRequest(context: vscode.ExtensionContext, code: string, errors: string): Promise<string> {
	const prompt =
		PROMPT_HEADER +
		PROMPT_REQUEST_EXPLANATION +
		PRMOPT_PRE_CODE +
		code +
		PRMOPT_PRE_ERROR +
		errors +
		PROMPT_RESPONSE_DESIGN;

	const result = await model.generateContent(prompt);
	const response = await result.response;
	const text = response.text();
	logMessage(context, "Sent request to Google Generative AI");
    logMessage(context, text);
    return text;
}

//function that turns objects to string
function stringify(obj: any): string {
    return JSON.stringify(obj, null, 2);
}