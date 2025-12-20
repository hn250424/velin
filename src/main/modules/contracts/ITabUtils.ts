import { TabSessionModel } from "@main/models/TabSessionModel";
import { TabEditorsDto } from "@shared/dto/TabEditorDto";

export default interface ITabUtils {
	syncSessionWithFs(session: TabSessionModel): Promise<TabSessionModel | null>;
	toTabEditorsDto(session: TabSessionModel): Promise<TabEditorsDto>;
	toTabSessionModel(tabEditorsDto: TabEditorsDto): TabSessionModel;
}
