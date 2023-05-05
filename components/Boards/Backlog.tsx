import {
  Box,
  CircularProgress,
  Icon,
  IconButton,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import Head from "next/head";
import Image from "next/image";
import { useApi } from "../../lib/client/useApi";
import { useSession } from "../../lib/client/useSession";
import { vibrate } from "../../lib/client/vibration";
import { ErrorHandler } from "../Error";
import { Task } from "./Board/Column/Task";
import { taskStyles } from "./Layout";

export function Backlog({ setDrawerOpen }) {
  const { data, url, error } = useApi("property/boards/backlog", {
    date: dayjs().startOf("day").subtract(1, "day").toISOString(),
  });
  const session = useSession();

  if (!data) {
    return (
      <Box
        sx={{
          width: "100%",
          height: {
            xs: "calc(100vh - var(--navbar-height) - 55px)",
            sm: "100vh",
          },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Head>
        <title>Backlog</title>
      </Head>
      <IconButton
        size="large"
        onContextMenu={() => {
          vibrate(50);
          setDrawerOpen(true);
        }}
        onClick={() => setDrawerOpen(true)}
        sx={taskStyles(session).menu}
      >
        <Icon>menu</Icon>
      </IconButton>

      {!data ||
        (data && data.length !== 0 && (
          <Box sx={{ p: 3, pb: 0, pt: 5 }}>
            <Typography className="font-heading" variant="h4" gutterBottom>
              Backlog
            </Typography>
            <Typography sx={{ mb: 2 }}>
              {data.length} unfinished tasks
            </Typography>
            {error && (
              <ErrorHandler error="Yikes! An error occured while trying to fetch your backlog. Please try again later." />
            )}
          </Box>
        ))}
      <Box
        sx={{ px: { sm: 3 }, pb: data.length == 0 ? 0 : 15, maxWidth: "100vw" }}
      >
        {data.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              userSelect: "none",
              height: {
                xs: "calc(100vh - var(--navbar-height) - 55px)",
                sm: "100vh",
              },
            }}
          >
            <Image
              src="/images/backlog.png"
              width={256}
              height={256}
              alt="Backlog"
              style={{
                ...(session.user.darkMode && {
                  filter: "invert(100%)",
                }),
              }}
            />
            <Box sx={{ width: "300px", maxWidth: "calc(100vw - 40px)", mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: -2 }}>
                You&apos;re on top of it!
              </Typography>
              <Typography variant="body1">
                The backlog is a place where you can see all your unfinished
                tasks.
              </Typography>
            </Box>
          </Box>
        )}
        {[
          ...data.filter((task) => task.pinned),
          ...data.filter((task) => !task.pinned),
        ].map((task) => (
          <Task
            isDateDependent={true}
            key={task.id}
            board={task.board || false}
            columnId={task.column ? task.column.id : -1}
            mutationUrl={url}
            task={task}
          />
        ))}
      </Box>
    </Box>
  );
}
