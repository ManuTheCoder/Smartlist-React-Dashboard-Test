import hexToRgba from "hex-to-rgba";
import React from "react";
import { colors } from "../../../lib/colors";
import { updateSettings } from "../../Settings/updateSettings";

import { openSpotlight, SpotlightProvider } from "@mantine/spotlight";
import { Button, Divider, Icon, IconButton, Tooltip } from "@mui/material";
import { useRouter } from "next/router";

import {
  Badge,
  createStyles,
  Group,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { SpotlightActionProps } from "@mantine/spotlight";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { fetchApiWithoutHook, useApi } from "../../../hooks/useApi";

function CustomAction({
  action,
  styles,
  classNames,
  hovered,
  onTrigger,
  ...others
}: SpotlightActionProps) {
  const useStyles: any = createStyles((theme: any | null) => ({
    action: {
      position: "relative",
      display: "block",
      width: "100%",
      padding: "10px 12px",
      borderRadius: theme.radius.sm,
    },

    actionHovered: {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[1],
    },
  }));

  const { classes, cx } = useStyles(null, {
    styles,
    classNames,
    name: "Spotlight",
  });

  return (
    <UnstyledButton
      className={cx(classes.action, { [classes.actionHovered]: hovered })}
      tabIndex={-1}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onTrigger}
      {...others}
      sx={{
        "&:hover": {
          background: "#eee",
          color: "#000",
        },
        "&:active, &:focus": {
          background: "#ddd",
          color: "#000",
        },
        color: "#505050",
        fontWeight: 400,
      }}
    >
      {action.divider ? (
        <Group noWrap>
          <Divider sx={{ my: 2 }} />
        </Group>
      ) : (
        <Group noWrap>
          {action.icon}
          <div style={{ flex: 1 }}>
            <Text>{action.title}</Text>

            {action.description && (
              <Text color="dimmed" size="xs">
                {action.description}
              </Text>
            )}
          </div>

          {action.badge && <Badge>{action.badge}</Badge>}
        </Group>
      )}
    </UnstyledButton>
  );
}

