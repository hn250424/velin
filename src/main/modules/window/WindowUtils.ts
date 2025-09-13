import { injectable } from 'inversify'
import IWindowUtils from "../contracts/IWindowUtils"
import { WindowSessionModel } from '@main/models/WindowSessionModel'
import WindowDto from '@shared/dto/WindowDto'

@injectable()
export default class WindowUtils implements IWindowUtils {

    constructor() {}

    toWindowDto(session: WindowSessionModel): WindowDto {
        return {
            maximize: session.maximize
        }
    }
}