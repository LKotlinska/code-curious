<script lang="ts">
	import InlinePanel from './InlinePanel.svelte';
	import {
		faExclamationTriangle,
		faFloppyDisk,
		faTrash,
		faXmark,
	} from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import type { NumberVariable } from '$lib/types';
	import { snapshot } from '$lib/stores/snapshots'; // Snapshot store
	import { checkIfDeletable } from '$lib/utils/checkIfDeletable';

	interface Props {
		editMode: boolean;
		isOpen: boolean;
		variableId: any;
		onclose: () => void;
	}

	let { editMode, isOpen, variableId, onclose }: Props = $props();

	function buildVariable(): NumberVariable {
		if (variableId !== undefined) {
			return $snapshot.find((v) => v.id === variableId) as NumberVariable;
		}
		return { id: Date.now(), blockType: 'variable', name: '', type: 'number', value: 0 };
	}

	let variable = $state<NumberVariable>(buildVariable());
	let errorMsg = $state('');

	let _snapshot = $derived($snapshot);

	const closeModal = () => {
		onclose();
	};

	const deleteVariable = () => {
		if (!checkIfDeletable(variable.id)) {
			errorMsg = 'This variable is being used in another code block';
			return;
		}
		$snapshot = _snapshot.filter((v) => v.id !== variable.id);
		onclose();
	};

	const onSave = () => {
		// Add default name and or value, if empty
		if (variable.name === '') variable.name = 'new number';
		if (!variable.value) variable.value = 0;
		if (editMode) {
			$snapshot = _snapshot.map((v) => (v.id === variable.id ? variable : v));
			onclose();
			return;
		} else {
			// Add variable to snapshot store
			$snapshot = [..._snapshot, variable];
		}
		onclose();
	};

	const handleNameChange = (event: Event) => {
		variable.name = (event.target as HTMLInputElement).value;
	};

	const handleValueChange = (event: Event) => {
		if (isNaN(parseInt((event.target as HTMLInputElement).value))) {
			return;
		}
		variable.value = parseInt((event.target as HTMLInputElement).value);
	};
</script>

<InlinePanel {isOpen} onclose={closeModal}>
	{#snippet header()}
		<div class="card-header flex justify-between items-start">
			<div class="flex flex-col">
				{#if editMode}
					<h3 class="text-sm text-secondary-500">Number</h3>
				{/if}
				<h4 class="text-lg font-semibold">
					{editMode ? variable.name : 'New Number'}
				</h4>
			</div>
			<button onclick={closeModal}><FontAwesomeIcon icon={faXmark} /></button>
		</div>
	{/snippet}
	{#snippet content()}
		<form
			onsubmit={(e) => {
				e.preventDefault();
				onSave();
			}}
			class="px-4 flex flex-col gap-4 items-start"
		>
			<!-- Variable Name Input -->
			<label class="label">
				<span>Label</span>
				<input
					class="input"
					type="text"
					bind:value={variable.name}
					oninput={handleNameChange}
					name="name"
					autocomplete="off"
					required
					maxlength="25"
				/>
			</label>
			<!-- Value Input -->
			<label class="label">
				<span>Value</span>
				<input
					class="input"
					type="number"
					min="0"
					max="9999"
					bind:value={variable.value}
					oninput={handleValueChange}
					name="number"
					required
				/>
			</label>
			<!-- Hidden Submit Button -->
			<button type="submit" class="sr-only">Submit</button>
		</form>
	{/snippet}
	{#snippet footer()}
		<div>
			<div class="card-footer flex flex-col">
				<div class="flex justify-between">
					{#if editMode}
						<button
							type="button"
							onclick={deleteVariable}
							class="btn btn-sm bg-primary-700 flex gap-2"
						>
							<FontAwesomeIcon icon={faTrash} /> Delete
						</button>
					{:else}
						<div></div>
					{/if}
					<div class="flex">
						<button onclick={closeModal} class="btn"> Cancel </button>
						<button onclick={onSave} class="btn btn-sm bg-secondary-700 flex gap-2">
							<FontAwesomeIcon icon={faFloppyDisk} /> Save
						</button>
					</div>
				</div>
				{#if errorMsg !== ''}
					<aside
						class="mt-4 flex flex-col items-start gap-2 rounded-lg border border-error-500 bg-error-500/20 p-4"
					>
						<p class="flex gap-4 items-center text-sm sm:text-lg">
							<span class="hidden sm:inline-block"
								><FontAwesomeIcon icon={faExclamationTriangle} /></span
							>{errorMsg}
						</p>
					</aside>
				{/if}
			</div>
		</div>
	{/snippet}
</InlinePanel>
