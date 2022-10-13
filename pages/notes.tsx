import LoadingButton from "@mui/lab/LoadingButton";
import Masonry from "@mui/lab/Masonry";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import { useStatusBar } from "../hooks/useStatusBar";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Note } from "@prisma/client";
import { useFormik } from "formik";
import hexToRgba from "hex-to-rgba";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { ErrorHandler } from "../components/ErrorHandler";
import { fetchApiWithoutHook, useApi } from "../hooks/useApi";
import { colors } from "../lib/colors";
import type { ApiResponse } from "../types/client";
import { neutralizeBack, revivalBack } from "../hooks/useBackButton";

/**
 * Color picker for note modal
 * @param formik Formik instance
 * @returns JSX.Element
 */
function ColorModal({ formik }): JSX.Element {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    open ? neutralizeBack(() => setOpen(false)) : revivalBack();
  });
  useStatusBar(open, 2);
  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        disableSwipeToOpen
        open={open}
        BackdropProps={{
          sx: {
            background: `${hexToRgba(
              colors[formik.values.color][global.user.darkMode ? 900 : 100],
              0.7
            )}!important`,
          },
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            maxWidth: { sm: "470px" },
            mx: "auto",
            background:
              colors[formik.values.color][global.user.darkMode ? 900 : 50],
            borderRadius: "20px 20px 0 0",
          },
        }}
      >
        <DialogTitle>Choose a color</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {Object.keys(colors)
              .filter((c) => c !== "common")
              .map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    background: colors[color][global.user.darkMode ? 700 : 500],
                    margin: "5px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    formik.setFieldValue("color", color);
                    setOpen(false);
                  }}
                />
              ))}
          </Box>
        </DialogContent>
      </SwipeableDrawer>
      <IconButton
        disableRipple
        onClick={() => setOpen(true)}
        sx={{
          borderRadius: 4,
          mr: 0.5,
          transition: "none",
          color: global.user.darkMode
            ? "#fff"
            : colors[formik.values.color][global.user.darkMode ? 100 : "800"],
          "&:hover": {
            background: `${
              colors[formik.values.color][global.user.darkMode ? "900" : "200"]
            }!important`,
          },
        }}
      >
        <span
          className={`material-symbols-${
            formik.values.pinned ? "rounded" : "outlined"
          }`}
        >
          palette
        </span>
      </IconButton>
    </>
  );
}
/**
 * Note modal
 * @param id Note ID
 * @param url Note URL
 * @param create Should I create the note or edit it?
 * @param open Is the note modal open?
 * @param setOpen Open/Close the note modal
 * @param title Note title
 * @param content Note content
 * @returns
 */
