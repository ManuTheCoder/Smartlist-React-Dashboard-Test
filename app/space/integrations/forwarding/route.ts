import ForwardedEmail from "@/emails/forwarded";
import { getApiParams } from "@/lib/getApiParams";
import { handleApiError } from "@/lib/handleApiError";
import { prisma } from "@/lib/prisma";
import { generateRandomString } from "@/lib/randomString";
import { render } from "@react-email/components";
import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";

export const OPTIONS = async () => {
  return new Response("", {
    status: 200,
    headers: { "Access-Control-Allow-Headers": "*" },
  });
};
const footer = `\n\n Don't reply to this email - it's autogenerated. If you have any questions, please reach out to hello@dysperse.com`;

export async function POST(req: NextRequest) {
  try {
    const params = await getApiParams(
      req,
      [
        { name: "from", required: true },
        { name: "subject", required: true },
        { name: "description", required: true },
      ],
      { type: "BODY" }
    );

    const user = await prisma.user.findFirst({
      where: { email: params.from },
      select: {
        spaces: { where: { selected: true } },
        profile: { select: { name: true } },
      },
    });

    if (!user) {
      return Response.json({
        success: false,
        subject: "😔 Oh no! We couldn't find your account.",
        body: render(
          ForwardedEmail({
            error: "We couldn't find your account.",
            toEmail: params.from,
          })
        ),
      });
    }

    const data = await prisma.entity.create({
      data: {
        type: "TASK",
        name: params.subject,
        note: params.description,
        shortId: generateRandomString(6),
        published: true,
        space: { connect: { id: user.spaces[0].id } },
      },
    });

    return Response.json({
      success: true,
      subject: "🎉 #dysperse added your email as a task!",
      body: render(
        ForwardedEmail({
          toEmail: params.from,
          toName: (user.profile as any).name,
          shortId: (data as any).shortId,
        })
      ),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
