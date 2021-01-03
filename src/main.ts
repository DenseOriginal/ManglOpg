import { checkOpgaver, SortedOpgaver } from './get-opgaver';
import { program } from "@caporal/core";
import chalk = require('chalk');
import { prompt } from 'inquirer';

let opgaver: SortedOpgaver[] = [];
const inquirerPrefix = undefined;
(async function () { opgaver = await checkOpgaver() }());

const Colors = {
    a: 'greenBright',
    b: 'yellowBright',
    c: 'magentaBright',
    missing: 'redBright',
    g: 'cyanBright'
}

program
    .disableGlobalOption('quiet')
    .disableGlobalOption('verbose')
    .disableGlobalOption('silent')

program
    .command('exit', 'Exit')
    .action(() => process.exit());

program
    .command('update', 'Updates the tasks')
    .action(async () => {
        opgaver = await checkOpgaver();
        console.log('Tasks updated');
    });

program
    .command('clear', 'Clears the screen')
    .alias('cls')
    .action(console.clear)

program
    .command('list', 'Quick view over the tasks')
    .alias('overview').alias('all')
    .action(async () => {
        let longestKapitel = opgaver.reduce((acc, cur) => acc < cur.kapitel.length ? cur.kapitel.length : acc, 0) + 2;
        let tasks: string[] = ['\n'];
        tasks = opgaver.map(category => {
            return `${category.kapitel.padEnd(longestKapitel, ' ')}|  ` +
                chalk[Colors.a]`A: ${('' + (category.a || '').length).padEnd(3, ' ')}  ` +
                chalk[Colors.b]`B: ${('' + (category.b || '').length).padEnd(3, ' ')}  ` +
                chalk[Colors.c]`C: ${('' + (category.c || '').length).padEnd(3, ' ')}  ` +
                chalk[Colors.missing]`Manglende: ${('' + (category.missing || '').length).padEnd(3, ' ')}  ` +
                chalk[Colors.g]`Genaflevering: ${('' + (category.g || '').length).padEnd(3, ' ')}  `
        })

        tasks.unshift('');
        tasks.push('');
        console.log(tasks.join('\n'));
    });

program
    .command('view', 'View a chapter')
    .alias('info').alias('show')
    .argument('[chapter]', 'Chapter to view')
    .option('-L, --list', 'List chapters')
    .option('--hide-a', 'Hides A tasks')
    .option('-h, --hide-empty', 'Hides empty tasks')
    .action(async ({ args, options }) => {
        let chapterName: string;
        let chapter: SortedOpgaver;

        if (options.list || !args.chapter) {
            let chapterPropmt = await prompt({
                type: 'list',
                message: 'Choose a chapter to view',
                name: 'chapter',
                prefix: inquirerPrefix,
                choices: opgaver.map(chp => chp.kapitel)
            });

            chapterName = chapterPropmt.chapter;
            chapter = opgaver.find(chp => chp.kapitel == chapterName) || <SortedOpgaver>{};
        } else {
            let chapterSearch = opgaver.find(chp => chp.kapitel == args.chapter);
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
    });


async function getInput() {
    let answer = await prompt({
        type: 'input',
        name: 'question',
        prefix: inquirerPrefix,
        message: 'ManglendeOpgaver>'
    })
    program.run(answer.question.split(' ')).finally(getInput);
}

getInput();