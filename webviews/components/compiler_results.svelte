<style>
	.main_container{
		font-family: Arial, sans-serif;
		padding: 20px;
		width: 90vw;
		text-align: center;
	}
	.hidden{
		display: none;
	}
	.button_header{
		display: flex;
		justify-content: center;
		flex-direction: row;
	}

</style>

<script lang="ts">
	let state = 'main_results';
</script>

<div class="main_container">
<h1>Better Errors Compiler</h1>
<h4>run you code, better errors and more</h4>
</div>
<div class="button_header">
<button on:click={() =>{
	tsvscode.postMessage({
		command: 'recompile',
		value: 'recompiling from saved file path'
	});
}}> recompile file </button>
<button class:hidden={state === 'main_results'}> interpreter results </button>
<button on:click={() =>{
	tsvscode.postMessage({
		command: 'flow',
		value: 'checking flow type errors'
	});
}}> check flow type errors </button>
<button on:click={() =>{
	tsvscode.postMessage({
		command: 'runLLM',
		value: 'run LLM for errors'
	});
}}> AI error details </button>

</div>
