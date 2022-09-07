import { prisma } from "../../../../lib/client";
import { validatePermissions } from "../../../../lib/validatePermissions";

const handler = async (req: any, res: any) => {
  const permissions = await validatePermissions(
    req.query.property,
    req.query.accessToken
  );
  if (!permissions || permissions === "read-only") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const data: any | null = await prisma.customRoom.delete({
    data: {
      name: req.query.name,
      pinned: false,
      property: {
        connect: { id: req.query.property },
      },
    },
    include: {
      property: true,
    },
  });

  res.json(data);
};
export default handler;
