<script lang="ts">
	import InlinePanel from './InlinePanel.svelte';
	import {
		faExclamationTriangle,
		faFloppyDisk,
		faTrash,
		faXmark,
	} from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import type { BooleanVariable } from '$lib/types';
	import { snapshot } from '$lib/stores/snapshots'; // Snapshot store
	import { checkIfDeletable } from '$lib/utils/checkIfDeletable';

	import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';

	interface Props {
		editMode: boolean;
		isOpen: boolean;
		variableId: any;
		onclose: () => void;
	}

	let { editMode, isOpen, variableId, onclose }: Props = $props();

	function buildVariable(): BooleanVariable {
		if (variableId) {
			return $snapshot.find((v) => v.id === variableId) as BooleanVariable;
		}
		return { id: Date.now(), blockType: 'variable', name: '', type: 'boolean', value: false };
	}

	let variable = $state<BooleanVariable>(buildVariable());
	let errorMsg = $state('');

	// The value of the radio button must be a string. Is converted to boolean when saving.
	let _boolString = $state(variable.value ? 'true' : 'false');

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
		if (variable.name === '') variable.name = 'new boolean';
		if (!variable.value) variable.value = false;
		if (editMode) {
			// Convert string to boolean and update variable value
			variable.value = _boolString === 'true';
			$snapshot = _snapshot.map((v) => (v.id === variable.id ? variable : v));
			onclose();
			return;
		} else {
			// Convert string to boolean and update variable value
			variable.value = _boolString === 'true';
			// Add variable to snapshot store
			$snapshot = [..._snapshot, variable];
		}
		onclose();
	};

	const handleNameChange = (event: Event) => {
		variable.name = (event.target as HTMLInputElement).value;
	};

	const handleValueChange = (value: string) => {
		_boolString = value;
	};
</script>

<InlinePanel {isOpen} onclose={closeModal}>
	{#snippet header()}
		<div class="card-header flex justify-between items-start">
			<div class="flex flex-col">
				{#if editMode}
					<h3 class="text-sm text-secondary-500">Boolean</h3>{/if}
				<h4 class="text-lg font-semibold">
					{editMode ? variable.name : 'New Boolean'}
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
			<div class="flex flex-col gap-1">
				<span>Value</span>
				<SegmentedControl
					name="justify"
					value={_boolString}
					onValueChange={(e) => handleValueChange(e.value ?? 'false')}
				>
					<SegmentedControl.Control>
						<SegmentedControl.Indicator />
						<SegmentedControl.Item value="true">
							<SegmentedControl.ItemText>True</SegmentedControl.ItemText>
							<SegmentedControl.ItemHiddenInput />
						</SegmentedControl.Item>
						<SegmentedControl.Item value="false">
							<SegmentedControl.ItemText>False</SegmentedControl.ItemText>
							<SegmentedControl.ItemHiddenInput />
						</SegmentedControl.Item>
					</SegmentedControl.Control>
				</SegmentedControl>
			</div>
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
