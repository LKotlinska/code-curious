<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Modal from './Modal.svelte';
	import { faXmark } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

	export let isOpen: boolean;

	const dispatch = createEventDispatcher();

	const closeModal = () => {
		dispatch('close');
	};
</script>

<Modal {isOpen} on:close={closeModal}>
	<div slot="header" class="card-header flex justify-between items-start">
		<h2 class="text-xl font-bold">Tutorial</h2>
		<button on:click={closeModal}><FontAwesomeIcon icon={faXmark} /></button>
	</div>
	<div slot="content" class="px-4">
		<p class="font-bold">Welcome to the tutorial!</p>
		<p class="mt-2">
			Code Curious is a fun and interactive way to learn the basics of programming—no coding experience
			needed. <br />
			In addition to the Lesson panel, where you’re reading this, your journey will unfold in the following
			three panels: <br />
			The Editor
			<br />
			Think of this as your code workshop. Here, you’ll assemble the step-by-step instructions that make
			up your code.
			<br />
			The Console
			<br />
			When you run your code, the Console is like your mission control, letting you keep an eye on what’s
			happening behind the scenes.
			<br />
			The Playfield
			<br />
			At first glance, it may look like a black void, but this is actually a playground where your code
			comes alive with colors and shapes—and gravity.
			<br />
			If this feels a little mysterious or just plain bonkers, don’t worry! You’ll get the hang of each
			panel as your journey unfolds.
			<br />
			Ready to begin?
		</p>
	</div>
	<div slot="footer">
		<div class="card-footer flex justify-end">
			<button on:click={closeModal} class="btn"> Close </button>
		</div>
	</div>
</Modal>
