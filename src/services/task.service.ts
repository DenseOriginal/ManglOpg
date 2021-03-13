import { injectable, singleton } from "tsyringe";
import { checkOpgaver, SortedOpgaver } from "../get-opgaver";

@injectable()
@singleton()
export class TaskService {
    currentAssignments: SortedOpgaver[] = [];

    constructor() {
        this.updateAssignments();
    }

    async updateAssignments(): Promise<void> {
        this.currentAssignments = await checkOpgaver();
        return Promise.resolve();
    }
}