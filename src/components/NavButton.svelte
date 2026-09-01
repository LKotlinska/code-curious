<script lang="ts">
    interface Props {
        path: string;
        label: string;
        styles?: string;
        arrows?: "left" | "right";
    }

    let { path, label, styles, arrows }: Props = $props();
</script>

<a class={`navAnchor ${styles}`} href={`/lesson/${path}`}>
    {#if arrows === "left"}
        &lt;&lt; {label}
    {:else if arrows === "right"}
        {label} &gt;&gt;
    {:else}
        {label}
    {/if}
</a>

<style>
 .navAnchor{
    text-decoration: none;
    font-size: 1.1em;
 }
</style>