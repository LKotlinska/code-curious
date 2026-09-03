<script lang="ts">
	import { clearConsole, consoleOutput } from '$lib/utils/consoleActions';
	import { isRunning } from '$lib/stores/store';
	import { fade } from 'svelte/transition';
	import type { Log } from '$lib/types';

	import {
		formatArray,
		formatObject,
		formatObjectSummary,
		formatValue,
	} from '$lib/utils/logFormat';

	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

	interface Props {
		expanded?: boolean;
	}

	let { expanded = false }: Props = $props();

	// Function to retrieve and return any selected variable from snapshot
	const getVariableToLog = (log: Log): any => {
		let variableToLog = log.value;
		return variableToLog;
	};

	// Function to scroll the console container to the bottom
	let consoleScrollContainer: HTMLDivElement | null = $state(null);
	let consoleContainer: HTMLDivElement | null = $state(null);

	function scrollToBottom() {
		// Scroll to bottom of console container, after short delay
		// to allow for rendering of new logs
		setTimeout(() => {
			if (consoleScrollContainer) {
				consoleScrollContainer.scrollTop = consoleScrollContainer.scrollHeight;
			}
		}, 100);
	}

	$effect(() => {
		if ($consoleOutput || !expanded) {
			scrollToBottom();
		}
	});
</script>

<div
	bind:this={consoleScrollContainer}
	class="{expanded ? 'h-[60vh] lg:h-[40vh]' : 'h-[100px] lg:h-[7vh]'} overflow-y-scroll"
>
	<div bind:this={consoleContainer} class="p-4 flex flex-col gap-2 mb-[40px] lg:mb-0">
		{#each $consoleOutput as log}
			<p>
				<code>
					{#if log.message && log.message !== ''}
						{#if log.indicateStopped}
							<span class="opacity-50">{log.message}</span>
						{:else if log.indicateRunning}
							<span class="opacity-50">{log.message}</span>
						{:else}
							{log.message}
						{/if}
					{/if}
					<!-- Selected variable is string, number, boolean: -->
					{#if log.selectedId && log.selectedType !== 'array' && log.selectedType !== 'object'}
						{@html formatValue(getVariableToLog(log))}

						<!-- Selected variable is array of objects with index and key: -->
					{:else if log.selectedId && log.selectedType === 'array' && log.useIndex && log.useKey && log.selectedIndex !== null && log.selectedKey !== null}
						{@html formatValue(getVariableToLog(log)[log.selectedIndex][log.selectedKey])}

						<!-- Selected variable is array with index: -->
					{:else if log.selectedId && log.selectedType === 'array' && log.useIndex && !log.useKey && log.selectedIndex !== null}
						<!-- Check that the item is not an object -->
						{#if typeof getVariableToLog(log)[log.selectedIndex] !== 'object'}
							{@html formatValue(getVariableToLog(log)[log.selectedIndex])}
						{/if}
						<!-- Selected variable is object with key: -->
					{:else if log.selectedId && log.selectedType === 'object' && log.useKey && log.selectedKey !== null}
						{@html formatValue(getVariableToLog(log)[log.selectedKey])}
					{/if}
				</code>
			</p>
			{#if log.selectedId && log.selectedType === 'array' && !log.useIndex}
				<!-- Selected variable is array without index -->
				<details>
					<summary><code>{@html formatArray(getVariableToLog(log)).summary}</code></summary>
					<pre><code>{@html formatArray(getVariableToLog(log)).details}</code></pre>
				</details>
			{/if}
			<!-- Selected variable is object without key: -->
			{#if log.selectedId && log.selectedType === 'object' && !log.useKey}
				<details>
					<summary>
						<code>{@html formatObjectSummary(getVariableToLog(log))}</code>
					</summary>
					<pre><code>{@html formatObject(getVariableToLog(log))}</code></pre>
				</details>
			{/if}
			<!-- Selected variable is object in array with index, without key: -->
			{#if log.selectedId && log.selectedType === 'array' && log.useIndex && !log.useKey && log.selectedIndex !== null}
				<!-- Check that the item is an object -->
				{#if typeof getVariableToLog(log)[log.selectedIndex] === 'object'}
					<details>
						<summary>
							<code>{@html formatObjectSummary(getVariableToLog(log)[log.selectedIndex])}</code>
						</summary>
						<pre><code>{@html formatObject(getVariableToLog(log)[log.selectedIndex])}</code></pre>
					</details>
				{/if}
			{/if}
			<hr class="opacity-50" />
		{/each}
		{#if expanded && $consoleOutput.length > 0}
			<div class="flex justify-end">
				<button in:fade={{ duration: 300 }} class="btn" onclick={clearConsole}
					><FontAwesomeIcon icon={faTrashCan} /><span class="sr-only">Clear Console</span></button
				>
			</div>
		{/if}
	</div>
</div>
