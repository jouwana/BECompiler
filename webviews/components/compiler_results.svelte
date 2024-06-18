
<script lang="ts" nonce="">
import { onMount } from "svelte";


	let state = webviewState.state;

	let compilation_results = webviewState.compilation_results;

	let flow_results = webviewState.flow_results;

	let ai_results = webviewState.ai_results;

	let fullscreen = webviewState.fullscreen;

	let ast_was_called = false;

	function collapsibleClickHandler(this: HTMLElement) {
		this.classList.toggle("active");
		const content = this.nextElementSibling as HTMLElement;
		if (content.style.display !== "none") {
			content.style.display = "none";
		} else {
			content.style.display = "block";
		}
	}

	let setupAIButtonFunctions = () => {
		const coll = document.getElementsByClassName("collapsible");
		for (let i = 0; i < coll.length; i++) {
			coll[i].addEventListener("click", collapsibleClickHandler);
		}
	}

	onMount(() => {
		window.addEventListener('DOMContentLoaded', () => {
			setupAIButtonFunctions();
		});

		// Handle messages sent from the extension to the webview
		window.addEventListener('message', event => {
			const message = event.data; // The json data that the extension sent
			switch (message.command) {
				case 'compilation_results':{
					compilation_results = '<pre>' + message.value + '</pre>';
					state = 'main_results';
					break;
				}
				case 'flow_results':{
					flow_results = message.value;
					state = 'flow_results';
					break;
				}
				case 'ai_results':{
					ai_results = message.value;
					state = 'ai_results';
					setTimeout(() => {
						setupAIButtonFunctions();
					}, 200);
					break;
				}
				case 'ast':{
					ast_was_called = false;
					break;
				}
			}
		});
	});

</script>


<div class="main_header">
<h1>Better Errors Compiler</h1>
<h4>run your code, better errors and more</h4>
<button on:click={() =>{
	tsvscode.postMessage({
		command: 'recompile',
		value: 'recompiling from saved file path'
	});
	state = 'loading';
	ai_results = "";
	compilation_results = "";
	flow_results = "";
}}> recompile file </button>
<button class:disabled={ast_was_called} on:click={() => {
	ast_was_called = true;
	tsvscode.postMessage({
		command: 'ast',
		value: ""
	});
}}> View AST Interactive Graph </button>
</div>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<img class='fullscreen_clicker' on:click={() => {
	fullscreen = !fullscreen;
	tsvscode.postMessage({
		command: 'toggleFullscreen',
		value: {
			fullscreen: fullscreen,
			compilation_results: compilation_results,
			flow_results: flow_results,
			ai_results: ai_results,
			state: state
		}
	});
	}}
	src={
		fullscreen ?
		"https://cdn-icons-png.freepik.com/512/11704/11704023.png?ga=GA1.1.385513806.1718653428" :
		"https://cdn-icons-png.freepik.com/512/11704/11704401.png?ga=GA1.1.385513806.1718653428"
	}
	alt="toggle fullscreen">

<div class="button_header">
	<button class:disabled={state == 'main_results'} on:click={() => {
		state = 'main_results';
	}}> interpreter results </button>

	<button class:disabled={state == 'flow_results'} on:click={() =>{
		if(flow_results != ""){
			state = 'flow_results';
			return;
		}
		tsvscode.postMessage({
			command: 'flow',
			value: 'checking flow type errors'
		});
		state = 'loading';
	}}> flow type errors </button>

	<button class:disabled={state == 'ai_results'} on:click={() =>{
		if(ai_results != ""){
			state = 'ai_results';
			return;
		}

		tsvscode.postMessage({
			command: 'runLLM',
			value: compilation_results
		});
		state = 'loading';
	}}> AI error details </button>

</div>


<pre class:hidden={state != 'main_results'} class="main_container">
	{@html compilation_results}
</pre>

<div class:hidden={state != 'flow_results'} class="main_container">
	<pre>{flow_results}</pre>
</div>

<div class:hidden={state != 'ai_results'} class="resp main_container">
	<a class:hidden={ai_results.startsWith("<h2>No Errors")}
	href = "#" on:click={() => {
		ai_results = "";
		state = 'loading';
		tsvscode.postMessage({
			command: 'runLLM',
			value: compilation_results
		});
	}}> Not Satisfied With The Results? Try Again</a>
	{@html ai_results}
</div>

<div class:hidden={state != 'loading'} class="main_container">
	<br>
	<h1>loading...</h1>
	<br>
	<br>
	<div class="loader"></div>
</div>


