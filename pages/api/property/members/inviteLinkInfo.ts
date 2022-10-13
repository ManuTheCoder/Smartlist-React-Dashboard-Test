import { prisma } from "../../../../lib/prismaClient";

/**
 * API handler
 * @param {any} req
 * @param {any} res
 * @returns {any}
 */
const handler = async (req, res) => {
  const data = await prisma.propertyLinkInvite.findUnique({
    where: {
      token: req.query.token,
    },
    select: {
      property: true,
    },
  });

  res.json(data ? data : { error: "Invalid token" });
};
export default handler;
