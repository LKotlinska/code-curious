<script lang="ts">
	import InlinePanel from './InlinePanel.svelte';
	import ObjectEdit from './ObjectEdit.svelte';
	import Accordion from './Accordion.svelte';
	import {
		faExclamationTriangle,
		faFloppyDisk,
		faMinus,
		faPlus,
		faTrash,
		faXmark,
	} from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import type { ArrayVariable } from '$lib/types';
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

	function buildInitialState() {
		if (variableId) {
			const found = $snapshot.find((v) => v.id === variableId) as ArrayVariable;
			return {
				variable: found,
				itemCount: found.value.length,
				array: found.value,
				// Convert booleans to strings temporarily when the item type is boolean
				boolStringArray: found.itemType === 'boolean' ? found.value.map((v) => v.toString()) : [],
			};
		}
		return {
			variable: {
				id: Date.now(),
				blockType: 'variable',
				name: '',
				type: 'array',
				itemType: 'string',
				value: [],
			} as ArrayVariable,
			itemCount: 1,
			array: [] as any[],
			boolStringArray: [] as string[],
		};
	}

	const initial = buildInitialState();
	let variable = $state<ArrayVariable>(initial.variable);
	let errorMsg = $state('');
	let itemCount = $state(initial.itemCount);
	let array = $state<any[]>(initial.array);

	let _snapshot = $derived($snapshot);

	// If array of booleans, store as strings temporarily and convert to booleans on save
	let _boolStringArray = $state<string[]>(initial.boolStringArray);

	const closeModal = () => {
		onclose();
	};

	const deleteVariable = () => {
		if (!checkIfDeletable(variable.id)) {
			errorMsg = 'This variable is used in another code block';
			return;
		}
		$snapshot = _snapshot.filter((v) => v.id !== variable.id);
		onclose();
	};

	const onSave = () => {
		// Add default name, if empty
		if (variable.name === '') variable.name = 'new array';
		if (variable.itemType !== 'boolean') {
			// Update variable value
			variable.value = array;
		} else {
			// Convert strings to booleans
			variable.value = _boolStringArray.map((v) => v === 'true');
		}
		// Update snapshot store
		if (!editMode) {
			// Add new variable to snapshot store, if not in edit mode
			$snapshot = [..._snapshot, variable];
		} else {
			// Update existing variable in snapshot store
			$snapshot = _snapshot.map((v) => (v.id === variable.id ? variable : v));
		}
		onclose();
	};

	const handleNameChange = (event: Event) => {
		variable.name = (event.target as HTMLInputElement).value;
	};

	const handleItemDataTypeChange = (value: string) => {
		variable.itemType = value;
		// Reset itemCount and array if item type is changed
		itemCount = 1;
		array = [];
		// Reset _boolStringArray if item type is boolean
		if (variable.itemType === 'boolean') {
			_boolStringArray = ['false'];
		}
	};

	const handleRemoveItem = () => {
		// Don't allow removing if itemCount is 1
		if (itemCount === 1) return;
		itemCount -= 1;
		if (variable.itemType !== 'boolean') {
			array.pop();
		} else {
			_boolStringArray.pop();
		}
	};

	// Listen for object updates from ObjectEdit component
	const handleObjectUpdate = (index: number, updatedObject: any) => {
		array[index] = updatedObject.value;
	};
</script>

