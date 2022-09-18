import { Global } from "@emotion/react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CssBaseline from "@mui/material/CssBaseline";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Skeleton from "@mui/material/Skeleton";
import { styled } from "@mui/material/styles";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Typography from "@mui/material/Typography";
import type { Room } from "../../types/room";
import React, { useEffect } from "react";
import useSWR from "swr";
import { colors } from "../../lib/colors";
import { neutralizeBack, revivalBack } from "../history-control";
import { Puller } from "../Puller";
import { CreateItemModal } from "./CreateItemModal";

import { useHotkeys } from "react-hotkeys-hook";

const Root = styled("div")(() => ({
  height: "100%",
}));

/**
 * Item popup option
 * @param alias Room alias to replace room title
 * @param toggleDrawer Function to toggle drawer
 * @param icon Icon to display in drawer
 * @param title Title to display in drawer
 * @returns JSX.Element
 */
function AddItemOption({
  alias,
  toggleDrawer,
  icon,
  title,
}: {
  alias?: string;
  toggleDrawer: (toggle: boolean) => void;
  icon: JSX.Element | string;
  title: JSX.Element | string;
}): JSX.Element {
  /**
   * Handle drawer close
   */
  const handleDrawerClose = () => toggleDrawer(false);

  return (
    <Grid item xs={12} sm={4}>
      <CreateItemModal room={title} alias={alias}>
        <Card
          sx={{
            textAlign: {
              sm: "center",
            },
            boxShadow: 0,
            borderRadius: { xs: 1, sm: 6 },
            transition: "transform .2s",
            "&:active": {
              boxShadow: "none!important",
              transform: "scale(0.98)",
              transition: "none",
            },
          }}
        >
          <CardActionArea
            disableRipple
            onClick={handleDrawerClose}
            sx={{
              px: {
                xs: 3,
                sm: 0,
              },
              "&:hover": {
                background:
                  colors[themeColor][global.theme === "dark" ? 900 : 100] +
                  "!important",
              },
              borderRadius: 6,
              "&:focus-within": {
                background:
                  colors[themeColor][global.theme === "dark" ? 900 : 100] +
                  "!important",
              },
              "&:active": {
                background:
                  colors[themeColor][global.theme === "dark" ? 900 : 100] +
                  "!important",
              },
            }}
          >
            <CardContent
              sx={{
                p: 1,
                display: {
                  xs: "flex",
                  sm: "unset",
                },
                gap: 3,
                alignItems: "center",
              }}
            >
              <Typography variant="h4">{icon}</Typography>
              <Typography
                sx={{
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                {alias || title}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </CreateItemModal>
    </Grid>
  );
}
/**
 * More rooms collapsible
 * @returns JSX.Element
 */
function MoreRooms(): JSX.Element {
  const url =
    "/api/property/rooms?" +
    `${new URLSearchParams({
      property: global.property.propertyId,
      accessToken: global.property.accessToken,
    }).toString()}`;
  const [open, setOpen] = React.useState<boolean>(false);

  const { error, data } = useSWR<Room[]>(url, () =>
    fetch(url, {
      method: "POST",
    }).then((res) => res.json())
  );
  if (error) {
    return <>An error occured while trying to fetch your rooms. </>;
  }
  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        swipeAreaWidth={0}
        PaperProps={{
          elevation: 0,
          sx: {
            background: colors[themeColor][50],
            width: {
              xs: "100vw",
              sm: "50vw",
            },
            maxHeight: "80vh",
            maxWidth: "700px",
            "& .MuiPaper-root": {
              background: "transparent!important",
            },
            "& *": { transition: "none!important" },
            borderRadius: "28px 28px 0 0 !important",
            mx: "auto",
            ...(global.theme === "dark" && {
              background: "hsl(240, 11%, 20%)",
            }),
          },
        }}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      >
        <Puller />
        <DialogTitle sx={{ mt: 2, textAlign: "center" }}>
          Other rooms
        </DialogTitle>
        <Box sx={{ height: "100%", overflow: "scroll" }}>
          {!data ? (
            <Grid container sx={{ p: 2 }}>
              {[...new Array(12)].map(() => (
                <Grid
                  item
                  xs={12}
                  sm={3}
                  sx={{ p: 2, py: 1 }}
                  key={Math.random().toString()}
                >
                  <div style={{ background: "#eee" }}>
                    <Skeleton
                      variant="rectangular"
                      height={69}
                      width={"100%"}
                      animation="wave"
                      sx={{ borderRadius: 5, background: "red!important" }}
                    />
                  </div>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container sx={{ p: 2 }}>
              <AddItemOption
                toggleDrawer={() => {}}
                title="Storage room"
                icon={
                  <span className="material-symbols-rounded">inventory_2</span>
                }
              />
              <AddItemOption
                toggleDrawer={() => {}}
                title="Camping"
                icon={<span className="material-symbols-rounded">camping</span>}
              />
              <AddItemOption
                toggleDrawer={() => {}}
                title="Garden"
                icon={<span className="material-symbols-rounded">yard</span>}
              />
              {data.map((room: Room) => (
                <AddItemOption
                  toggleDrawer={() => {}}
                  title={room.id.toString()}
                  key={room.id.toString()}
                  alias={room.name}
                  icon={<span className="material-symbols-rounded">label</span>}
                />
              ))}
            </Grid>
          )}
        </Box>
      </SwipeableDrawer>
      <Grid item xs={12} sm={4}>
        <Card
          sx={{
            textAlign: {
              sm: "center",
            },
            boxShadow: 0,
            borderRadius: { xs: 1, sm: 6 },
            transition: "transform .2s",
            "&:active": {
              boxShadow: "none!important",
              transform: "scale(0.98)",
              transition: "none",
            },
          }}
          onClick={() => setOpen(true)}
        >
          <CardActionArea
            disableRipple
            sx={{
              px: {
                xs: 3,
                sm: 0,
              },
              "&:hover": {
                background:
                  colors[themeColor][global.theme === "dark" ? 900 : 100] +
                  "!important",
              },
              borderRadius: 6,
              "&:focus-within": {
                background:
                  colors[themeColor][global.theme === "dark" ? 900 : 100] +
                  "!important",
              },
              "&:active": {
                background:
                  colors[themeColor][global.theme === "dark" ? 900 : 100] +
                  "!important",
              },
            }}
          >
            <CardContent
              sx={{
                p: 1,
                display: {
                  xs: "flex",
                  sm: "unset",
                },
                gap: 3,
                alignItems: "center",
              }}
            >
              <Typography variant="h4">
                <span className="material-symbols-rounded">
                  add_location_alt
                </span>
              </Typography>
              <Typography
                sx={{
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                More&nbsp;rooms
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    </>
  );
}
/**
 *
 * @param toggleDrawer Function to toggle the drawer
 * @returns JSX.Element
 */
function Content({ toggleDrawer }: any): JSX.Element {
  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      <Grid container sx={{ p: 1 }}>
        {global.property.profile.type !== "dorm" && (
          <AddItemOption
            toggleDrawer={toggleDrawer}
            title="Kitchen"
            icon={<span className="material-symbols-rounded">oven_gen</span>}
          />
        )}
        <AddItemOption
          toggleDrawer={toggleDrawer}
          title="Bedroom"
          icon={
            <span className="material-symbols-rounded">bedroom_parent</span>
          }
        />
        <AddItemOption
          toggleDrawer={toggleDrawer}
          title="Bathroom"
          icon={<span className="material-symbols-rounded">bathroom</span>}
        />

        <AddItemOption
          toggleDrawer={toggleDrawer}
          title="Storage"
          icon={<span className="material-symbols-rounded">inventory_2</span>}
        />
        {global.property.profile.type !== "dorm" && (
          <>
            <AddItemOption
              toggleDrawer={toggleDrawer}
              title="Garage"
              icon={<span className="material-symbols-rounded">garage</span>}
            />
            <AddItemOption
              toggleDrawer={toggleDrawer}
              title={<>Living&nbsp;room</>}
              icon={<span className="material-symbols-rounded">living</span>}
            />
            <AddItemOption
              toggleDrawer={toggleDrawer}
              title={<>Dining</>}
              icon={<span className="material-symbols-rounded">dining</span>}
            />
            <AddItemOption
              toggleDrawer={toggleDrawer}
              title={<>Laundry&nbsp;room</>}
              icon={
                <span className="material-symbols-rounded">
                  local_laundry_service
                </span>
              }
            />
            <MoreRooms />
          </>
        )}
      </Grid>
    </List>
  );
}

/**
 * Select room to create item popup
 * @param props
 * @returns JSX.Element
 */

export default function AddPopup(props: any): JSX.Element {
  const [open, setOpen] = React.useState<boolean>(false);

  useHotkeys("ctrl+s", (e) => {
    e.preventDefault();
    document.getElementById("add_trigger")?.click();
  });

  useEffect(() => {
    open ? neutralizeBack(() => setOpen(false)) : revivalBack();
  });

  useEffect(() => {
    document
      .querySelector(`meta[name="theme-color"]`)
      ?.setAttribute(
        "content",
        open
          ? global.theme === "dark"
            ? "hsl(240, 11%, 20%)"
            : "#cccccc"
          : global.theme === "dark"
          ? "hsl(240, 11%, 10%)"
          : "#fff"
      );
  }, [open]);

  /**
   * Toggles the drawer's open state
   * @param {boolean} newOpen
   * @returns {any}
   */
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <Root>
      <CssBaseline />
      <Global
        styles={{
          ".MuiDrawer-root > .MuiPaper-root": {
            height: "auto",
            overflow: "visible",
          },
        }}
      />
      <div
        aria-hidden
        id="add_trigger"
        onClick={() => {
          if (global.property.role !== "read-only") {
            setOpen(true);
          }
        }}
      >
        {props.children}
      </div>

      <SwipeableDrawer
        anchor="bottom"
        swipeAreaWidth={0}
        PaperProps={{
          elevation: 0,
          sx: {
            background: colors[themeColor][50],
            width: {
              xs: "100vw",
              sm: "50vw",
            },
            maxWidth: "700px",
            "& *:not(.MuiTouchRipple-child, .puller)": {
              background: "transparent!important",
            },
            borderRadius: "28px 28px 0 0 !important",
            mx: "auto",
            ...(global.theme === "dark" && {
              background: "hsl(240, 11%, 20%)",
            }),
          },
        }}
        open={open}
        onClose={() => {
          // router.push(window.location.pathname);
          // router.reload(window.location.pathname);
          setOpen(false);
        }}
        onOpen={toggleDrawer(true)}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Puller />
        </Box>
        <DialogTitle
          sx={{
            display: "flex",
            mt: 0.8,
            textAlign: "center",
            pb: 0,
            alignItems: "center",
          }}
        >
          <IconButton
            disabled
            sx={{ mr: "auto", opacity: 0, pointerEvents: "none" }}
          >
            <span className="material-symbols-rounded">view_in_ar</span>
          </IconButton>
          <Typography variant="h6" sx={{ mx: "auto", fontWeight: "600" }}>
            Create item
          </Typography>
          <IconButton
            disabled
            size="large"
            onClick={() => window.open("/scan")}
            sx={{
              ml: "auto",
              color: global.theme === "dark" ? "#fff" : "#000",
              transition: "none",
              "&:active": {
                background:
                  colors[themeColor][global.theme === "dark" ? 900 : 100] +
                  "!important",
              },
            }}
            disableRipple
          >
            <span className="material-symbols-rounded">view_in_ar</span>
          </IconButton>
        </DialogTitle>
        <Content toggleDrawer={toggleDrawer} />
      </SwipeableDrawer>
    </Root>
  );
}
