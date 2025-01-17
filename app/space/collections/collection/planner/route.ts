import { getApiParams } from "@/lib/getApiParams";
import { getIdentifiers } from "@/lib/getIdentifiers";
import { handleApiError } from "@/lib/handleApiError";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { NextRequest } from "next/server";
import { RRule } from "rrule";
import { inviteLinkParams } from "./inviteLinkParams";
dayjs.extend(utc);
dayjs.extend(isBetween);
dayjs.extend(tz);

export const dynamic = "force-dynamic";
export const OPTIONS = async () => {
  return new Response("", {
    status: 200,
    headers: { "Access-Control-Allow-Headers": "*" },
  });
};

interface PerspectiveUnit {
  start: string | Dayjs;
  end: string | Dayjs;
  entities: Record<string, any>;
}

export async function GET(req: NextRequest) {
  try {
    const params = await getApiParams(req, [
      { name: "type", required: true },
      { name: "start", required: true },
      { name: "end", required: true },
      { name: "id", required: true },
      { name: "all", required: false },
      { name: "timezone", required: true },
      { name: "isPublic", required: false },
    ]);

    const { spaceId, userId } = await getIdentifiers(
      undefined,
      params.isPublic === "true"
    );
    dayjs.tz.setDefault("UTC");

    const map = {
      week: "day",
      month: "week",
      year: "month",
    };

    if (!map[params.type]) return Response.json({ error: "Invalid `type`" });

    const start = dayjs(params.start).utc();
    const end = dayjs(params.end).utc();

    // Create an array of dates as Dayjs objects for each perspective unit
    const units: PerspectiveUnit[] = Array.from(
      { length: end.diff(start, map[params.type]) },
      (_, i) => ({
        start: start.add(i, map[params.type]).toISOString(),
        end: start
          // get the next day
          .add(i + 1, map[params.type])
          // subtract 1 second to get x:59:59 (this is the end of the day we added)
          .subtract(1, "second")
          .toISOString(),
        entities: {},
      })
    );

    // Retrieve tasks in a single query
    let tasks = await prisma.entity.findMany({
      where: {
        AND: [
          params.all
            ? {}
            : {
                OR: [
                  { collectionId: params.id },
                  { collection: { inviteLink: inviteLinkParams(params.id) } },
                  { label: { collections: { some: { id: params.id } } } },
                  {
                    label: {
                      collections: {
                        some: { inviteLink: inviteLinkParams(params.id) },
                      },
                    },
                  },
                ],
              },
          {
            OR: [
              { space: { id: spaceId } },
              { collection: { invitedUsers: { some: { userId } } } },
              { collection: { inviteLink: inviteLinkParams(params.id) } },
              {
                label: {
                  collections: { some: { invitedUsers: { some: { userId } } } },
                },
              },
              {
                label: {
                  collections: {
                    some: { inviteLink: inviteLinkParams(params.id) },
                  },
                },
              },
            ],
          },
          { trash: false },
          {
            OR: [
              {
                AND: [
                  { recurrenceRule: { equals: Prisma.AnyNull } },
                  { start: { gte: start.toDate(), lte: end.toDate() } },
                ],
              },
              { recurrenceRule: { not: Prisma.AnyNull } },
            ],
          },
        ],
      },
      orderBy: { agendaOrder: "asc" },
      include: {
        completionInstances: true,
        label: true,
        subtasks: {
          where: { trash: false },
          include: {
            completionInstances: true,
          },
        },
      },
    });

    tasks = tasks.sort(
      (a, b) =>
        (a.completionInstances.length === 0 ? 0 : 1) -
        (b.completionInstances.length === 0 ? 0 : 1)
    );

    const recurringTasks = tasks.filter((task) => task.recurrenceRule);

    // Use a Map to store tasks for each perspective unit
    const tasksByUnit = new Map(units.map((unit) => [unit, {}]));

    // Populate the tasks for each perspective unit
    for (const task of recurringTasks) {
      if (!task.recurrenceRule) continue;
      const rule = new RRule({
        ...(task as any).recurrenceRule,
        dtstart: new Date((task as any).recurrenceRule.dtstart),
        until:
          (task.recurrenceRule as any).until &&
          new Date((task as any).recurrenceRule.until),
      }).between(start.toDate(), end.toDate());

      for (const dueDate of rule) {
        // SEE THIS: https://github.com/jkbrzt/rrule?tab=readme-ov-file#important-use-utc-dates

        const due = dayjs(dueDate).utc().tz(params.timezone, true);
        const unit = units.find(({ start, end }) =>
          due.isBetween(start, end, null, "[]")
        );
        if (unit) {
          tasksByUnit.set(unit, {
            ...tasksByUnit.get(unit),
            [task.id]: {
              ...task,
              recurrenceDay: due.toISOString(),
              subtasks: task.subtasks.reduce((acc, subtask) => {
                acc[subtask.id] = subtask;
                return acc;
              }, {}),
            },
          });
        }
      }
    }
    for (const task of tasks.filter((task) => task.recurrenceRule === null)) {
      const taskStart = dayjs(task.start).utc();
      const unit = units.find(({ start, end }) =>
        taskStart.isBetween(start, end, null, "[]")
      );
      if (unit) {
        tasksByUnit.set(unit, {
          ...tasksByUnit.get(unit),
          [task.id]: {
            ...task,
            subtasks: task.subtasks.reduce((acc, subtask) => {
              acc[subtask.id] = subtask;
              return acc;
            }, {}),
          },
        });
      }
    }

    const returned = units.map((unit) => ({
      start: unit.start,
      end: unit.end,
      entities: tasksByUnit.get(unit),
    }));
    return Response.json(returned);
  } catch (e) {
    return handleApiError(e);
  }
}
