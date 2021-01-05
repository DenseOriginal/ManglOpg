import { Program } from "@caporal/core";
import { inject, injectable } from "tsyringe";
import { CliCommand } from "./command.interface";

@injectable()
export class ClearCommand extends CliCommand {
    name = ['clear', 'cls'];

    action() {
        console.clear();
    }
}