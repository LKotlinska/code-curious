import type { VariableType } from '$lib/types';

export type SolutionVariableBlock = Omit<VariableType, 'id'>;

export function matchVariableBlock(
	solution: SolutionVariableBlock,
	snapshot: VariableType,
): boolean {
	return (
		solution.blockType === snapshot.blockType &&
		solution.name === snapshot.name &&
		solution.type === snapshot.type &&
		solution.itemType === snapshot.itemType &&
		JSON.stringify(solution.value) === JSON.stringify(snapshot.value)
	);
}
