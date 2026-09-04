import type { VariableType, Action, Log } from '$lib/types';

export type SolutionVariableBlock = Omit<VariableType, 'id'>;

export type SolutionActionBlock = Omit<Action, 'id' | 'variableId'> & {
	refName?: string; // name of the variable block this action targets, e.g. increase/decrease
};

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

// Resolves a variable's id (as referenced by an action/log block) to its name,
// since solution blocks identify variables by name rather than by (non-deterministic) id
function resolveRefName(snapshot: VariableType[], id: number | null): string | null {
	if (id === null) return null;
	return snapshot.find((block) => block.id === id)?.name ?? null;
}

export function matchActionBlock(
	solution: SolutionActionBlock,
	snapshotBlock: Action,
	snapshot: VariableType[],
): boolean {
	if (solution.blockType !== snapshotBlock.blockType) return false;
	if (solution.action !== snapshotBlock.action) return false;

	if (solution.refName) {
		return resolveRefName(snapshot, snapshotBlock.variableId ?? null) === solution.refName;
	}
	return true;
}