import chalk from "chalk";
import { injectable } from "tsyringe";
import { Colors } from "../constants/colors";
import { TaskService } from "../services/task.service";
import { CliCommand, IOption } from "./command.interface";

@injectable()
export class ListCommand extends CliCommand {
    name = ['list', 'overview', 'all'];
    options: IOption[] = [
        { synopsis: '-p, --procent', description: 'Display number in procent' },
        { synopsis: '-u, --update', description: 'Updates the assignment list before displaying them' }
    ]
    description = 'Quick view over the tasks';

    constructor(
        private taskService: TaskService
    ) { super(); }

    async action({options}) {
        if(options.update) await this.taskService.updateAssignments();
        
        let categorysToShow = { a: 'A', b: 'B', c: 'C', missing: 'Missing', g: 'Genafleverings' };

        let assignments = this.taskService.currentAssignments;
        let longestKapitel = assignments.reduce((acc, cur) => acc < cur.kapitel.length ? cur.kapitel.length : acc, 0) + 2;
        let assignmentsToPrint: string[] = ['\n'];
        assignmentsToPrint = assignments.map(category => {
            let totalAssignments = Object.keys(categorysToShow).reduce((acc, group) => {
                return acc + (category[group]?.length || 0);
            }, 0);

            let prettyAssignments: string[] = Object.entries(categorysToShow).map(([key, label]) => {
                let number: string = options.procent ? (totalAssignments / category[key]?.length * 100) : category[key]?.length;
                number = number || '0';
                number += options.procent ? '%' : '';

                return chalk[Colors[key]]`${label}: ${number.padEnd(4, ' ')}`
            });

            return `${category.kapitel.padEnd(longestKapitel, ' ')}|  ` + prettyAssignments.join('  ');
        })

        assignmentsToPrint.unshift('');
        assignmentsToPrint.push('');
        console.log(assignmentsToPrint.join('\n'));
    }
}