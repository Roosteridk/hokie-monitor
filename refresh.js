import { scrape } from "./scrape.js";

Deno.cron("Check for openings", "* * * * *", async () => {
  const scrapeResults = await scrape();
  console.log("Scraped " + scrapeResults.size + " sections");
  const kv = await Deno.openKv();
  for await (
    const { value } of kv.list({ prefix: ["users"] })
  ) {
    for (const section of scrapeResults) {
      if (value.sections.has(section.crn) || value.classes.has(section.class)) {
        const msg = `New section opening: ${JSON.stringify(section)}`;
        console.log(msg);

        const res = await fetch(
          "https://discord.com/api/v10/users/@me/channels",
          {
            method: "POST",
            body: JSON.stringify({
              recipient_id: value.id,
            }),
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bot " + Deno.env.get("BOT_TOKEN"),
            },
          },
        );
        const channel = await res.json();
        fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
          method: "POST",
          body: JSON.stringify({
            content: "",
            embeds: [
              {
                title: `New opening for ${section.title}`,
                color: 0xE5751F,
                fields: [
                  {
                    name: "Course",
                    value: section.class,
                    inline: true,
                  },
                  {
                    name: "CRN",
                    value: section.crn,
                    inline: true,
                  },
                ],
              },
            ],
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 4,
                    label: "Stop monitoring section",
                    custom_id: "cancelSection",
                  },
                  {
                    type: 2,
                    style: 4,
                    label: "Stop monitoring class",
                    custom_id: "cancelClass",
                  },
                ],
              },
            ],
          }),
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bot " + Deno.env.get("BOT_TOKEN"),
          },
        });
      }
    }
  }
});
