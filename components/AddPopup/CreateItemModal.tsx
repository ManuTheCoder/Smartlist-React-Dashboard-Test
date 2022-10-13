import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { useFormik } from "formik";
import React from "react";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { fetchApiWithoutHook } from "../../hooks/useApi";
import { neutralizeBack, revivalBack } from "../../hooks/useBackButton";
import { useStatusBar } from "../../hooks/useStatusBar";
import { colors } from "../../lib/colors";
import { Puller } from "../Puller";
import { cards } from "./cards";
/**
 * Shuffles array in place. ES6 version
 * @param array Array to be shuffled
 * @returns
 */
function shuffle(
  array: Array<{
    name: string;
    icon: string;
  }>
) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
/**
 * Prompt to create an item
 * @param alias Alias of the room
 * @param children Children for the trigger
 */
export function CreateItemModal({
  alias,
  room,
  children,
}: {
  alias?: string;
  room: JSX.Element | string;
  children: JSX.Element;
}) {
  const [open, setOpen] = React.useState<boolean>(false);

  /**
   * Opens the item modal
   * @returns {any}
   */
  const handleClickOpen = () => {
    if (global.property.role !== "read-only") {
      setOpen(true);
    }
  };

  /**
   * Closes the popup
   * @returns void
   */
  const handleClose = () => {
    setOpen(false);
  };
  React.useEffect(() => {
    const timer = setTimeout(() => {
      open && document.getElementById("nameInput")?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [open]);

  const [emblaRef] = useEmblaCarousel(
    {
      dragFree: true,
      align: "start",
    },
    [WheelGesturesPlugin()]
  );

  React.useEffect(() => {
    open ? neutralizeBack(() => setOpen(false)) : revivalBack();
  });
  useStatusBar(open);
  const [loading, setLoading] = React.useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      categories: [],
      title: "",
      quantity: "",
    },
    onSubmit: (values: {
      categories: Array<string>;
      title: string;
      quantity: string;
    }) => {
      setLoading(true);
      fetchApiWithoutHook("property/inventory/create", {
        room: room.toString().toLowerCase(),
        name: values.title,
        quantity: values.quantity,
        category: JSON.stringify(values.categories),
        lastModified: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      })
        .then(() => {
          toast("Created item!");
          setLoading(false);
          setOpen(false);
          formik.resetForm();
          mutate(
            `/api/property/inventory/list/?${new URLSearchParams({
              room: room.toString().toLowerCase(),
              property: global.property.propertyId,
              accessToken: global.property.accessToken,
            }).toString()}`
          );
        })
        .catch((err) => {
          toast.error("Couldn't create item. Please try again.");
          setLoading(false);
        });
    },
  });

  const originalCards = shuffle(
    cards.filter((card) => card.room === room.toString().toLowerCase())
  );
  const [filteredCards, setFilteredCards] = React.useState(originalCards);

  /**
   * Handle submit click
   */
  const clickSubmitItem = () => document.getElementById("submitItem")?.click();

  /**
   * Set field values
   * @param item Item data
   */
  const setFieldValues = (item) => {
    formik.setFieldValue("title", item.name);
    formik.setFieldValue("categories", item.tags);
    formik.setFieldValue("quantity", 1);
  };

  return (
    <>
      <Box onClick={handleClickOpen}>{children}</Box>
      <SwipeableDrawer
        anchor="bottom"
        swipeAreaWidth={0}
        disableSwipeToOpen
        PaperProps={{
          elevation: 0,
          sx: {
            background: colors[themeColor][50],
            width: {
              sm: "90vw",
              md: "50vw",
            },
            maxWidth: "600px",
            maxHeight: "100vh",
            borderRadius: "20px 20px 0 0",
            mx: "auto",
            ...(global.user.darkMode && {
              background: "hsl(240, 11%, 25%)",
            }),
          },
        }}
        open={open}
        onClose={handleClose}
        onOpen={() => setOpen(true)}
      >
        <Puller />
        <form onSubmit={formik.handleSubmit}>
          <DialogContent
            sx={{
              height: "auto",
              pb: { xs: 10, sm: 0 },
              pt: { sm: 0 },
              px: 2.5,
            }}
          >
            <TextField
              autoFocus
              margin="dense"
              required
              fullWidth
              autoComplete={"off"}
              onChange={(e) => {
                formik.setFieldValue("title", e.target.value);
                setFilteredCards(
                  originalCards.filter((card) =>
                    card.name
                      .toLowerCase()
                      .includes(e.target.value.toLowerCase())
                  )
                );
              }}
              value={formik.values.title}
              disabled={loading}
              name="title"
              id="nameInput"
              placeholder="Item name"
              variant="standard"
              InputProps={{
                disableUnderline: true,
                autoComplete: "off",
                sx: {
                  background: `${
                    global.user.darkMode
                      ? "hsl(240, 11%, 24%)"
                      : colors[themeColor][50]
                  }!important`,
                  fontWeight: "600",
                  fontSize: "30px",
                  textDecoration: "underline",
                  textAlign: "right!important",
                  borderRadius: "15px",
                  display: "block",
                },
              }}
            />
            <TextField
              margin="dense"
              placeholder="Add a quantity"
              autoComplete={"off"}
              fullWidth
              onChange={(e) => {
                formik.setFieldValue("quantity", e.target.value);
              }}
              value={formik.values.quantity}
              disabled={loading}
              name="Quantity"
              variant="standard"
              InputProps={{
                disableUnderline: true,
                autoComplete: "off",
                sx: {
                  background: `${
                    global.user.darkMode
                      ? "hsl(240, 11%, 24%)"
                      : colors[themeColor][50]
                  }!important`,
                  fontWeight: "600",
                  fontSize: "15px",
                  textDecoration: "underline",
                  textAlign: "right!important",
                  borderRadius: "15px",
                  display: "block",
                },
              }}
            />
            <Box
              className="embla"
              ref={emblaRef}
              sx={{
                width: "100%",
                whiteSpace: "nowrap",
                "& *": {
                  overscrollBehavior: "auto!important",
                },
                overscrollBehavior: "auto!important",
                overflowX: "scroll",
                overflowY: "visible",
                my: 2,
              }}
            >
              <div className="embla__container">
                {filteredCards.map((item) => (
                  <Box
                    key={item.name.toString()}
                    onClick={() => setFieldValues(item)}
                    component="div"
                    sx={{
                      userSelect: "none",
                      display: "inline-block",
                      width: "175px",
                      flex: "0 0 175px",
                      overflow: "hidden",
                      height: "150px",
                      background: global.user.darkMode
                        ? "hsl(240, 11%, 30%)"
                        : colors[themeColor][100],
                      transition: "transform .2s",
                      "&:active": {
                        transform: "scale(.95)",
                        transition: "none",
                        background: colors[themeColor][100],
                      },
                      cursor: "pointer",
                      mr: 2,
                      borderRadius: 6,
                    }}
                  >
                    <Box
                      sx={{
                        height: "80px",
                        background: global.user.darkMode
                          ? "hsl(240, 11%, 35%)"
                          : colors[themeColor][200],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <span
                        style={{ fontSize: "30px" }}
                        className="material-symbols-rounded"
                      >
                        {item.icon}
                      </span>
                    </Box>
                    <Box
                      sx={{
                        height: "70px",
                        display: "flex",
                        alignItems: "center",
                        px: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="body2">Add</Typography>
                        <Typography sx={{ fontWeight: "700" }}>
                          {item.name}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </div>
            </Box>
            <DialogActions
              sx={{
                position: { xs: "fixed", sm: "unset" },
                bottom: 0,
                left: 0,
                p: 1,
                width: "100%",
                background: colors[themeColor][50],
                zIndex: 99,
              }}
            >
              <LoadingButton
                disableElevation
                sx={{
                  float: "right",
                  borderRadius: 100,
                  m: 1,
                  mr: 0,
                  width: { xs: "100%", sm: "auto" },
                }}
                size="large"
                variant="contained"
                color="primary"
                type="submit"
                id="submitItem"
                loading={loading}
              >
                Create
              </LoadingButton>
            </DialogActions>
          </DialogContent>
        </form>
      </SwipeableDrawer>
    </>
  );
}
