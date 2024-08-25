import { scrape } from "./scrape.js";
import { bot } from "./discord.js";

Deno.cron("Check for openings", "* * * * *", async () => {
  const scrapeResults = await scrape();
  const kv = await Deno.openKv();
  for (const section in scrapeResults) {
    insertSection(section);
    for await (const { key, value } of kv.list(["users"])) {
      if (value.sections.has(section.crn) || value.classes.has(section.class)) {
        const msg = `New section opening: ${section.toString()}`;
        const dm = await bot.createDM(key[1]);
        bot.sendMessage(dm.id, msg);
      }
    }
  }
});
