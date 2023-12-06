import { DispatchNotification } from "@/lib/server/notification";
import { prisma } from "@/lib/server/prisma";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { headers } from "next/headers";
dayjs.extend(timezone);
dayjs.extend(utc);

export async function POST() {
  if (
    headers().get("Authorization") !== `Bearer ${process.env.CRON_API_KEY}` &&
    process.env.NODE_ENV === "production"
  ) {
    return Response.json({
      currentHeaders: headers().get("Authorization"),
      error: "Unauthorized",
    });
  }

  const _subscriptions = await prisma.notificationSettings.findMany({
    where: {
      AND: [
        { planDay: true },
        { pushSubscription: { not: Prisma.AnyNull } },
        // { user: { email: "manusvathgurudath@gmail.com" } },
      ],
    },
    select: {
      pushSubscription: true,
      planDayHour: true,
      user: { select: { email: true, timeZone: true } },
    },
  });

  const subscriptions = _subscriptions.filter((user) => {
    if (
      process.env.NODE_ENV !== "production" &&
      user.user.email !== "manusvathgurudath@gmail.com"
    ) {
      return false;
    } else {
      return true;
    }
  });

  const prompts = [
    "What will you do to make your day impactful?",
    "What are your top three goals for today!?",
    "Let's plan your day!",
    "How will you manage and prioritize your time efficiently today?",
  ];
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];

  const notificationPromises = subscriptions.map(
    (subscription) =>
      new Promise((resolve, reject) => {
        try {
          if (
            subscription.planDayHour ===
            dayjs().tz(subscription.user.timeZone).hour()
          )
            resolve(
              DispatchNotification({
                actions: [{ action: "plan", title: "👉 Let's go" }],
                subscription: subscription.pushSubscription,
                title: "Good morning!",
                body: prompt,
              })
            );
          else {
            console.log(
              subscription.planDayHour,
              dayjs().tz(subscription.user.timeZone).hour()
            );
            resolve("");
          }
        } catch (e) {
          reject(e);
        }
      })
  );

  await Promise.allSettled(notificationPromises);
  return Response.json({ success: true });
}