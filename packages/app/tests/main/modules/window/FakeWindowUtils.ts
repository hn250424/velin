import { WindowSessionModel } from "@main/models/WindowSessionModel"
import IWindowUtils from "@main/modules/contracts/IWindowUtils"
import WindowDto from "@shared/dto/WindowDto"

export default class FakeWindowUtils implements IWindowUtils {
	toWindowDto(session: WindowSessionModel): WindowDto {
		return {
			maximize: session.maximize,
		}
	}
}
