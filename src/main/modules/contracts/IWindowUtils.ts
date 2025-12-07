import { WindowSessionModel } from "@main/models/WindowSessionModel";
import WindowDto from "@shared/dto/WindowDto";

export default interface IWindowUtils {
	toWindowDto(session: WindowSessionModel): WindowDto;
}
