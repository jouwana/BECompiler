import * as vscode from "vscode";
import { logMessage } from "./helpers";
import { PROMPT_REQUEST_EXPLANATION, PRMOPT_PRE_CODE, PRMOPT_PRE_ERROR, PROMPT_RESPONSE_DESIGN, PROMPT_HEADER, ERRORS_NOT_SEPARATED_FROM_CODE, PARSE_PROMPT_HEADER, PARSE_PROMPT_REQUEST_EXPLANATION, PARSE_PROMPT_RESPONSE_DESIGN, PARSE_PRE_AST } from "./consts";
import { GoogleGenerativeAI, GoogleGenerativeAIError } from "@google/generative-ai";

const AWANLLM_API_KEY = "b79fefdf-fd1e-48cb-b943-c560c240916b";
const GEMMA_API_KEY = "AIzaSyAjvF9UQP7c8B7o4SiMM_-qlipEWna062o";

const genAI = new GoogleGenerativeAI(GEMMA_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});
// const model = genAI.getGenerativeModel({ model: "gemini-pro" });	

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

export let sendGeminiRequest = async (context: vscode.ExtensionContext, code: string, errors: string, treeParse?:boolean): Promise<string> => {
	let prompt = ''
	if(treeParse === true){
		prompt = PARSE_PROMPT_HEADER + PARSE_PROMPT_REQUEST_EXPLANATION + PARSE_PROMPT_RESPONSE_DESIGN + PARSE_PRE_AST + code;
	}
	else{
		prompt = PROMPT_HEADER +
			PROMPT_REQUEST_EXPLANATION;

		if (errors !== "") {
			prompt +=
				PRMOPT_PRE_CODE +
				code +
				PRMOPT_PRE_ERROR +
				errors;
		}
		else{
			prompt += ERRORS_NOT_SEPARATED_FROM_CODE +
			PRMOPT_PRE_CODE +
			code;
		}
		prompt += PROMPT_RESPONSE_DESIGN;
	}
	console.log("sending to api, time:" + Date.now());
	logMessage(context, "Sent request to Google Generative AI");

	try{
	const result = await model.generateContent(prompt);
	const response = result.response;
	let text = response.text();
	logMessage(context, "Recieved response from Google Generative AI");
	//if text starts with ```html or ```json, remove it and the ``` at the end
	if (text.startsWith("```html") || text.startsWith("```json")) {
		text = text.slice(7, text.length - 3);
	}
    return text;
	}
	catch(error: any){
		let my_error = error as GoogleGenerativeAIError;
		logMessage(context, `Error sending request to Google Generative AI, error message is: ${my_error.message}
			\n error cause is: ${my_error.cause}`);

		vscode.window.showErrorMessage(
			"Error sending request to Google Generative AI",
			my_error.message
		);
		return `Unexpected error occurred, ${my_error.message} \n. Please try again later.`;
	}
}
