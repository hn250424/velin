import TreeDto from "@shared/dto/TreeDto";
import TreeSessionModel from "@main/models/TreeSessionModel";

export default interface ITreeUtils {
	getDirectoryTree(dirPath: string, indent?: number): Promise<TreeDto>;
	syncWithFs(node: TreeDto): Promise<TreeSessionModel | null>;
}
