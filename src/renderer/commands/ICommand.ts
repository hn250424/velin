export default interface ICommand {
    execute(): Promise<void>,
    undo(): Promise<void>,
}