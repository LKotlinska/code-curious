<script lang="ts">
	import { onMount, onDestroy, untrack } from 'svelte';
	import { matterActionOutput } from '$lib/utils/actions'; // Import matterActionOutput store
	import {
		initMatterJS,
		startMatter,
		stopMatter,
		resetBodies,
		handleInstruction,
	} from '$lib/matter';
	import Matter from 'matter-js';
	import type { MatterInstance, Action } from '../lib/types';
	import { actionSnapshot } from '$lib/utils/actions';
	import { isRunning, matterInstanceStore, resetMatterFlag } from '$lib/stores/store';

	let matterContainer: HTMLElement | null = $state(null);

	interface Props {
		// Matter.js instance, needs to be exported to be used by actions.ts
		matterInstance?: MatterInstance | null;
		// Expose the data prop to receive the data from the parent +page.svelte
		data: any;
	}

	let { matterInstance = $bindable(null), data = $bindable() }: Props = $props();

	// Only subscribe to matterActionOutput when isRunning is true

	matterActionOutput.subscribe((instructions: Action[]) => {
		if ($isRunning && matterInstance && instructions.length > 0) {
			const latestInstruction = instructions[instructions.length - 1];
			handleInstruction(matterInstance, latestInstruction, $actionSnapshot); // Pass the latest instruction to matter.ts
		}
	});

	// Reactively control Matter.js based on the running state
	$effect(() => {
		if ($isRunning && matterInstance) {
			resetBodies(matterInstance);
			//resetBodies(matterInstance, (data.scene = data.scene ? data.scene : null));
			startMatter(matterInstance.runner, matterInstance.engine);
		} else if (!$isRunning && matterInstance) {
			stopMatter(matterInstance.runner);
		}
	});

	// Scale factor!
	let scale: number = $state(0.8);
	let innerWidth: number;

	// Helper to clean up the current Matter.js instance
	function cleanupMatterInstance() {
		if (matterInstance) {
			stopMatter(matterInstance.runner);
			Matter.Engine.clear(matterInstance.engine);
			Matter.World.clear(matterInstance.engine.world, false); // Clear all bodies including static ones
			// Remove any canvas elements the renderer left behind
			const container = document.querySelector('#matterContainer');
			container?.querySelectorAll('canvas').forEach((canvas) => canvas.remove());
		}
	}

	const reinitMatterJs = () => {
		cleanupMatterInstance(); // First, clean up the old instance
		// Toggle running state to false, NB must be run after cleanup
		$isRunning = false;
		if (matterContainer) {
			matterInstance = initMatterJS(
				matterContainer,
				{ width: 450, height: 680 },
				scale,
				(data.scene = data.scene ? data.scene : null),
			);
			matterInstanceStore.set(matterInstance); // Set the store with the Matter instance
		}
	};

	// Reinitialize Matter.js whenever the lesson `data` changes.
	// `reinitMatterJs` reads and writes other reactive state (matterInstance, data.scene,
	// isRunning); `untrack` keeps those out of this effect's dependencies so it only re-runs
	// when `data` or `matterContainer` actually change - otherwise it would loop forever.
	$effect(() => {
		data;
		matterContainer;
		untrack(() => {
			if (data && matterContainer) {
				reinitMatterJs();
			}
		});
	});

	// Reinitialize Matter.js whenever the flag is changed
	$effect(() => {
		if ($resetMatterFlag) {
			untrack(() => reinitMatterJs());
			resetMatterFlag.set(false); // Reset the flag
		}
	});

	// Reinitialize Matter.js whenever the scale changes
	$effect(() => {
		scale;
		untrack(() => {
			if (scale) {
				reinitMatterJs();
			}
		});
	});

	function updateScale(innerWidth: number) {
		if (innerWidth <= 400) {
			scale = 0.8;
		} else if (innerWidth <= 540) {
			scale = 1;
		} else if (innerWidth <= 1024) {
			scale = 1.2;
		} else if (innerWidth <= 1440) {
			scale = 1;
		} else if (innerWidth <= 1680) {
			scale = 1.1;
		} else if (innerWidth <= 1920) {
			scale = 1.25;
		} else {
			scale = 1.4;
		}
	}

	// Initialize Matter.js when the component mounts
	onMount(() => {
		// Get window dimensions
		innerWidth = window.innerWidth;
		updateScale(innerWidth);

		// Update scale on resize
		window.addEventListener('resize', () => {
			innerWidth = window.innerWidth;
			updateScale(innerWidth);
		});

		// `reinitMatterJs` cleans up any instance the reactive effects already created,
		// so we never end up with a stray second canvas.
		if (matterContainer) {
			reinitMatterJs();
		}
	});

	// Clean up Matter.js when the component is destroyed
	onDestroy(() => {
		cleanupMatterInstance();
	});
</script>

<section class="w-full flex justify-center">
	<div id="matterContainer" bind:this={matterContainer}></div>
</section>
