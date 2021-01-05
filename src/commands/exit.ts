import { Program } from "@caporal/core";
import { inject, injectable } from "tsyringe";
import { CliCommand } from "./command.interface";

@injectable()
export class ExitCommand extends CliCommand {
    name = ['exit'];

    action() {
        process.exit();
    }
}