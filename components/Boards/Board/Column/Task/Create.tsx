import LoadingButton from "@mui/lab/LoadingButton";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { fetchApiWithoutHook } from "../../../../../hooks/useApi";
import { useStatusBar } from "../../../../../hooks/useStatusBar";
import { colors } from "../../../../../lib/colors";
import { SelectDateModal } from "./SelectDateModal";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Grow,
  Icon,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  SwipeableDrawer,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Link from "next/link";
import { useHotkeys } from "react-hotkeys-hook";
import { toastStyles } from "../../../../../lib/useCustomTheme";

function ImageModal({ image, setImage, styles }) {
  const [imageUploading, setImageUploading] = useState(false);

  return (
    <>
      <Tooltip title="Attach an image (alt • s)" placement="top">
        <IconButton
          onClick={() => {
            document.getElementById("imageAttachment")?.click();
          }}
          sx={{
            ...styles,
            mx: 0.5,
            background: image
              ? global.user.darkMode
                ? "hsl(240,11%,20%)"
                : "#ddd !important"
              : "",
          }}
          size="small"
        >
          {imageUploading ? (
            <CircularProgress size={20} sx={{ mx: 0.5 }} />
          ) : (
            <span
              className={
                image ? "material-symbols-rounded" : "material-symbols-outlined"
              }
            >
              image
            </span>
          )}
        </IconButton>
      </Tooltip>
      <input
        type="file"
        id="imageAttachment"
        name="imageAttachment"
        style={{
          display: "none",
        }}
        onChange={async (e: any) => {
          const key = "da1f275ffca5b40715ac3a44aa77cf42";
          const form = new FormData();
          form.append("image", e.target.files[0]);

          setImageUploading(true);
          fetch(`https://api.imgbb.com/1/upload?name=image&key=${key}`, {
            method: "POST",
            body: form,
          })
            .then((res) => res.json())
            .then((res) => {
              setImage(res.data);
              setImageUploading(false);
            })
            .catch((err) => {
              console.log(err);
              setImageUploading(false);
            });
        }}
        accept="image/png, image/jpeg"
      />
    </>
  );
}

