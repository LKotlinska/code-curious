<script lang="ts">
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

	interface Props {
		// Props
		initiateText: string;
		confirmText?: string;
		cancelText?: string;
		onConfirm: () => void;
		initiateClass?: string;
		confirmClass?: string;
		cancelClass?: string;
		initiateIcon?: IconDefinition;
		confirmIcon?: IconDefinition;
	}

	let {
		initiateText,
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		onConfirm,
		initiateClass = 'btn btn-sm',
		confirmClass = 'btn btn-sm preset-outlined-warning-500',
		cancelClass = 'btn btn-sm',
		initiateIcon,
		confirmIcon,
	}: Props = $props();

	// State
	let showConfirmButtons = $state(false);

	// Methods
	const initiate = () => {
		showConfirmButtons = true;
	};

	const confirm = () => {
		showConfirmButtons = false;
		if (onConfirm) {
			onConfirm();
		}
	};

	const cancel = () => {
		showConfirmButtons = false;
	};
</script>

<!-- Render the initiate button or confirm/cancel buttons based on state -->
{#if showConfirmButtons}
	<div class="flex">
		<button type="button" class={cancelClass} onclick={cancel}>{cancelText}</button>
		<button type="button" class={confirmClass} onclick={confirm}>
			{#if confirmIcon}
				<FontAwesomeIcon icon={confirmIcon} />
			{/if}
			{confirmText}</button
		>
	</div>
{:else}
	<button type="button" class={initiateClass} onclick={initiate}>
		{#if initiateIcon}
			<FontAwesomeIcon icon={initiateIcon} />
		{/if}
		{initiateText}
	</button>
{/if}
