import DiscordApp from "https://raw.githubusercontent.com/Roosteridk/discord-interactions-framework/main/src/mod.ts";

// Commands: /watch class|section [CS-XXXX]|XXXXX

class App extends DiscordApp {
    interactionHandler(i) {

    }
}

const app = new App(Deno.env.get("APP_ID"), Deno.env.get("PUBLIC_KEY"))
const bot = app.createBot(Deno.env.get("BOT_TOKEN"))