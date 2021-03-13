import chalk from "chalk";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { injectable, singleton } from "tsyringe";

const defaultSettings = {
    statusBarChar: '█',
    startCommand: ''
};

type settingsType = typeof defaultSettings;
const settingsPath = join(homedir(), '.manglopg.json');

@injectable()
export class SettingsService {
    settings: settingsType = {} as any;

    constructor() {
        this.checkForSettings();
        this.fetchSettings();
    }

    getSetting<K extends keyof settingsType>(key: K) {
        if (!(key in defaultSettings)) throw new Error(`${key} does not exist in settings`);
        return this.settings[key];
    }

    checkForSettings() {
        if (!existsSync(settingsPath)) {
            // Settings file doesn't exist
            // Create one with default settings
            writeFileSync(
                settingsPath,
                JSON.stringify(defaultSettings, undefined, 2)
            );
        } else {
            let existingData = JSON.parse(readFileSync(settingsPath).toString('utf-8'));
            let checkedData = {};

            try {
                // Check if settings match typeof defaultSettings
                Object.entries(existingData).forEach(([key, value]) => {
                    if(typeof value == typeof defaultSettings[key] && !!value) {
                        // Everything is clear with the current key
                        checkedData[key] = value;
                    } else {
                        // Something doesn't match up with saved setting
                        checkedData[key] = defaultSettings[key];
                    }
                });

                // Check if settings are missing
                Object.keys(defaultSettings)
                    .filter(key => !Object.keys(existingData).includes(key))
                    .forEach(key => {
                        // Missing keys
                        checkedData[key] = defaultSettings[key];
                    });
            } catch (e) {
                console.error(chalk.redBright`Something happened to your setting, and they have been reset!`);
                checkedData = {
                    ...checkedData,
                    ...defaultSettings
                };
            }

            writeFileSync(
                settingsPath,
                JSON.stringify(checkedData, undefined, 2)
            );
        }
    }

    fetchSettings() {
        let rawData = readFileSync(settingsPath).toString('utf-8');
        this.settings = JSON.parse(rawData);
    }
}