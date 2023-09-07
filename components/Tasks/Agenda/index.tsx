import { useSession } from "@/lib/client/session";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import { toastStyles } from "@/lib/client/useTheme";
import {
  Box,
  Button,
  CircularProgress,
  Icon,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useHotkeys } from "react-hotkeys-hook";
import useSWR from "swr";
import { WidgetBar } from "../Layout/widgets";
import Column from "./Column";

export const AgendaContext = createContext<any>(null);

/**
 * Agenda container
 * "days": Opens days in week
 * "week": Opens weeks in month
 * "months": Opens months in year
 *
 * @param {string} type
 * @param {string} date
 */
export function Agenda({ type, date }) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("all");

  const columnMap = {
    days: isMobile ? "day" : "week",
    weeks: isMobile ? "week" : "month",
    months: isMobile ? "month" : "year",
  };

  const viewHeadingFormats = {
    days: "MMMM",
    weeks: "MMMM",
    months: "YYYY",
  };

  const viewSubHeadingFormats = {
    days: "YYYY",
    weeks: "YYYY",
    months: "-",
  };

  const handleNext = () => {
    const next = dayjs(date).add(1, columnMap[type]).format("YYYY-MM-DD");
    router.push(`/tasks/agenda/${type}/${next}`);
  };

  const handlePrev = () => {
    const prev = dayjs(date).subtract(1, columnMap[type]).format("YYYY-MM-DD");
    router.push(`/tasks/agenda/${type}/${prev}`);
  };

  const start = dayjs(date).startOf(columnMap[type]);
  const end = dayjs(date).endOf(columnMap[type]);

  // Create an array of columns for each [type] in [columnMap]
  const columns = Array.from(
    { length: Math.ceil(end.diff(start, type, true)) },
    (_, index) => start.clone().add(index, type)
  );

  const {
    data,
    mutate: mutateList,
    error,
  } = useSWR([
    "property/tasks/agenda",
    {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    },
  ]);

  const session = useSession();
  const isDark = useDarkMode(session.darkMode);
  const palette = useColor(session.themeColor, isDark);

  const scrollIntoView = () => {
    const column = document.getElementById("active");
    if (column) {
      column.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  };

  useEffect(() => {
    if (data) {
      scrollIntoView();
    }
  }, [data]);

  useHotkeys("esc", () => {
    if (view === "priority") {
      document.getElementById("exitFocus")?.click();
    }
  });

  return (
    <AgendaContext.Provider value={{ start, end, mutateList, type }}>
      <Head>
        <title>
          {dayjs(start).format(viewHeadingFormats[type])} &bull;{" "}
          {dayjs(start).format(viewSubHeadingFormats[type])}
        </title>
      </Head>
      {!isMobile && <WidgetBar view={view} setView={setView} />}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          height: "100%",
          minHeight: "100dvh",
        }}
      >
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          style={{
            width: "100%",
            // zIndex: 999,
            overflow: "visible",
          }}
        >
          <Box
            sx={{
              px: 4,
              pt: "env(titlebar-area-height, 10px)",
              pb: "10px",
              textAlign: "left",
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              background:
                view === "priority"
                  ? ""
                  : `linear-gradient(${palette[1]}, ${palette[2]})`,
              borderBottom: `1.5px solid ${
                palette[view === "priority" ? 3 : 2]
              }`,
              width: "100%",
              transition: "all .2s",

              ...(view === "priority" && {
                "& .priority-hidden": {
                  opacity: 0,
                  transition: "opacity 0.2s",
                },
                "&:hover .priority-hidden": {
                  opacity: 1,
                },
              }),
            }}
          >
            <Box>
              <AnimatePresence mode="wait">
                <motion.div
                  key={dayjs(start).format(viewHeadingFormats[type])}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Typography sx={{ fontWeight: 900 }}>
                    {dayjs(start).format(viewHeadingFormats[type])}
                  </Typography>
                  {viewSubHeadingFormats[type] !== "-" && (
                    <Typography variant="body2" sx={{ mt: -0.5 }}>
                      {dayjs(start).format(viewSubHeadingFormats[type])}
                    </Typography>
                  )}
                </motion.div>
              </AnimatePresence>
            </Box>
            <Box
              sx={{
                ml: "auto",
                ...(view === "priority" && { visibility: "hidden" }),
                background: `linear-gradient(45deg, ${palette[6]}, ${palette[9]})`,
                "&:hover": {
                  boxShadow: `0 0 25px 1px ${palette[8]}`,
                  background: `linear-gradient(45deg, ${palette[11]}, ${palette[9]})`,
                },
                "&:active": {
                  transform: "scale(.95)",
                },
                transition: "transform .2s",
                display: "flex",
                width: "146px",
                height: "46px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
              }}
            >
              <Box
                sx={{
                  "&, &:hover": {
                    background: `linear-gradient(${palette[1]},${palette[2]})`,
                  },
                  width: "140px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 999,
                  justifyContent: "center",
                  gap: 2,
                }}
                onClick={() => {
                  setView("priority");
                  scrollIntoView();
                  toast.dismiss();
                  toast("Focus mode", {
                    ...toastStyles,
                    icon: <Icon>target</Icon>,
                  });
                }}
              >
                <Icon className="outlined">target</Icon>Focus
              </Box>
            </Box>
            <Box sx={{ ml: "auto" }}>
              <IconButton
                onClick={async () => {
                  setLoading(true);
                  await mutateList();
                  setLoading(false);
                }}
                disabled={loading}
                className="priority-hidden"
              >
                <Icon
                  className="outlined"
                  sx={{
                    transform: loading
                      ? "scale(1.2) rotate(360deg)"
                      : "scale(1.2)",
                    transition: loading ? "transform 0.5s ease" : "",
                  }}
                >
                  refresh
                </Icon>
              </IconButton>
              <IconButton
                onClick={handlePrev}
                id="agendaPrev"
                className="priority-hidden"
              >
                <Icon className="outlined">arrow_back_ios_new</Icon>
              </IconButton>
              <Button
                className="priority-hidden"
                id="agendaToday"
                onClick={() =>
                  router.push(
                    `/tasks/agenda/${type}/${dayjs().format("YYYY-MM-DD")}`
                  )
                }
                disabled={dayjs(start) <= dayjs() && dayjs() <= dayjs(end)}
                size="large"
                sx={{
                  px: 0,
                  color: "inherit",
                  ...(dayjs(start) <= dayjs() &&
                    dayjs() <= dayjs(end) && { display: "none" }),
                }}
              >
                Today
              </Button>
              <IconButton
                onClick={handleNext}
                id="agendaNext"
                className="priority-hidden"
              >
                <Icon className="outlined">arrow_forward_ios</Icon>
              </IconButton>
            </Box>
          </Box>
        </motion.div>
        <Box
          sx={{
            ...(!data && {
              alignItems: "center",
              justifyContent: "center",
            }),
            display: "flex",
            flexDirection: "row",
            flexGrow: 1,
            maxWidth: "100%",
            overflowX: { xs: "hidden", sm: "auto" },
            width: "100%",
            height: "100%",
          }}
        >
          {data && columns?.length > 0 ? (
            columns.map((column: any) => (
              <Column key={column} column={column} data={data} view={view} />
            ))
          ) : (
            <CircularProgress />
          )}
        </Box>
      </Box>
    </AgendaContext.Provider>
  );
}