function NoteModal({
  id,
  url,
  create = false,
  open,
  setOpen,
  title,
  content,
}: {
  id?: string;
  url: string;
  create?: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  content: string;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const formik = useFormik({
    initialValues: {
      color: "orange",
      pinned: false,
      title: create ? "" : title,
      content: create ? "" : content,
    },
    onSubmit: (values) => {
      setLoading(true);
      fetchApiWithoutHook(
        create ? "property/notes/create" : "property/notes/edit",
        {
          ...(create
            ? {
                property: global.property.propertyId,
                accessToken: global.property.accessToken,
                title: values.title,
                content: values.content,
                pinned: values.pinned ? "true" : "false",
                color: values.color,
              }
            : {
                property: global.property.propertyId,
                accessToken: global.property.accessToken,
                title: values.title,
                content: values.content,
                pinned: values.pinned ? "true" : "false",
                color: values.color,
                id: id ? id.toString() : "",
              }),
        }
      )
        .then(() => {
          setLoading(false);
          mutate(url);
          setOpen(false);
          if (create) {
            toast.success("Created note!");
            formik.resetForm();
          }
        })
        .catch(() => {
          setLoading(false);
          toast.error("Couldn't create note. Please try again later.");
        });
    },
  });

  useEffect(() => {
    formik.setFieldValue("title", title);
    formik.setFieldValue("content", content);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);
  useEffect(() => {
    open ? neutralizeBack(() => setOpen(false)) : revivalBack();
  });
  useStatusBar(open);

  return (
    <SwipeableDrawer
      disableSwipeToOpen
      anchor="bottom"
      open={open}
      onClose={() => {
        // Submit form
        if (formik.values.content !== "") {
          formik.handleSubmit();
        }
        setOpen(false);
      }}
      onOpen={() => setOpen(true)}
      sx={{
        display: { sm: "flex" },
        alignItems: { sm: "center" },
        justifyContent: { sm: "center" },
      }}
      BackdropProps={{
        sx: {
          background: `${hexToRgba(
            colors[formik.values.color][global.user.darkMode ? 900 : 100],
            0.7
          )}!important`,
        },
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          background:
            colors[formik.values.color][global.user.darkMode ? 900 : 50],
          position: { sm: "static" },
          mx: "auto",
          overflow: "hidden!important",
          maxWidth: "500px",
          width: "100%",
          borderRadius: { xs: "20px 20px 0 0", sm: 5 },
        },
      }}
    >
      <LinearProgress
        variant="determinate"
        value={(formik.values.content.length / 350) * 100}
        sx={{
          height: 2,
          color: colors[formik.values.color][global.user.darkMode ? 100 : 500],
        }}
        color="inherit"
      />
      <Box sx={{ p: 4, pt: 5 }}>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            sx={{ mb: 1 }}
            fullWidth
            placeholder="Add a title"
            value={formik.values.title}
            onChange={formik.handleChange}
            name="title"
            InputProps={{
              disableUnderline: true,
              sx: {
                fontWeight: "900",
                fontSize: "1.5rem",
              },
            }}
            variant="standard"
          />
          <TextField
            fullWidth
            multiline
            value={formik.values.content}
            onChange={(e) =>
              formik.setFieldValue("content", e.target.value.substring(0, 350))
            }
            name="content"
            placeholder="Write something..."
            InputProps={{
              disableUnderline: true,
              sx: {
                alignItems: "flex-start",
              },
            }}
            minRows={3}
            variant="standard"
          />
          <Box sx={{ mt: 2, textAlign: "right" }}>
            <ColorModal formik={formik} />
            <IconButton
              disableRipple
              sx={{
                borderRadius: 4,
                mr: 0.5,
                transition: "none",
                color: global.user.darkMode
                  ? "#fff"
                  : colors[formik.values.color][
                      global.user.darkMode ? 100 : "800"
                    ],
                ...(formik.values.pinned && {
                  background: `${
                    colors[formik.values.color][
                      global.user.darkMode ? "900" : "200"
                    ]
                  }!important`,
                }),
                "&:active": { background: "rgba(0,0,0,0.1)!important" },
              }}
              onClick={() =>
                formik.setFieldValue("pinned", !formik.values.pinned)
              }
            >
              <span
                style={{ transform: "rotate(-45deg)" }}
                className={`${"material-symbols-"}${
                  formik.values.pinned ? "rounded" : "outlined"
                }`}
              >
                push_pin
              </span>
            </IconButton>
            {!create && (
              <IconButton
                disableRipple
                onClick={() => {
                  fetchApiWithoutHook("property/notes/delete", {
                    id: id ? id.toString() : "",
                  })
                    .then(() => {
                      mutate(url);
                      setOpen(false);
                      toast.success("Deleted note!");
                    })
                    .catch(() => {
                      toast.error(
                        "Couldn't delete note. Please try again later."
                      );
                    });
                }}
                sx={{
                  borderRadius: 4,
                  mr: 0.5,
                  transition: "none",
                  color: global.user.darkMode
                    ? "#fff"
                    : colors[formik.values.color][
                        global.user.darkMode ? 100 : 800
                      ],
                  "&:hover": {
                    background: `${
                      colors[formik.values.color][
                        global.user.darkMode ? 900 : 200
                      ]
                    }!important`,
                  },
                }}
              >
                <span
                  className={`material-symbols-${
                    formik.values.pinned ? "rounded" : "outlined"
                  }`}
                >
                  delete
                </span>
              </IconButton>
            )}
          </Box>
          {create && (
            <LoadingButton
              sx={{
                mt: 2,
                borderRadius: "20px",
                background: `${
                  colors[formik.values.color][global.user.darkMode ? 100 : 900]
                }!important`,
              }}
              disableElevation
              size="large"
              type="submit"
              fullWidth
              variant="contained"
              loading={loading}
            >
              {create ? "Create" : "Save"}
            </LoadingButton>
          )}
        </form>
      </Box>
    </SwipeableDrawer>
  );
}

/**
 * Create a note modal
 * @param {string} url - The url to mutate
 */
function CreateNoteModal({ url }: { url: string }) {
  const [open, setOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  return (
    <>
      <NoteModal
        url={url}
        create
        open={open}
        setOpen={setOpen}
        title={title}
        content=""
      />
      <Card
        sx={{ borderRadius: 5, background: "rgba(200,200,200,.3)" }}
        onClick={() => {
          setOpen(true);
          setTitle("");
        }}
      >
        <CardActionArea>
          <CardContent>
            <Typography
              component="div"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                fontWeight: "600",
              }}
            >
              <span className="material-symbols-outlined">add_circle</span>
              New note
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </>
  );
}

