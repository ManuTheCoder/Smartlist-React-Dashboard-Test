import { ErrorHandler } from "@/components/Error";
import { addHslAlpha } from "@/lib/client/addHslAlpha";
import { useSession } from "@/lib/client/session";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Icon,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect } from "react";
import useSWR from "swr";

function AvailabilityCalendar({ data }) {
  const session = useSession();
  const palette = useColor(
    session?.themeColor || "violet",
    useDarkMode(session?.darkMode || "system")
  );

  const startDate = dayjs(data.startDate).tz(data.timeZone).startOf("day");
  const endDate = dayjs(data.endDate).tz(data.timeZone).startOf("day");
  const days = endDate.diff(startDate, "day") + 1;
  const times = 24;

  const grid = [...Array(days)].map((_, i) => {
    return [...Array(times)].map((_, j) => {
      const date = startDate.add(i, "day").set("hour", j);
      const availability = data.participants?.find((a) =>
        dayjs(a.date).isSame(date)
      );
      return {
        date,
        availability,
      };
    });
  });

  const handleScroll = (e) => {
    // sync scroll all `.scroller` elements
    const scrollers = document.querySelectorAll(".scroller");
    scrollers.forEach((scroller) => {
      if (scroller !== e.target) {
        scroller.scrollTop = e.currentTarget.scrollTop;
      }
    });
  };

  const headerStyles = {
    p: 2,
    mb: 2,
    px: 3,
    top: 0,
    zIndex: 999,
    position: "sticky",
    height: "95px",
    display: "flex",
    flex: "0 0 95px",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    color: palette[11],
    backdropFilter: "blur(2px)",
    background: addHslAlpha(palette[2], 0.5),
    borderBottom: `2px solid ${addHslAlpha(palette[4], 0.5)}`,
  };

  const handleMultiSelect = (i) => {};

  return (
    <>
      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          mt: { xs: 2, sm: 0 },
          gap: 2,
          order: { xs: 2, sm: -1 },
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            background: palette[2],
            borderRadius: 3,
            maxHeight: "calc(calc(100dvh - var(--navbar-height)) - 20px)",
            mt: { sm: "calc(var(--navbar-height))" },
            overflowY: "auto",
          }}
          className="scroller"
          onScroll={handleScroll}
        >
          <Box sx={headerStyles} />
          {[...new Array(times)].map((_, i) => (
            <Button
              size="small"
              onClick={() => handleMultiSelect(i)}
              sx={{ height: "35px", flexShrink: 0, borderRadius: 0 }}
              key={i}
            >
              <Icon>check_box_outline_blank</Icon>
            </Button>
          ))}
        </Box>
        {grid.map((row, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              flexDirection: "column",
              background: palette[2],
              borderRadius: 3,
              maxHeight: "calc(calc(100dvh - var(--navbar-height)) - 20px)",
              mt: { sm: "var(--navbar-height)" },
              overflowY: "auto",
            }}
            className="scroller"
            onScroll={handleScroll}
          >
            <Box
              sx={headerStyles}
              onClick={(e: any) =>
                (e.currentTarget.parentElement.scrollTop = 0)
              }
            >
              <Box
                sx={{
                  display: "flex",
                  background: addHslAlpha(palette[7], 0.5),
                  color: palette[12],
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  fontWeight: 900,
                  fontSize: 20,
                }}
              >
                {startDate.add(i, "day").format("DD")}
              </Box>
              <Typography variant="body2" sx={{ mt: 0.5, mb: -0.5 }}>
                {startDate.add(i, "day").format("ddd").toUpperCase()}
              </Typography>
            </Box>
            {row.map((col, j) => (
              <Button
                size="small"
                key={j}
                sx={{ height: "35px", borderRadius: 0, flexShrink: 0 }}
              >
                {col.date.format("hA")}
              </Button>
            ))}
          </Box>
        ))}
      </Box>
    </>
  );
}

export default function Page() {
  const session = useSession();
  const router = useRouter();
  const palette = useColor(
    session?.themeColor || "violet",
    useDarkMode(session?.darkMode || "system")
  );

  const { data, mutate, isLoading, error } = useSWR(
    router?.query?.id ? ["availability/event", { id: router.query.id }] : null
  );

  useEffect(() => {
    document.documentElement.classList.add("allow-scroll");
    document.body.style.background = palette[1];
  }, [palette]);

  return (
    <Box
      sx={{
        color: palette[12],
        height: "auto",
      }}
    >
      <AppBar
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          border: 0,
        }}
      >
        <Toolbar>
          {session && (
            <IconButton onClick={() => router.push("/availability")}>
              <Icon>arrow_back_ios_new</Icon>
            </IconButton>
          )}
          {!session && (
            <Button
              variant="contained"
              onClick={() =>
                router.push(
                  "/auth?next=" + encodeURIComponent(window.location.href)
                )
              }
              sx={{ ml: "auto" }}
            >
              Sign in <Icon>login</Icon>
            </Button>
          )}
        </Toolbar>
      </AppBar>
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100dvh",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {error && (
        <ErrorHandler
          error="Something went wrong. Please try again later."
          callback={mutate}
        />
      )}
      {data && (
        <Box
          sx={{
            p: { xs: 3, sm: 5 },
            mt: { xs: "var(--navbar-height)", sm: "0" },
            display: "flex",
            alignItems: "center",
            flexDirection: { xs: "column", md: "row" },
            maxHeight: { sm: "100dvh" },
            overflow: "hidden",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="h2"
              sx={{ color: palette[11] }}
              className="font-heading"
            >
              {data.name}
            </Typography>
            <Typography sx={{ color: palette[11], opacity: 0.7 }}>
              Tap on a time slot to mark your availability.
            </Typography>
          </Box>
          <AvailabilityCalendar data={data} />
        </Box>
      )}
    </Box>
  );
}
