// new design for settings. `edit.ts` edits the `User` table, while this edits the new `Settings` table

// Update user settings
import { prisma } from "@/lib/server/prisma";
import { validateParams } from "@/lib/server/validateParams";

const handler = async (req, res) => {
  validateParams(req.query, ["sessionId"]);

  const session = await prisma.session.findFirstOrThrow({
    where: {
      id: req.query.sessionId,
    },
    select: {
      user: {
        select: { name: true, identifier: true },
      },
    },
  });

  const temp = {
    ...(req.query.hiddenPerspectives && {
      hiddenPerspectives: {
        set: JSON.parse(req.query.hiddenPerspectives),
      },
    }),
    user: {
      connect: {
        identifier: session.user.identifier,
      },
    },
  };

  console.log(session.user);

  const user = await prisma.settings.upsert({
    where: {
      userId: session.user.identifier,
    },
    create: temp,
    update: temp,
  });

  console.log(user);
  res.json(user);
};
export default handler;