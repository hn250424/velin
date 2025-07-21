import ICommand from "./ICommand";

export default class DeleteCommand implements ICommand {
    constructor() {
        
    }

    execute(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    undo(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}