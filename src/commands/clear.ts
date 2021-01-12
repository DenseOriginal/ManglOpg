import { CliCommandDecorator } from "../core/decorator";

@CliCommandDecorator({
    names: ['clear', 'cls'],
    description: 'Clears the screen'
})
export class ClearCommand {
    action() {
        console.clear();
    }
}