import { verifyKey } from "npm:discord-interactions";
import './refresh.js'

// Commands: /watch class|section [CS-XXXX]|XXXXX
const kv = await Deno.openKv();

Deno.serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");
  if (!signature || !timestamp) {
    return new Response("Bad request signature", { status: 401 });
  }

  const isValidRequest = await verifyKey(
    body,
    signature,
    timestamp,
    Deno.env.get("PUBLIC_KEY") ?? "",
  );
  if (!isValidRequest) {
    return new Response("Bad request signature", {
      status: 401,
    });
  }

  const i = JSON.parse(body);
  if (i.type === 1) {
    return new Response(JSON.stringify({ type: 1 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (i.type === 2) {
    const command = i.data.options[0];
    const userId = i.member.user.id;
    const commandVal = command.options[0].value.trim();
    const userData = (await kv.get(["users", userId])).value ?? {
      id: userId,
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

    return new Response(
      JSON.stringify({
        type: 4,
        data: {
          content:
            `Added ${commandVal} to the watch-list! You will get a notification when the class/section becomes available.`,
          flags: 64,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (i.type == 3) {
    const crn = i.message.embeds[0].fields[1].value;
    const course = i.message.embeds[0].fields[0].value;
    const user = i.user.id;
    const userData = (await kv.get(["users", user])).value;

    if (userData) {
      if (i.data.custom_id == "cancelSection") {
        userData.sections.delete(crn);
        i.message.components[0].components[0].disabled = true;
        i.message.components[0].components[0].label =
          "No longer monitoring section";
        if (userData.sections.size == 0) {
          i.message.components[0].components[1].disabled = true;
          i.message.components[0].components[1].label =
            "No longer monitoring class";
        }
      }
      if (i.data.custom_id == "cancelClass") {
        userData.classes.delete(course);
        i.message.components[0].components[1].disabled = true;
        i.message.components[0].components[0].disabled = true;
        i.message.components[0].components[1].label =
          "No longer monitoring class";
        i.message.components[0].components[0].label =
          "No longer monitoring section";
      }
      await kv.set(["users", user], userData);
    }
  }

  return new Response(
    JSON.stringify({
      type: 7,
      data: {
        ...i.message,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
});
