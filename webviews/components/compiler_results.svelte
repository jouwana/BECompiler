<style>
	.main_container{
		font-family: Arial, sans-serif;
		padding: 20px;
		width: 90vw;
		min-height: 30vh;
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
	}
	.main_header{
		font-family: Arial, sans-serif;
		padding: 20px;
		width: 90vw;
		text-align: center;
	}
	.hidden{
		display: none !important;
	}
	.button_header{
		display: flex;
		justify-content: center;
		flex-direction: row;
		width: 90vw;
		padding: 20px;
	}
	.disabled{
		pointer-events: none !important;
		background-color: #3498db;
	}
	.loader {
		border: 16px solid #f3f3f3; /* Light grey */
		border-top: 16px solid #3498db; /* Blue */
		border-radius: 50%;
		width: 120px;
		height: 120px;
		animation: spin 2s linear infinite;
		}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	.resp {
		display: flex;
		flex-direction: column;
		overflow-wrap: break-word;
		width: inherit;
	}
	.resp pre{
		text-wrap: pretty;
	}

	.resp div{
		width: 90vw;
	}
	code {
		text-wrap: pretty;
	}

</style>

<script lang="ts" nonce="">
import { onMount } from "svelte";

	let state = 'loading';

	let compilation_results = "";

	let flow_results = "";

	let ai_results = "";


	onMount(() => {
		// Handle messages sent from the extension to the webview
		window.addEventListener('message', event => {
			const message = event.data; // The json data that the extension sent
			switch (message.command) {
				case 'compilation_results':{
					compilation_results = message.value;
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
						console.log("collapsible in here");
						const coll = document.getElementsByClassName("collapsible");
						for (let i = 0; i < coll.length; i++) {
							coll[i].addEventListener("click", collapsibleClickHandler);
							
							//get next element and set transition speed
							const content = coll[i].nextElementSibling as HTMLElement;
							content.style.transition = "max-height 0.2s ease-out";
							content.style.paddingTop = "20px";
							

							//get parent element and set width and padding
							const parent = coll[i].parentElement as HTMLElement;
							parent.style.width = "90vw";
							parent.style.padding = "20px";
						}
					}, 200);
					break;
				}
			}
		});
	});

	function collapsibleClickHandler(this: HTMLElement) {
		console.log("collapsible clicked");
		this.classList.toggle("active");
		const content = this.nextElementSibling as HTMLElement;
		if (content.style.display !== "none") {
			content.style.display = "none";
		} else {
			content.style.display = "block";
		}
	}

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
</div>

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
	}}> check flow type errors </button>

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
	{compilation_results}
</pre>

<div class:hidden={state != 'flow_results'} class="main_container">
	{flow_results}
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