export function CreateTask({
  label = false,
  placeholder = false,
  defaultDate = false,
  isHovered,
  tasks,
  parent = false,
  mutationUrl,
  boardId,
  column,
  checkList = false,
}: any) {
  const allCompleted = !(
    column &&
    column.tasks &&
    column.tasks.filter((task) => task.completed).length ==
      column.tasks.length &&
    column.tasks.length >= 1
  );
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<any>(
    new Date(defaultDate || new Date().toISOString()) || new Date()
  );
  const [pinned, setPinned] = useState(false);
  const [image, setImage] = useState<any>(null);

  const [showDescription, setShowDescription] = useState(false);
  useStatusBar(open);

  useHotkeys(
    "alt+s",
    (e) => {
      if (open) {
        e.preventDefault();
        document.getElementById("imageAttachment")?.click();
      }
    },
    {
      enableOnTags: ["INPUT", "TEXTAREA"],
    }
  );

  useHotkeys(
    "alt+d",
    (e) => {
      if (open) {
        e.preventDefault();
        setShowDescription(!showDescription);
        setTimeout(() => {
          if (!showDescription) {
            descriptionRef.current?.focus();
            descriptionRef.current?.select();
          } else {
            titleRef.current?.focus();
            // titleRef.current?.select();
          }
        }, 50);
      }
    },
    {
      enableOnTags: ["INPUT", "TEXTAREA"],
    }
  );

  useHotkeys(
    "alt+a",
    (e) => {
      if (open) {
        e.preventDefault();
        setPinned(!pinned);
      }
    },
    {
      enableOnTags: ["INPUT", "TEXTAREA"],
    }
  );

  useHotkeys(
    "alt+f",
    (e) => {
      if (open) {
        e.preventDefault();
        document.getElementById("dateModal")?.click();
      }
    },
    {
      enableOnTags: ["INPUT", "TEXTAREA"],
    }
  );

  const styles = {
    color: global.user.darkMode ? "hsl(240,11%,90%)" : "#505050",
    "&:hover": {
      color: global.user.darkMode ? "#fff" : "#000",
    },
    borderRadius: 3,
    transition: "none",
  };

  useEffect(() => {
    if (title.includes("!!")) {
      setPinned(true);
    }
    if (title.toLowerCase().includes("today")) {
      setDate(new Date());
    } else if (
      title.toLowerCase().includes("tomorrow") ||
      title.toLowerCase().includes("tmrw") ||
      title.toLowerCase().includes("tmr") ||
      title.toLowerCase().includes("tmw")
    ) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow);
    } else if (title.toLowerCase().includes("next week")) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDate(nextWeek);
    } else if (title.toLowerCase().includes("next month")) {
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      setDate(nextMonth);
    }
  }, [title]);

  const titleRef = useRef<HTMLInputElement>(null);
  const dateModalButtonRef = useRef<HTMLButtonElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (title.trim() === "") {
        toast.error("You can't have an empty task... 🤦", toastStyles);
        return;
      }

      setLoading(true);
      fetchApiWithoutHook("property/boards/column/task/create", {
        title,
        description,
        ...(image && { image: image.url }),
        date,
        pinned: pinned ? "true" : "false",
        due: date ? date.toISOString() : "false",
        ...(parent && { parent }),

        boardId,
        columnId: (column || { id: -1 }).id,
      });
      toast.success("Created task!", toastStyles);

      setLoading(false);
      setTitle("");
      setDescription("");
      setDate(null);
      setImage(null);
      setPinned(false);
      titleRef.current?.focus();
      // setOpen(false);
    },
    [
      title,
      setTitle,
      description,
      setDescription,
      image,
      setImage,
      pinned,
      setPinned,
      toastStyles,
    ]
  );

  const chipStyles = {
    border: "1px solid",
    borderColor: global.user.darkMode
      ? "hsl(240, 11%, 25%)"
      : "rgba(200,200,200,.5)",
    background: global.user.darkMode
      ? "hsl(240,11%,20%)!important"
      : "#fff !important",
    transition: "all .2s",
    "&:active": {
      transition: "none",
      transform: "scale(.95)",
    },
    boxShadow: "none!important",
    px: 1,
    mr: 1,
  };

  useEffect(() => {
    setTimeout(() => {
      if (open) {
        titleRef.current?.select();
      }
      titleRef.current?.focus();
    });
  }, [open, titleRef]);

  const trigger = useMediaQuery("(min-width: 600px)");

  return (
    <>
      <SwipeableDrawer
        {...(trigger && {
          TransitionComponent: Grow,
        })}
        anchor="bottom"
        open={open}
        onClose={() => {
          setOpen(false);
          mutate(mutationUrl);
        }}
        onOpen={() => setOpen(true)}
        disableSwipeToOpen
        PaperProps={{
          sx: {
            maxWidth: "600px",
            mb: { sm: 5 },
            border: "0!important",
            background: "transparent!important",
            mx: "auto",
          },
        }}
      >
        <Box
          sx={{
            mb: 2,
            overflowX: "scroll",
            whiteSpace: "nowrap",
          }}
          onClick={() => titleRef.current?.focus()}
        >
          <Chip
            label="Important"
            sx={{
              ...chipStyles,
              ml: { xs: 1, sm: 0.3 },
              transition: "transform .2s",
              ...(pinned && {
                background: colors[themeColor]["900"] + "!important",
                color: "#fff!important",
              }),
            }}
            icon={
              <Icon
                sx={{
                  ...(pinned && {
                    color: "#fff!important",
                  }),
                }}
              >
                priority
              </Icon>
            }
            onClick={() => setPinned(!pinned)}
          />
          <Chip
            label="Today"
            sx={chipStyles}
            icon={<Icon>today</Icon>}
            onClick={() => setDate(new Date())}
          />
          <Chip
            label="Tomorrow"
            sx={chipStyles}
            icon={<Icon>today</Icon>}
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setDate(tomorrow);
            }}
          />
          <Chip
            label="In one month"
            sx={chipStyles}
            icon={<Icon>today</Icon>}
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 30);
              setDate(tomorrow);
            }}
          />
          <Chip
            label="In one year"
            sx={chipStyles}
            icon={<Icon>today</Icon>}
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 365);
              setDate(tomorrow);
            }}
          />
        </Box>
        <Box
          sx={{
            p: 3,
            borderRadius: { xs: "20px 20px 0 0", sm: 5 },
            background: global.user.darkMode ? "hsl(240,11%,15%)" : "#fff",
            border: "1px solid",
            borderColor: global.user.darkMode
              ? "hsl(240, 11%, 25%)"
              : "rgba(200,200,200,.5)",
          }}
        >
          <form onSubmit={handleSubmit}>
            {image && (
              <Box
                sx={{
                  width: 300,
                  position: "relative",
                  borderRadius: 5,
                  overflow: "hidden",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  mb: 2,
                  height: 200,
                }}
              >
                <picture>
                  <img
                    alt="Uploaded"
                    draggable={false}
                    src={image.url}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </picture>
                <Button
                  sx={{
                    position: "absolute",
                    top: 0,
                    m: 1,
                    right: 0,
                    background: "rgba(0,0,0,0.7)!important",
                    color: "#fff!important",
                    minWidth: "unset",
                    width: 25,
                    height: 25,
                    borderRadius: 999,
                    zIndex: 999,
                  }}
                  onClick={() => {
                    setImage(null);
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "20px",
                    }}
                  >
                    close
                  </span>
                </Button>
              </Box>
            )}
            <TextField
              multiline
              inputRef={titleRef}
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value.replace(/\n/g, ""))}
              autoFocus
              variant="standard"
              onKeyDown={(e) => {
                if (e.key == "Enter") handleSubmit(e);
              }}
              placeholder={
                placeholder
                  ? placeholder
                  : 'Add an item to "' +
                    (column || { name: "this task" }).name +
                    '"'
              }
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: 19 },
              }}
            />
            <Collapse in={showDescription}>
              <TextField
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                inputRef={descriptionRef}
                variant="standard"
                placeholder="Add description..."
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: 15, mt: 0.5, mb: 1 },
                }}
              />
            </Collapse>
            {title.includes("study ") && (
              <Alert
                severity="info"
                sx={{
                  mt: 1,
                  mb: 2,
                  borderRadius: 5,
                  background:
                    colors[themeColor][global.user.darkMode ? 900 : 100],
                  color: colors[themeColor][!global.user.darkMode ? 900 : 100],
                }}
                icon={
                  <span
                    className="material-symbols-rounded"
                    style={{
                      color:
                        colors[themeColor][global.user.darkMode ? 100 : 800],
                    }}
                  >
                    info
                  </span>
                }
              >
                Do you want to create{" "}
                <Link href="/coach" style={{ textDecoration: "underline" }}>
                  goal
                </Link>{" "}
                instead?
              </Alert>
            )}
            {!parent &&
              title !== "" &&
              tasks.filter((task) =>
                new RegExp("\\b" + task.name.toLowerCase() + "\\b").test(
                  title.toLowerCase()
                )
              ).length !== 0 && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 1,
                    mb: 2,
                    borderRadius: 5,
                    background:
                      colors[themeColor][global.user.darkMode ? 900 : 100],
                    color:
                      colors[themeColor][!global.user.darkMode ? 900 : 100],
                  }}
                  icon={
                    <span
                      className="material-symbols-rounded"
                      style={{
                        color:
                          colors[themeColor][global.user.darkMode ? 100 : 800],
                      }}
                    >
                      info
                    </span>
                  }
                >
                  This item might be already added in your list.
                </Alert>
              )}
            <Box sx={{ display: "flex", mt: 1, mb: -1, alignItems: "center" }}>
              <Tooltip title="Mark as important (alt • a)" placement="top">
                <IconButton
                  onClick={() => {
                    setPinned(!pinned);
                    titleRef.current?.focus();
                  }}
                  sx={{
                    ...styles,
                    background: pinned
                      ? global.user.darkMode
                        ? "hsl(240,11%,20%)"
                        : "#ddd !important"
                      : "",
                  }}
                  size="small"
                >
                  <Icon className={pinned ? "rounded" : "outlined"}>
                    priority
                  </Icon>
                </IconButton>
              </Tooltip>
              <ImageModal styles={styles} image={image} setImage={setImage} />
              <Tooltip title="Description (alt • d)" placement="top">
                <IconButton
                  onClick={() => {
                    setShowDescription(!showDescription);
                    setTimeout(() => {
                      {
                        if (!showDescription)
                          document.getElementById("description")?.focus();
                        else document.getElementById("title")?.focus();
                      }
                    }, 100);
                  }}
                  sx={{
                    ...styles,
                    mx: 0.5,
                    background: showDescription
                      ? global.user.darkMode
                        ? "hsl(240,11%,20%)"
                        : "#ddd !important"
                      : "",
                  }}
                  size="small"
                >
                  <Icon>notes</Icon>
                </IconButton>
              </Tooltip>

              <Box
                sx={{
                  ml: "auto",
                  display: "flex",
                  gap: 2,
                  mt: 0,
                  alignItems: "center",
                }}
              >
                <SelectDateModal
                  ref={dateModalButtonRef}
                  styles={styles}
                  date={date}
                  setDate={(e) => {
                    setDate(e);
                    setTimeout(() => {
                      titleRef.current?.focus();
                    }, 100);
                  }}
                />
                <div>
                  <LoadingButton
                    loading={loading}
                    disabled={title.trim() === ""}
                    type="submit"
                    disableRipple
                    color="inherit"
                    sx={{
                      ...(title.trim() !== "" && {
                        color: global.user.darkMode ? "#fff" : "#000",
                      }),
                      "&:active": {
                        transform: "scale(.95)",
                        transition: "none",
                        opacity: ".6",
                      },
                      transition: "all .2s",
                      borderRadius: 5,
                      px: 2,
                      minWidth: "auto",
                    }}
                    variant="contained"
                  >
                    <Icon>add</Icon>
                  </LoadingButton>
                </div>
              </Box>
            </Box>
          </form>
        </Box>
      </SwipeableDrawer>
      <ListItem
        id="createTask"
        className="task"
        sx={{
          color: colors["grey"][global.user.darkMode ? "A100" : "A700"],
          p: {
            xs: 1,
            sm: "0!important",
          },
          ...(label && {
            border: "none!important",
            borderColor: "transparent!important",
            boxShadow: "none!important",
            py: "0!important",
          }),
          cursor: "unset!important",
          ...(isHovered && {
            backgroundColor: {
              sm: global.user.darkMode
                ? "hsl(240,11%,15%)!important"
                : "rgba(200,200,200,.1)!important",
            },
          }),
          ...(global.user.darkMode && {
            "&:hover": {
              backgroundColor: "hsl(240,11%,16%)!important",
            },
            "&:active": {
              backgroundColor: "hsl(240,11%,19%)!important",
            },
          }),
          ...(!checkList && {
            boxShadow: {
              sm: "none!important",
            },
            border: {
              sm: "none!important",
            },
          }),
          gap: "5px!important",
          mb: label
            ? 0
            : {
                xs: 1.5,
                sm: checkList ? 1.5 : 0.5,
              },
          ...(tasks &&
            tasks.filter((task) => task.completed && task.columnId == column.id)
              .length ==
              tasks.filter((task) => task.columnId == column.id).length &&
            tasks.length >= 1 && {
              width: "auto",
              p: "0!important",
              pr: "5px!important",
              mb: "0!important",
              border: "0!important",
              borderColor: "transparent!important",
            }),
        }}
        onClick={() => {
          setOpen(true);
          if (defaultDate) {
            setDate(defaultDate);
          }
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            border:
              "2px solid " +
              (global.user.darkMode ? "hsl(240,11%,70%)" : "#808080"),
            borderRadius: "10px",
            color: global.user.darkMode
              ? "hsl(240,11%,90%)"
              : checkList
              ? "#303030"
              : "#808080",
            marginLeft: !allCompleted ? "15px" : "9px",
            marginRight: label ? "20px" : "5px",
            fontSize: "20px",
            marginTop: "10px",
            marginBottom: "10px",
          }}
        >
          add
        </span>

        {allCompleted && (
          <ListItemText
            className="textbox"
            primary={
              <span
                style={{
                  fontWeight: 400,
                  color: global.user.darkMode ? "#fff" : "#606060",
                }}
              >
                {parent ? "New subtask" : label || "New list item"}
              </span>
            }
          />
        )}
        <ListItemIcon
          sx={{
            minWidth: "auto",
            opacity: isHovered ? 1 : 0,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              color: global.user.darkMode ? "#fff" : "#606060",
              background: global.user.darkMode
                ? "hsl(240,11%,25%)"
                : "rgba(200,200,200,.4)",
              borderRadius: "3px",
              fontSize: "12px",
              height: "20px",
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              marginRight: "10px",
            }}
          >
            c
          </Typography>
        </ListItemIcon>
      </ListItem>

      {/* <Divider sx={{ my: 0.5 }} /> */}
    </>
  );
}
