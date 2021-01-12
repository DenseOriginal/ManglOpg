import { CliCommandDecorator } from "../core/decorator";

@CliCommandDecorator({
    names: ['exit'],
    description: 'Exits'
})
export class ExitCommand {
    action() {
        process.exit();
    }
}