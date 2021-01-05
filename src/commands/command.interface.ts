import { ActionParameters, Command, CreateArgumentOpts, CreateOptionCommandOpts, Program } from "@caporal/core";

export interface IArgument {
    synopsis: string,
    description: string,
    options?: CreateArgumentOpts | undefined
}

export interface IOption {
    synopsis: string,
    description: string,
    options?: CreateOptionCommandOpts | undefined
}

export abstract class CliCommand {
    name: string[] = [];
    description: string = '';
    arguments: IArgument[] = [];
    options: IOption[] = [];
    command: Command = ({} as any);

    action(params: ActionParameters): void {
        throw new Error('Implement action');
    }

    initCommand(program: Program) {
        // Make sure function not called more than once
        if(Symbol('initCalled') in this) throw new Error('initCommand Called twice');
        this[Symbol('initCalled')] = true;
        
        this.command = program.command(this.name[0], this.description);
        this.command.alias(...this.name.slice(1));
        this.arguments.forEach(arg => this.command.argument(arg.synopsis, arg.description, arg.options));
        this.options.forEach(opt => this.command.option(opt.synopsis, opt.description, opt.options));

        this.command.action(this.action.bind(this));
    }
}