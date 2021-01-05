import { injectable } from "tsyringe";
import { checkOpgaver, SortedOpgaver } from "../get-opgaver";

@injectable()
export class TaskService {
    currentAssignments: SortedOpgaver[] = [];

    constructor() {
        this.updateAssignments();
    }

    async updateAssignments() {
        this.currentAssignments = await checkOpgaver();
    }
}