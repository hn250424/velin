import { inject } from "inversify"
import DI_KEYS from "../constants/di_keys"
import IFileManager from "@main/modules/contracts/IFileManager"
import ISideRepository from "@main/modules/contracts/ISideRepository"
import SideDto from "@shared/dto/SideDto"
import SideSessionModel from "@main/models/SideSessionModel"

export default class SideService {
    constructor(
        @inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
        @inject(DI_KEYS.SideRepository) private readonly sideRepository: ISideRepository,
    ) {

    }

    async syncSideSession(dto: SideDto): Promise<boolean> {
        try {
            const model = dto as SideSessionModel
            await this.sideRepository.writeSideSession(model)
            return true
        } catch (e) {
            return false
        }
    }
}