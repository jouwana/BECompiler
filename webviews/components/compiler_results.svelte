
<script lang="ts" nonce="">
import { onMount } from "svelte";


	let state = webviewState.state;

	let compilation_results = webviewState.compilation_results;

	let flow_results = webviewState.flow_results;

	let ai_results = webviewState.ai_results;

	let fullscreen = webviewState.fullscreen;



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
<button on:click={() => {
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

}}>
	{fullscreen? "Side View" : "Fullscreen View"}
</button>

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


