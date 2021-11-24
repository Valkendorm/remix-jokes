import { PrismaClient } from "@prisma/client";
let db = new PrismaClient();

async function seed() {
  let kody = await db.user.create({
    data: {
      username: "kody",
      // this is a hashed version of "twixrox"
      passwordHash:
        "$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
    },
  });

  await Promise.all(
    getJokes().map((joke) => {
      let data = { jokesterId: kody.id, ...joke };
      return db.joke.create({ data });
    })
  );
}

seed();

function getJokes() {
  return [
    {
      name: "Lessons",
      content:
        "I wear a stethoscope so that in a medical emergency I can teach people a valuable lesson about assumptions.",
    },
    {
      name: "Comedian",
      content:
        "They laughed when I said I wanted to be a comedian - they’re not laughing now.",
    },
    {
      name: "Balloon",
      content:
        "You will never guess what Elsa did to the balloon. She let it go.",
    },
    {
      name: "Enough Shipping",
      content:
        "Did you hear the news? FedEx and UPS are merging. They’re going to go by the name Fed-Up from now on.",
    },
    {
      name: "Turn Around",
      content: "What is a tornado's favorite game to play? Twister!",
    },
    {
      name: "Holy",
      content: "How do you make holy water? You boil the hell out of it.",
    },
    {
      name: "Road worker",
      content: `I never wanted to believe that my Dad was stealing from his job as a road worker. But when I got home, all the signs were there.`,
    },
    {
      name: "Frisbee",
      content: `I was wondering why the frisbee was getting bigger, then it hit me.`,
    },
    {
      name: "Trees",
      content: `Why do trees seem suspicious on sunny days? Dunno, they're just a bit shady.`,
    },
    {
      name: "Skeletons",
      content: `Why don't skeletons ride roller coasters? They don't have the stomach for it.`,
    },
    {
      name: "Hippos",
      content: `Why don't you find hippopotamuses hiding in trees? They're really good at it.`,
    },
    {
      name: "Dinner",
      content: `What did one plate say to the other plate? Dinner is on me!`,
    },
    {
      name: "Elevator",
      content: `My first time using an elevator was an uplifting experience. The second time let me down.`,
    },
  ];
}
