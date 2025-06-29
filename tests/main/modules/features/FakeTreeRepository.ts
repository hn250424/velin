import ITreeRepository from "@contracts/ITreeRepository";
import TreeNode from "@shared/types/TreeNode";

export default class FakeTreeRepository implements ITreeRepository{
    constructor() {}

    getDirectoryTree(dirPath: string): TreeNode {
        return null
    }
}