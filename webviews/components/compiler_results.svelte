<style>
	.main_container{
		font-family: Arial, sans-serif;
		padding: 20px;
		width: 90vw;
		color: blue !important;
	}


</style>

<script lang="ts">

</script>
<div class="main_container">
<h1>OCaml Compiler Result</h1>
<h2> tring out if doubl watched work</h2>
</div>

<button on:click={() =>{
	tsvscode.postMessage({
		command: 'onInfo',
		value: 'message from compiler_results.svelte'
	})
}}> info </button>