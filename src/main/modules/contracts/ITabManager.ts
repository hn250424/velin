import { TabSessionModel } from "@main/models/TabSessionModel";

export default interface ITabManager {
    syncWithFs(session: TabSessionModel): Promise<TabSessionModel | null>
}