import { prisma } from "../../../../lib/prismaClient";
import { validatePermissions } from "../../../../lib/validatePermissions";

const handler = async (req, res) => {
  const permissions = await validatePermissions(
    req.query.property,
    req.query.accessToken
  );
  if (!permissions) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  //  List all tasks for a board from the column
  const data = await prisma.column.findMany({
    cacheStrategy: { swr: 60, ttl: 60 },
    where: {
      board: {
        id: req.query.id,
      },
    },
    include: {
      tasks: {
        include: {
          subTasks: true,
          parentTasks: true,
        },
      },
    },
  });

  res.json(data);
};

export default handler;
