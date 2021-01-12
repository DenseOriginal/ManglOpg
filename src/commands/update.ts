import { CliCommandDecorator } from "../core/decorator";
import { TaskService } from "../services/task.service";

@CliCommandDecorator({
    names: ['update'],
    description: 'Updates the tasks'
})
export class UpdateCommand {
    constructor(private taskService: TaskService) { }

    action() {
        this.taskService.updateAssignments();
    }
}