export function SearchPopup() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const { data: roomData } = useApi("property/rooms");
  const { data: boardData } = useApi("property/boards");

  const actions: any = [
    {
      title: "Boards",
      onTrigger: () => router.push("/tasks"),
      icon: <Icon className="outlined">verified</Icon>,
    },
    {
      title: "Coach",
      onTrigger: () => router.push("/coach"),
      icon: <Icon className="outlined">routine</Icon>,
    },
    {
      title: "Items",
      onTrigger: () => router.push("/items"),
      icon: <Icon className="outlined">category</Icon>,
    },
    {
      title: "Spaces",
      onTrigger: () => router.push("/spaces"),
      icon: <Icon className="outlined">view_agenda</Icon>,
    },
    {
      title: "Light theme",
      onTrigger: () => {
        global.setTheme("light");
        updateSettings("darkMode", "false");
      },
      icon: <Icon className="outlined">light_mode</Icon>,
    },
    {
      title: "Dark theme",
      onTrigger: () => {
        global.setTheme("dark");
        updateSettings("darkMode", "true");
      },
      icon: <Icon className="outlined">dark_mode</Icon>,
    },
    ...(roomData
      ? roomData.map((room: any) => {
          return {
            title: room.name,
            onTrigger: () => router.push(`/rooms/${room.id}`),
            icon: <Icon className="outlined">category</Icon>,
            badge: "Room",
          };
        })
      : []),

    ...(boardData
      ? boardData.map((room: any) => {
          return {
            title: room.name,
            onTrigger: () => router.push(`/tasks#${room.id}`),
            icon: (
              <Icon className="outlined">
                {room.type === "board" ? "view_kanban" : "task_alt"}
              </Icon>
            ),
            badge: room.type === "board" ? "Board" : "Checklist",
          };
        })
      : []),

    ...(global.user && global.user.properties
      ? global.user.properties.map((property: any) => {
          return {
            title: property.profile.name,
            onTrigger: () => {
              fetchApiWithoutHook("property/join", {
                email: global.user.email,
                accessToken1: property.accessToken,
              }).then((res) => {
                toast(
                  <>
                    Currently viewing&nbsp;&nbsp;&nbsp;<u>{res.profile.name}</u>
                  </>
                );
                mutate("/api/user");
              });
            },
            icon: <Icon className="outlined">home</Icon>,
            badge: "Group",
          };
        })
      : []),

    ...(global.property.profile.type !== "study group"
      ? [
          "Kitchen:blender",
          "Bedroom:bedroom_parent",
          "Bathroom:bathroom",
          "Garage:garage",
          "Dining room:dining",
          "Living room:living",
          "Laundry room:local_laundry_service",
          "Storage room:inventory_2",
          "Garden:yard",
          "Camping:camping",
        ]
      : ["Backpack:backpack"].map((room) => {
          const [name, icon] = room.split(":");
          return {
            title: name,
            onTrigger: () =>
              router.push(`/rooms/${name.toLowerCase().replace(" ", "-")}`),
            icon: <Icon className="outlined">{icon}</Icon>,
            badge: "Room",
          };
        })),

    {
      title: "Feedback center",
      onTrigger: () => {
        router.push("/feedback");
      },
      icon: <Icon className="outlined">chat_bubble</Icon>,
    },
    {
      title: "Discord",
      onTrigger: () => {
        window.open("https://discord.gg/fvngmDzh77");
      },
      icon: <Icon className="outlined">chat_bubble</Icon>,
    },
  ];

  return (
    <>
      <SpotlightProvider
        limit={7}
        // highlightQuery
        actions={actions}
        shortcut={["mod + P", "mod + K", "/"]}
        searchIcon={<Icon>search</Icon>}
        searchPlaceholder="Search..."
        actionComponent={CustomAction}
        nothingFoundMessage="Nothing found..."
      >
        <Button
          disabled={!window.navigator.onLine}
          onClick={() => openSpotlight()}
          disableFocusRipple
          sx={{
            background: global.user.darkMode
              ? "hsl(240,11%,15%)!important"
              : `${colors[themeColor][50]}!important`,
            "&:hover": {
              background: global.user.darkMode
                ? "hsl(240,11%,15%)!important"
                : `${hexToRgba(colors[themeColor][100], 0.5)}!important`,
            },
            transition: "none !important",
            "&:hover, &:active": {
              cursor: "pointer",
            },
            width: "30vw",
            justifyContent: "start",
            "& .MuiTouchRipple-rippleVisible": {
              transitionDuration: ".2s!important",
            },
            px: 2,
            ml: "auto",
            cursor: "text",
            color: global.user.darkMode
              ? "hsl(240,11%,95%)!important"
              : colors[themeColor][900],
            display: { xs: "none", sm: "flex" },
            height: "45px",
            gap: 2,
            borderRadius: 3,
            "&:hover .hover": {
              opacity: 1,
            },
          }}
          className={global.user.darkMode ? "rippleDark" : ""}
        >
          <Icon>bolt</Icon>
          Jump to
          <span className="hover" style={{ marginLeft: "auto" }}>
            <span
              style={{
                padding: "2px 5px",
                borderRadius: "5px",
                background: global.user.darkMode
                  ? "hsl(240,11%,20%)"
                  : colors[themeColor][100],
              }}
            >
              ctrl
            </span>{" "}
            <span
              style={{
                padding: "2px 5px",
                borderRadius: "5px",
                background: global.user.darkMode
                  ? "hsl(240,11%,20%)"
                  : colors[themeColor][100],
              }}
            >
              k
            </span>
          </span>
        </Button>
        <Tooltip
          title="Jump to"
          PopperProps={{
            sx: { mt: "-5px!important" },
          }}
        >
          <IconButton
            disabled={!window.navigator.onLine}
            disableRipple
            onClick={() => openSpotlight()}
            color="inherit"
            sx={{
              borderRadius: 94,
              mr: 1,
              ml: 0.6,
              display: { sm: "none" },
              color: {
                xs: global.theme == "dark" ? "hsl(240,11%,95%)" : "#606060",
              },
              transition: "all .2s",
              "&:active": {
                opacity: 0.5,
                transition: "none",
              },
            }}
          >
            <Icon className="outlined">search</Icon>
          </IconButton>
        </Tooltip>
      </SpotlightProvider>
    </>
  );
}
