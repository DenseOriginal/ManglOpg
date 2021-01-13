import { CreateArgumentOpts, CreateOptionCommandOpts, Program } from "@caporal/core";
import { injectable } from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";

export interface CliCommandOptions {
    names: string[];
    description: string;
    arguments?: IArgument[];
    options?: IOption[];
};

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

export function CliCommandDecorator(options: CliCommandOptions) {
    return function (target: constructor<any>) {
        let injectableDecorator = injectable();
        injectableDecorator(target);

        target.prototype.buildCommand = function (program: Program) {
            // Make sure function not called more than once
            if(Reflect.getMetadata(Symbol('buildCalled'), target)) throw new Error('buildCommand Called twice');
            Reflect.defineMetadata(Symbol('buildCalled'), true, target);
            
            this.command = program.command(options.names[0], options.description);
            this.command.alias(...options.names.slice(1));
            (options.arguments || []).forEach(arg => this.command.argument(arg.synopsis, arg.description, arg.options));
            (options.options || []).forEach(opt => this.command.option(opt.synopsis, opt.description, opt.options));

            this.command.action(this.action.bind(this));
        }
        
        return target;
    }
}