/**
 * Note modal
 * @param {any} {url
 * @param {any} note}
 * @returns {any}
 */
function Note({ url, note }: { url: string; note: Note }) {
  const [open, setOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>(note.name);

  return (
    <>
      <NoteModal
        url={url}
        open={open}
        setOpen={setOpen}
        title={name}
        content={note.content}
        id={note.id}
      />
      <Card
        onClick={() => {
          setOpen(true);
          setName(note.name);
        }}
        sx={{
          borderRadius: 5,
          background:
            colors[note.color ?? "orange"][global.user.darkMode ? 900 : 50],
        }}
      >
        <CardActionArea>
          <CardContent sx={{ p: 3 }}>
            <Typography
              gutterBottom
              variant="h5"
              component="div"
              sx={{ fontWeight: "500" }}
            >
              {note.name}
            </Typography>
            <Typography variant="body2">{note.content}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </>
  );
}

/**
 * Notes page component
 * @returns JSX.Element
 */
export default function Notes(): JSX.Element {
  const { url, error, data }: ApiResponse = useApi("property/notes");

  return (
    <Box
      sx={{
        mt: 8,
        px: 5,
      }}
    >
      {error && (
        <ErrorHandler
          error={"An error occured while trying to fetch your notes"}
        />
      )}
      {data ? (
        <Masonry sx={{ mt: 2 }} columns={{ xs: 1, sm: 2, xl: 2 }}>
          <CreateNoteModal url={url} />
          {data.map((note: Note) => (
            <Note key={note.id} note={note} url={url} />
          ))}
          {data.length === 0 && (
            <>
              {[...new Array(10)].map(() => (
                <Skeleton
                  key={Math.random().toString()}
                  animation={false}
                  variant="rectangular"
                  sx={{
                    borderRadius: 5,
                    background: "rgba(200,200,200,.15)",
                    height: 200,
                  }}
                />
              ))}
            </>
          )}
        </Masonry>
      ) : (
        <Masonry sx={{ mt: 2 }} columns={{ xs: 1, sm: 2, xl: 3 }}>
          {[...new Array(10)].map(() => (
            <Skeleton
              key={Math.random().toString()}
              animation={false}
              variant="rectangular"
              sx={{
                borderRadius: 5,
                background: "rgba(200,200,200,.3)",
                height: 200,
              }}
            />
          ))}
        </Masonry>
      )}
    </Box>
  );
}
