import { program } from "@caporal/core";
import "reflect-metadata";
import { prompt } from 'inquirer';
import { ExitCommand } from './commands/exit';
import { UpdateCommand } from "./commands/update";
import { ClearCommand } from './commands/clear';
import { ListCommand } from './commands/list';
import { ViewCommand } from './commands/view';
import { container } from 'tsyringe';
import { TaskService } from "./services/task.service";
import { StatusCommand } from "./commands/status";
import { SettingsService } from "./services/settings.service";

program
    .disableGlobalOption('quiet')
    .disableGlobalOption('verbose')
    .disableGlobalOption('silent')

let commandClasses = [
    ExitCommand,
    UpdateCommand,
    ClearCommand,
    ListCommand,
    ViewCommand,
    StatusCommand
];

container.register<TaskService>(TaskService, { useValue: new TaskService });
container.register<SettingsService>(SettingsService, { useValue: new SettingsService });
let commands = commandClasses.map((commandClass: any) => container.resolve(commandClass));
commands.forEach((command: any) => command.buildCommand(program));

async function getInput() {
    let answer = await prompt({
        type: 'input',
        name: 'question',
        message: 'ManglendeOpgaver>'
    })
    program.run(answer.question.split(' ')).finally(() => {
        setTimeout(getInput, 10);
    });
}

async function main() {
    // Instantiat the settings service
    // So that we can check if we should run a start command
    const settingsService = container.resolve(SettingsService);
    const startCommand = settingsService.getSetting('startCommand');
    if (startCommand) {
        await container.resolve(TaskService).updateAssignments();
        await program.run(startCommand.split(' ')).catch(() => console.log(`An error happened trying to run the start command: "${startCommand}"`));
    }

    getInput();
}

main();