<script lang="ts">
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faClock, faArrowRight } from '@fortawesome/free-solid-svg-icons';

	interface Props {
		slug: string;
		title: string;
		description: string;
		duration_minutes: number;
	}

	let { slug, title, description, duration_minutes }: Props = $props();
</script>

<a
	href={`/lesson/${slug}`}
	class="card card-hover overflow-hidden flex flex-col gap-3 p-4 h-full"
>
	<h3 class="h4" data-toc-ignore>{title}</h3>
	<p class="text-sm opacity-80 flex-1">{description}</p>
	<div class="flex items-center justify-between">
		<span class="badge flex items-center gap-2">
			<FontAwesomeIcon icon={faClock} />
			{duration_minutes} min
		</span>
		<span class="anchor flex items-center gap-2">
			Start <FontAwesomeIcon icon={faArrowRight} />
		</span>
	</div>
</a>
