import TreeDto from "@shared/dto/TreeDto";
import TreeSessionModel from "@main/models/TreeSessionModel";

export default interface ITreeUtils {
	getDirectoryTree(dirPath: string, indent?: number): Promise<TreeDto>;
	getSessionModelWithFs(
		dirPath: string,
		indent: number,
		fsChildren: TreeDto[],
		preTree: TreeSessionModel
	): Promise<TreeSessionModel | null>;
	syncWithFs(node: TreeDto): Promise<TreeSessionModel | null>;
}
