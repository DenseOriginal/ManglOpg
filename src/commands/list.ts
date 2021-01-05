import chalk from "chalk";
import { injectable } from "tsyringe";
import { Colors } from "../constants/colors";
import { TaskService } from "../services/task.service";
import { CliCommand } from "./command.interface";

@injectable()
export class ListCommand extends CliCommand {
    name = ['list', 'overview', 'all'];
    description = 'Quick view over the tasks';

    constructor(
        private taskService: TaskService
    ) { super(); }

    action(params) {
        let assignments = this.taskService.currentAssignments;
        let longestKapitel = assignments.reduce((acc, cur) => acc < cur.kapitel.length ? cur.kapitel.length : acc, 0) + 2;
        let assignmentsToPrint: string[] = ['\n'];
        assignmentsToPrint = assignments.map(category => {
            return `${category.kapitel.padEnd(longestKapitel, ' ')}|  ` +
                chalk[Colors.a]`A: ${('' + (category.a || '').length).padEnd(3, ' ')}  ` +
                chalk[Colors.b]`B: ${('' + (category.b || '').length).padEnd(3, ' ')}  ` +
                chalk[Colors.c]`C: ${('' + (category.c || '').length).padEnd(3, ' ')}  ` +
                chalk[Colors.missing]`Manglende: ${('' + (category.missing || '').length).padEnd(3, ' ')}  ` +
                chalk[Colors.g]`Genaflevering: ${('' + (category.g || '').length).padEnd(3, ' ')}  `
        })

        assignmentsToPrint.unshift('');
        assignmentsToPrint.push('');
        console.log(assignmentsToPrint.join('\n'));
    }
}