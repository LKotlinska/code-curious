<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import InlinePanel from './InlinePanel.svelte';
	import { faFloppyDisk, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import type { Action, VariableType } from '$lib/types';
	import { snapshot } from '$lib/stores/snapshots'; // Snapshot store

	export let editMode: boolean;
	export let isOpen: boolean;
	export let actionId;
	export let variableId;
	let variable: VariableType;

	// Hold the variables from the snapshot store
	let availableVariables = $snapshot.filter((v) => v.blockType === 'variable');

	// Actions multidimensional array. Each sub-array contains the action name and the type of value it requires.
	const actions: string[][] = [
		['create circle', 'string'],
		['create circles', 'array'],
		['create square', 'string'],
		['create triangle', 'string'],
		['increase', 'number'],
		['decrease', 'number'],
	];
	// Available actions for the current variable
	let availableActions: string[][] = actions;

	// Not all actions are associated with a variable
	if (variableId) {
		variable = { ...$snapshot.find((v) => v.id === variableId) };
		// Filter available actions based on the variable type
		availableActions = actions.filter((a) => a[1] === variable.type);
	}
	let action: Action;

	// Snapshot store
	$: _snapshot = $snapshot;

	// If in edit mode, get the action with the given ID
	if (editMode && actionId !== null) {
		// Clone the action to avoid directly modifying the store object
		action = { ...$snapshot.find((a) => a.id === actionId) };
		if (action.variableId) {
			// Get the type of the associated variable
			const type = getVariableType(action.variableId);
			// Filter available actions based on the variable type
			availableActions = actions.filter((a) => a[1] === type);
		}
	}
	// Else if not in edit mode but with existing variableId, create a new action
	else if (!editMode && variableId !== null) {
		action = {
			id: Date.now(),
			blockType: 'action',
			variableId: variableId,
			action: '',
		};
		// Filter available actions based on the variable type
		availableActions = actions.filter((a) => a[1] === variable.type);
	}
	// Else create a new action without a variable
	else {
		action = {
			id: Date.now(),
			blockType: 'action',
			action: '',
		};
	}

	// When action.variableId changes, update the available actions
	$: {
		if (action.variableId) {
			const type = getVariableType(action.variableId);
			availableActions = actions.filter((a) => a[1] === type);
		}
	}

	// When the snapshot store changes, update the available variables
	$: {
		availableVariables = $snapshot.filter((v) => v.blockType === 'variable');
	}

	const dispatch = createEventDispatcher();

	const closeModal = () => {
		dispatch('close');
	};

	const deleteAction = () => {
		$snapshot = _snapshot.filter((a) => a.id !== action.id);
		dispatch('close');
	};

	const onSave = () => {
		if (editMode) {
			$snapshot = _snapshot.map((a) => (a.id === action.id ? action : a));
			dispatch('close');
			return;
		} else {
			$snapshot = [..._snapshot, action];
		}
		dispatch('close');
	};

	function getVariableType(id: number) {
		const variable = $snapshot.find((v) => v.id === id);
		return variable ? variable.type : '';
	}
</script>

<InlinePanel {isOpen} on:close={closeModal}>
	<div slot="header" class="card-header flex justify-between items-start">
		<div class="flex flex-col">
			<h4 class="text-lg font-semibold">
				{!editMode ? 'New Action' : 'Edit Action'}
			</h4>
		</div>
		<button on:click={closeModal}><FontAwesomeIcon icon={faXmark} /></button>
	</div>
	<form
		slot="content"
		on:submit|preventDefault={onSave}
		class="px-4 flex flex-col gap-4 items-start"
	>
		<div class="flex gap-4">
			<!-- Variable select -->
			<div class="label">
				<span>Variable</span>
				<select name="variables" class="select p-1" bind:value={action.variableId} size={3}>
					{#each availableVariables as availableVar}
						<option value={availableVar.id}>{availableVar.name}</option>
					{/each}
				</select>
			</div>
			<!-- Action select -->
			<div class="label">
				<span>Action</span>
				<select name="action" class="select p-1" bind:value={action.action} size={3}>
					{#each availableActions as action}
						<option value={action[0]}>{action[0]}</option>
					{/each}
				</select>
			</div>
		</div>
		<!-- Hidden Submit Button -->
		<button type="submit" class="sr-only">Submit</button>
	</form>
	<div slot="footer">
		<div class="card-footer flex justify-between">
			{#if editMode}
				<button type="button" on:click={deleteAction} class="btn btn-sm bg-primary-700 flex gap-2">
					<FontAwesomeIcon icon={faTrash} /> Delete
				</button>
			{:else}
				<div></div>
			{/if}
			<div class="flex">
				<button on:click={closeModal} class="btn"> Cancel </button>
				<button on:click={onSave} class="btn btn-sm bg-secondary-700 flex gap-2">
					<FontAwesomeIcon icon={faFloppyDisk} /> Save
				</button>
			</div>
		</div>
	</div>
</InlinePanel>
