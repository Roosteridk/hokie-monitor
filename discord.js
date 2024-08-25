import DiscordApp from "https://raw.githubusercontent.com/Roosteridk/discord-interactions-framework/main/src/mod.ts";

// Commands: /watch class|section [CS-XXXX]|XXXXX

class App extends DiscordApp {
    async interactionHandler(i) {
        if (i.type === 2) {
            const command = i.data.options[0];
            const userId = i.member.user.id;
            const commandVal = command.options[0].value;
            const userData = kv.get(["users", userId]) ?? {
                classes: new Set(),
                sections: new Set(),
            };

            // TODO: validate input
            if (command.name == "section") {
                userData.sections.add(commandVal);
            } else if (command.name == "class") {
                userData.classes.add(commandVal);
            }
            await kv.set(["users", userId], userData);

            return {
                type: 4,
                data: {
                    content:
                        `Added ${commandVal} to the watch-list! You will get a notification when the class/section becomes available.`,
                },
            };
        }
    }
}

const watchCommand = {
    name: "watch",
    description: "Monitors a class or section for openings.",
    type: 1,
    options: [
        {
            name: "section",
            description: "Monitor single section",
            type: 1,
            options: [
                {
                    name: "section_id",
                    type: 3,
                    required: true,
                },
            ],
        },
        {
            name: "class",
            description: "Monitor all sections for the class",
            type: 1,
            options: [
                {
                    name: "class_id",
                    type: 3,
                    required: true,
                },
            ],
        },
    ],
};

export const app = new App(Deno.env.get("APP_ID"), Deno.env.get("PUBLIC_KEY"));
export const bot = app.createBot(Deno.env.get("BOT_TOKEN"));
const kv = await Deno.openKv();

app.createGlobalCommand(watchCommand);
