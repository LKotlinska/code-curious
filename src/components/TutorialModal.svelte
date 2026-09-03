<script lang="ts">
	import Modal from './Modal.svelte';
	import { faXmark } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

	interface Props {
		isOpen: boolean;
		onclose: () => void;
	}

	let { isOpen, onclose }: Props = $props();

	const closeModal = () => {
		onclose();
	};
</script>

<Modal {isOpen} {onclose}>
	{#snippet header()}
		<div class="card-header flex justify-between items-start">
			<h2 class="text-xl font-bold">Tutorial</h2>
			<button onclick={closeModal}><FontAwesomeIcon icon={faXmark} /></button>
		</div>
	{/snippet}
	{#snippet content()}
		<div class="px-4 space-y-3">
			<p class="font-bold">Welcome to the tutorial!</p>
			<p>
				Code Curious is a fun and interactive way to learn the basics of programming—no coding
				experience needed.
			</p>
			<p>
				<span class="font-bold">The Lesson Panel</span><br />
				Here, you’ll find a series of lessons that will guide you through the fundamentals of coding.
			</p>
			<p>
				<span class="font-bold">The Editor</span><br />
				Think of this as your code workshop. Here, you’ll assemble the step-by-step instructions that
				make up your code.
			</p>
			<p>
				<span class="font-bold">The Console</span><br />
				When you run your code, the Console is like your mission control, letting you keep an eye on what’s
				happening behind the scenes.
			</p>
			<p>
				<span class="font-bold">The Playfield</span><br />
				At first glance, it may look like a black void, but this is actually a playground where your code
				comes alive with colors and shapes—and gravity.
			</p>
			<p>
				If this feels a little mysterious or just plain bonkers, don’t worry! You’ll get the hang of
				each panel as your journey unfolds.
			</p>
			<p>Let's get started!</p>
		</div>
	{/snippet}
	{#snippet footer()}
		<div>
			<div class="card-footer flex justify-end">
				<button onclick={closeModal} class="btn"> Close </button>
			</div>
		</div>
	{/snippet}
</Modal>
