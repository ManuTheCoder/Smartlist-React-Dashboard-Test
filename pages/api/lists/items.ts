import executeQuery from "../../../lib/db";
import { validatePerms } from "../../../lib/check-permissions";
import type { NextApiResponse } from "next";
import CryptoJS from "crypto-js";

const handler = async (req: any, res: NextApiResponse<any>) => {
  const perms = await validatePerms(
    req.query.propertyToken,
    req.query.accessToken
  );
  if (!perms) {
    res.json({
      error: "INSUFFICIENT_PERMISSIONS",
    });
    return;
  }

  try {
    const result = await executeQuery({
      query: req.query.custom
        ? `
        SELECT 
        ListNames.id AS listId, 
        ListNames.title AS listTitle, 
        ListNames.description AS listDescription,
        ListNames.user AS listUser,
        ListItems.title AS itemTitle,
        ListItems.description AS itemDescription,
        ListItems.pinned AS itemPinned
          FROM ListNames INNER JOIN ListItems ON 
        ListItems.parent = ? AND 
        ListNames.id = ? AND 
        ListItems.user = ? AND
        ListNames.user = ?
        `
        : "SELECT * FROM ListItems WHERE parent = ? AND user = ? ORDER BY ID ASC",
      values: req.query.custom
        ? [
            req.query.id,
            req.query.id,
            req.query.propertyToken ?? "false",
            req.query.propertyToken ?? "false",
          ]
        : [(req.query.parent, req.query.propertyToken ?? false)],
    });
    if (req.query.custom) {
      res.json({
        data: result,
      });
    } else {
      res.json({
        data: result.map((item) => {
          return {
            ...item,
            title: CryptoJS.AES.decrypt(
              item.title,
              process.env.LIST_ENCRYPTION_KEY
            ).toString(CryptoJS.enc.Utf8),
            description: CryptoJS.AES.decrypt(
              item.description,
              process.env.LIST_ENCRYPTION_KEY
            ).toString(CryptoJS.enc.Utf8),
          };
        }),
      });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
export default handler;
