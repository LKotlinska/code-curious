<script lang="ts">
	import InlinePanel from './InlinePanel.svelte';
	import { faFloppyDisk, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import type { Action } from '$lib/types';
	import { snapshot } from '$lib/stores/snapshots'; // Snapshot store

	interface Props {
		editMode: boolean;
		isOpen: boolean;
		actionId: any;
		variableId: any;
		onclose: () => void;
	}

	let { editMode, isOpen, actionId, variableId, onclose }: Props = $props();

	// Actions multidimensional array. Each sub-array contains the action name and the type of value it requires.
	const actions: string[][] = [
		['create circle', 'string'],
		['create circles', 'array'],
		['create square', 'string'],
		['create triangle', 'string'],
		['increase', 'number'],
		['decrease', 'number'],
	];

	function buildAction(): Action {
		// In edit mode, clone the action to avoid directly modifying the store object
		if (editMode && actionId !== null) {
			return { ...$snapshot.find((a) => a.id === actionId) } as Action;
		}
		// Not in edit mode but with an existing variableId: create a new action for it
		if (!editMode && variableId !== null) {
			return { id: Date.now(), blockType: 'action', variableId, action: '' };
		}
		// Otherwise create a new action without a variable
		return { id: Date.now(), blockType: 'action', action: '' };
	}

	let action = $state<Action>(buildAction());

	// Snapshot store
	let _snapshot = $derived($snapshot);

	// Variables available to attach an action to
	let availableVariables = $derived($snapshot.filter((v) => v.blockType === 'variable'));

	// Actions available for the currently selected variable (all actions when none is selected)
	let availableActions = $derived.by(() => {
		if (action.variableId) {
			const type = getVariableType(action.variableId);
			return actions.filter((a) => a[1] === type);
		}
		return actions;
	});

	const closeModal = () => {
		onclose();
	};

	const deleteAction = () => {
		$snapshot = _snapshot.filter((a) => a.id !== action.id);
		onclose();
	};

	const onSave = () => {
		if (editMode) {
			$snapshot = _snapshot.map((a) => (a.id === action.id ? $state.snapshot(action) : a));
			onclose();
			return;
		} else {
			$snapshot = [..._snapshot, $state.snapshot(action)];
		}
		onclose();
	};

	function getVariableType(id: number) {
		const variable = $snapshot.find((v) => v.id === id);
		return variable ? variable.type : '';
	}
</script>

<InlinePanel {isOpen} onclose={closeModal}>
	{#snippet header()}
		<div class="card-header flex justify-between items-start">
			<div class="flex flex-col">
				<h4 class="text-lg font-semibold">
					{!editMode ? 'New Action' : 'Edit Action'}
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
			<div class="flex gap-4 flex-col sm:flex-row w-full">
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
	{/snippet}
	{#snippet footer()}
		<div>
			<div class="card-footer flex justify-between">
				{#if editMode}
					<button type="button" onclick={deleteAction} class="btn btn-sm bg-primary-700 flex gap-2">
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
		</div>
	{/snippet}
</InlinePanel>
