import * as Excel from "exceljs";
import { join } from "path";
import { mkdirSync, readdirSync, existsSync } from "fs";
import { homedir, platform } from 'os';
import chalk from "chalk";

export type Opgaver = { [index: string]: string[] };
export interface SortedOpgaver {
    kapitel: string;
    a?: string[];
    b?: string[];
    c?: string[];
    g?: string[];
    missing?: string[];
    done?: boolean;
}

function numsFromRange(input: string): string[] {
    let [from, to] = input.split('-').map(Number);
    if (!to) return [('000' + from).slice(-3)];
    return Array.from({ length: to - from + 1 }, (_, i) => ('000' + (from + i)).slice(-3));
}

let pathToAarhusTECH = join(homedir(), platform() == "darwin" ? 'Documents' : '', 'AARHUS TECH');
if (!existsSync(pathToAarhusTECH)) {
    // Error if AARHUS TECH folder isn't synchronized to the device
    console.error(chalk.redBright`AARHUS TECH folder couldn't be found at ${pathToAarhusTECH}`);
    console.error('Hint: ' + chalk.cyanBright`Make sure that your AARHUS TECH folder is synchronized to your computer`);
    process.exit();
}
let userDirectory = readdirSync(pathToAarhusTECH).find((s) => !!(s.match(/(Mirsad Kadribasic - )(?!20RInfoMappe)\w+/g)));
if (!userDirectory) {
    // Error if userDirectory wasn't found
    console.error(chalk.redBright`Couldn't find your userDirectory in ${pathToAarhusTECH}`);
    process.exit();
};

let workbook = new Excel.Workbook();
let opgaverSheetPath = join(pathToAarhusTECH, 'Mirsad Kadribasic - 20RInfoMappe/Opgaver20R.xlsx');
let userOpgaverPath = join(pathToAarhusTECH, userDirectory);

if (!existsSync(opgaverSheetPath)) {
    // Error if userDirectory wasn't found
    console.error(chalk.redBright`Couldn't find Opgaver20R.xlsx at ${opgaverSheetPath}`);
    process.exit();
};

async function getOpgaver(): Promise<Opgaver> {
    await workbook.xlsx.readFile(opgaverSheetPath)
    let worksheet = workbook.worksheets[0];

    let opgaver: Opgaver = {};

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        let [, category, ...rawTasksRow] = (row.values as string[]);
        let tasks: string[] = [];
        
        rawTasksRow.forEach(rawTasks => {
            rawTasks
                .toString()
                .replace('.', ',')
                .split(',')
                .map((cur) => tasks.push(...numsFromRange(cur)));
        });
        opgaver[category] = tasks
    });

    return opgaver;
}

export async function checkOpgaver(): Promise<SortedOpgaver[]> {
    let opgaver = await getOpgaver();
    let categorys = Object.keys(opgaver);
    let solvedTasks: SortedOpgaver[] = [];

    solvedTasks = categorys.map(category => {
        let files: string[] = [];

        try {
            files = readdirSync(join(userOpgaverPath, category))
                .filter(file => file.includes('.pdf'))
                .map(file => file.replace('.pdf', ''))
                .filter(file => opgaver[category].includes(file.slice(0, 3)));
        } catch (error) {
            mkdirSync(join(userOpgaverPath, category));
        }

        let sortedFiles: SortedOpgaver = files
            .reduce((acc: any, file: string) => {
                let status = file.slice(3);
                let task = file.slice(0, 3);

                if (!['a', 'b', 'c'].includes(status)) status = 'g';

                acc[status] ? acc[status].push(task) : acc[status] = [task];
                return acc;
            }, {});

        let missingOpgs = opgaver[category].filter(opg => !files.map(s => s.slice(0, 3)).includes(opg));
        if (missingOpgs.length) sortedFiles.missing = missingOpgs;
        if (!sortedFiles.b
            && !sortedFiles.c
            && !sortedFiles.missing) sortedFiles.done = true;

        sortedFiles.kapitel = category;
        return sortedFiles;
    });

    return solvedTasks;
}
