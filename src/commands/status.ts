import chalk from "chalk";
import { Colors } from "../constants/colors";
import { map } from "../helpers/map";
import { TaskService } from "../services/task.service";
import { AllDoneMessages } from "../constants/all-done";
import { CliCommandDecorator } from "../core/decorator";

export interface IStats {
    a: number;
    b: number;
    c: number;
    g: number;
    missing: number;
}

const statusSentences = {
    a: '${n} Assignment(s) have been succesfully handed in',
    b: '${n} Assignment(s) have been marked as B',
    c: '${n} Assignment(s) have been marked as C',
    g: '${n} Assignment(s) needs to be handed in again',
    missing: 'You are missing ${n} assignment(s)',
};

@CliCommandDecorator({
    names: ['status'],
    description: 'Gives a status',
    options: [
        { synopsis: '--hide-bar', description: 'Hides status bar' }
    ]
})
export class StatusCommand {
    constructor(private taskService: TaskService) { }

    action({ options }) {
        const stats: IStats = this.taskService.currentAssignments
            .reduce((acc, cur) => {
                acc.a += (cur.a || []).length;
                acc.b += (cur.b || []).length;
                acc.c += (cur.c || []).length;
                acc.g += (cur.g || []).length;
                acc.missing += (cur.missing || []).length;

                return acc;
            }, { a: 0, b: 0, c: 0, g: 0, missing: 0 } as IStats);


        const totalAssignments: number = Object.values(stats).reduce((acc, n) => acc + n, 0);

        // Minus 5 + totalAssignenmts amount of digits
        // So there can be space for '0 |' + '| x'
        const terminalWidth = process.stdout.columns - 5 - totalAssignments.toString().length;
        const statsAsPercent: IStats = Object.entries(stats).reduce((acc, [type, n]) => {
            let procent = (n / totalAssignments) * 100;
            acc[type] = map(procent, 0, 100, 0, terminalWidth)
            return acc;
        }, {} as IStats);

        // Drawing the bar
        // Only of --hide-bar flag is not enabled
        if (!options.hideBar) {
            // console.log('┌' + '─'.repeat(terminalWidth) + '┐');
            console.log(
                '0 |' +
                Object.entries(statsAsPercent).map(([type, n]) => {
                    return chalk[Colors[type]]('█'.repeat(n));
                }).join('') +
                '| ' + totalAssignments
            );
            // console.log('└' + '─'.repeat(terminalWidth) + '┘');
        }

        if (stats.a != totalAssignments) {
            let sentencesToPrint = Object.entries(statusSentences)
                .map(([type, sentence]) => {
                    if (stats[type] == 0) return undefined;
                    return '- ' + chalk[Colors[type]](sentence.replace('${n}', stats[type]));
                }).filter(sentence => sentence);

            console.log(sentencesToPrint.join('\n'));
        } else {
            let doneMsg = AllDoneMessages[~~(Math.random() * AllDoneMessages.length)];
            console.log('- ' + chalk[Colors.a](doneMsg));
        }

        console.log('\n')
    }
}