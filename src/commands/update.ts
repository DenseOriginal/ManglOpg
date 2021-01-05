import { Program } from "@caporal/core";
import { inject, injectable } from "tsyringe";
import { TaskService } from "../services/task.service";
import { CliCommand } from "./command.interface";

@injectable()
export class UpdateCommand extends CliCommand {
    name = ['update'];
    description = 'Updates the tasks';

    constructor(
        private taskService: TaskService
    ) { super() }

    action() {
        this.taskService.updateAssignments();
    }
}