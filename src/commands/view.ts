import { Program } from "@caporal/core";
import chalk from "chalk";
import { prompt } from "inquirer";
import { inject, injectable } from "tsyringe";
import { Colors } from "../constants/colors";
import { CliCommandDecorator } from "../core/decorator";
import { SortedOpgaver } from "../get-opgaver";
import { TaskService } from "../services/task.service";

@CliCommandDecorator({
    names: ['view', 'info', 'show'],
    description: 'View a chapter',
    arguments: [{ synopsis: '[chapter]', description: 'Chapter to view' }],
    options: [
        { synopsis: '-a, --all', description: 'Display finished chapters' },
        { synopsis: '-L, --list', description: 'List chapters' },
        { synopsis: '--hide-a', description: 'Hides A tasks' },
        { synopsis: '-h, --hide-empty', description: 'Hides empty tasks' }
    ]
})
export class ViewCommand {
    constructor(private taskService: TaskService) { }

    async action({ args, options }) {
        let chapterName: string;
        let chapter: SortedOpgaver;

        let assignments = this.taskService.currentAssignments;

        if (options.list || !args.chapter) {
            let chapterPropmt = await prompt({
                type: 'list',
                message: 'Choose a chapter to view',
                name: 'chapter',
                // Filter out done chapters, if the all flag isn't on
                choices: assignments.filter(chp => (options.all || !chp.done)).map(chp => chp.kapitel)
            });

            chapterName = chapterPropmt.chapter;
            chapter = assignments.find(chp => chp.kapitel == chapterName) || <SortedOpgaver>{};
        } else {
            let chapterSearch = assignments.find(chp => chp.kapitel == args.chapter);
            if (!chapterSearch) {
                console.log(chalk.redBright`The specifed chapter "${args.chapter}" doesn't exist`);
                console.log('Hint: ' + chalk.cyanBright`Chapters are case sensitive \n`);
                return;
            }

            chapter = chapterSearch;
            chapterName = chapter.kapitel
        }

        let categorysToShow = { a: 'A', b: 'B', c: 'C', missing: 'Missing', g: 'Genafleverings' };
        if (options['hideA']) categorysToShow.a = (undefined as any);
        if (options['hideEmpty'])
            Object.keys(categorysToShow).forEach(key => { if (!chapter[key]) categorysToShow[key] = (undefined as any) });

        console.log(chalk.bold`${chapterName}`);
        console.log('‾'.repeat(chapterName.length));

        console.log(Object.entries(categorysToShow).filter((x) => x[1]).map(category => {
            let [key, title] = category;
            if (!chapter[key]) return chalk[Colors[key]]`${title} Assignments \n` + `[${chalk[Colors[key]]('Empty')}]`;
            let tasks = chapter[key];
            return chalk[Colors[key]]`${title} Assignments  \n` +
                `${tasks.map(task => `[${chalk[Colors[key]](task)}]`).join(', ')}`;
        }).join('\n\n') + '\n');
    }
}