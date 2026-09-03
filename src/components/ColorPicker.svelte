<script lang="ts">
	import { colors } from '$lib/utils/colors';

	interface Props {
		// The color prop to be updated when a color is selected
		value: string;
	}

	let { value = $bindable() }: Props = $props();
	let color: string = $state(value);

	// When the color changes, update the value prop
	// this will be used to update the string value in
	// the parent StringModal component
	$effect(() => {
		value = color;
	});
</script>

<div class="color-picker" role="radiogroup" aria-label="Choose a color">
	{#each Object.keys(colors) as key}
		<div class="color-option">
			<input
				type="radio"
				name="color"
				id="color-{key}"
				class="color-radio"
				value={colors[key][1]}
				bind:group={color}
				aria-label={colors[key][1]}
			/>
			<label for="color-{key}" class="color-label" style="background-color: {colors[key][0]};"
			></label>
		</div>
	{/each}
</div>

<style>
	.color-picker {
		display: flex;
		flex-wrap: wrap;
	}

	.color-option {
		position: relative;
		cursor: pointer;
	}

	.color-radio {
		/* Hide default radio button */
		appearance: none;
		position: absolute;
		opacity: 0;
		cursor: pointer;
	}

	.color-label {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		cursor: pointer;
	}
</style>