<InlinePanel {isOpen} onclose={closeModal}>
	{#snippet header()}
		<div class="card-header flex justify-between items-start">
			<div class="flex flex-col">
				<!-- Display item type if in edit mode -->
				{#if editMode}
					<h3 class="text-sm text-secondary-500">Array of {variable.itemType}s</h3>
				{/if}
				<h4 class="text-lg font-semibold">
					{editMode ? variable.name : 'New Array'}
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
			class="px-2 lg:px-4 flex flex-col gap-4 items-start"
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

			<!-- Item Data Type -->
			{#if !editMode}
				<div class="flex flex-col gap-1">
					<span>Item Data Type</span>
					<SegmentedControl
						name="justify"
						value={variable.itemType}
						onValueChange={(e) => handleItemDataTypeChange(e.value ?? 'string')}
					>
						<SegmentedControl.Control>
							<SegmentedControl.Indicator />
							{#each ['string', 'number', 'boolean', 'object'] as itemType}
								<SegmentedControl.Item value={itemType} class="text-sm px-1.5">
									<SegmentedControl.ItemText class="capitalize"
										>{itemType}</SegmentedControl.ItemText
									>
									<SegmentedControl.ItemHiddenInput />
								</SegmentedControl.Item>
							{/each}
						</SegmentedControl.Control>
					</SegmentedControl>
				</div>
			{/if}
			<!-- Add/Remove items -->

			<div class="flex flex-col gap-2">
				<span>Items: {itemCount}</span>
				<div class="flex gap-1 items-center">
					<button
						type="button"
						onclick={() => {
							// Limit to 5 items
							if (itemCount < 5) itemCount += 1;
						}}
						class="btn btn-sm bg-secondary-700 flex gap-2"
						><FontAwesomeIcon icon={faPlus} /> Add item</button
					>
					<button
						type="button"
						onclick={handleRemoveItem}
						class="btn btn-sm bg-primary-700 flex gap-2"
						><FontAwesomeIcon icon={faMinus} /> Remove item</button
					>
				</div>
			</div>

			<!-- Array Items -->
			<!-- Div to ensure y scrolling -->
			<div
				class="w-full flex flex-col items-start overflow-y-auto max-h-52 lg:max-h-72 gap-1 lg:gap-2"
			>
				{#if variable.itemType === 'string'}
					{#each { length: itemCount } as _, i}
						<label class="label flex flex-row items-center gap-2">
							<span class="w-3">{i}</span>
							<input
								bind:value={array[i]}
								class="input"
								type="text"
								name="name"
								autocomplete="off"
								required
								maxlength="25"
							/>
						</label>
					{/each}
				{/if}
				{#if variable.itemType === 'number'}
					{#each { length: itemCount } as _, i}
						<label class="label flex flex-row items-center gap-2">
							<span class="w-3">{i}</span>
							<input
								bind:value={array[i]}
								class="input"
								type="number"
								name="number"
								autocomplete="off"
								required
							/>
						</label>
					{/each}
				{/if}
				{#if variable.itemType === 'boolean'}
					{#each { length: itemCount } as _, i}
						<div class="label flex flex-row items-center gap-2">
							<span class="w-3">{i}</span>
							<SegmentedControl
								name="justify"
								value={_boolStringArray[i]}
								onValueChange={(e) => (_boolStringArray[i] = e.value ?? 'false')}
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
					{/each}
				{/if}
				{#if variable.itemType === 'object'}
					<div class="w-full flex flex-col gap-4">
						{#each { length: itemCount } as _, i}
							<!-- Accordion -->
							<div class="bg-[#0000001a] rounded-t-xl rounded-b-xl">
								<Accordion
									open={false}
									topBorder={false}
									rounded={true}
									color={'bg-surface-200-700-token'}
								>
									{#snippet summary()}
										<div>
											<h4>{i}</h4>
										</div>
									{/snippet}
									{#snippet content()}
										<div class="mt-1 mb-4">
											{#if !editMode}
												<ObjectEdit
													objectVariable={null}
													onupdate={(v) => handleObjectUpdate(i, v)}
												/>
											{/if}
											{#if editMode}
												<ObjectEdit
													objectVariable={array[i]
														? {
																id: Date.now(),
																blockType: 'variable',
																name: '',
																type: 'object',
																value: { ...array[i] },
															}
														: null}
													onupdate={(v) => handleObjectUpdate(i, v)}
												/>
											{/if}
										</div>
									{/snippet}
								</Accordion>
							</div>
						{/each}
					</div>
				{/if}
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
