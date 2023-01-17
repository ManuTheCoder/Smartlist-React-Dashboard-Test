import React, { useEffect } from "react";
import { neutralizeBack, revivalBack } from "../../hooks/useBackButton";
import { colors } from "../../lib/colors";
import { Color } from "../Layout/InviteButton";
import { updateSettings } from "../Settings/updateSettings";

import {
  AppBar,
  Box,
  Button,
  Chip,
  FormControl,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  SwipeableDrawer,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";

/**
 * Edit property
 */
export function EditProperty({
  open,
  setOpen,
  color,
  setColor,
  propertyType,
  setPropertyType,
}: {
  color: string;
  setOpen: (open: boolean) => void;
  propertyType: string;
  setColor: (color: string) => void;
  setPropertyType: (propertyType: string) => void;
  open: boolean;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  /**
   * Handles click event
   * @param event Event
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  /**
   * Set property type
   */
  const handleCloseMenu = (type) => {
    updateSettings("type", type, false, null, true);
    setPropertyType(type);
    setAnchorEl(null);
  };

  /**
   * Callback for updating note blur event
   * @param { React.FocusEvent<HTMLInputElement> } event
   */
  const handleUpdateName = (event: React.FocusEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    if (target.value !== global.property.profile.name) {
      updateSettings("name", target.value, false, null, true);
    }
  };

  useEffect(() => {
    open ? neutralizeBack(() => setOpen(false)) : revivalBack();
  });

  useEffect(() => {
    if (open) {
      document
        .querySelector(`meta[name="theme-color"]`)
        ?.setAttribute("content", colors[color][900]);
    }
  }, [open, color]);

  return (
    <SwipeableDrawer
      ModalProps={{
        keepMounted: false,
      }}
      disableSwipeToOpen
      anchor="bottom"
      open={open}
      swipeAreaWidth={0}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      PaperProps={{
        sx: {
          background: colors[color][global.user.darkMode ? 900 : 50].toString(),
          color: colors[color][global.user.darkMode ? 50 : 900].toString(),
          px: 3,
          width: { xs: "auto", sm: "50vw" },
          py: 2,
          maxHeight: "calc(100vh - 20px)",
          borderRadius: "20px 20px 0 0",
          mx: "auto",
        },
      }}
    >
      <Box
        sx={{
          height: { xs: "100vh", sm: "auto" },
          px: 2,
          borderRadius: "20px 20px 0 0",
          pt: 10,
        }}
      >
        <AppBar
          position="absolute"
          sx={{
            p: 2,
            borderRadius: "20px 20px 0 0",
            py: 1,
            background:
              colors[color][global.user.darkMode ? 900 : 50].toString(),
            color: colors[color][global.user.darkMode ? 50 : 900].toString(),
            boxShadow: "none",
          }}
        >
          <Toolbar>
            <IconButton
              disableRipple
              edge="start"
              color="inherit"
              sx={{ mr: 2 }}
              aria-label="menu"
              onClick={() => setOpen(false)}
            >
              <Icon>expand_more</Icon>
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Edit property
            </Typography>
          </Toolbar>
        </AppBar>
        <TextField
          variant="filled"
          sx={{ color: "white" }}
          defaultValue={global.property.profile.name || "Untitled property"}
          id="nameInput"
          label="Home name / Family name / Address"
          placeholder="1234 Rainbow Road"
          onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
            handleUpdateName(e)
          }
        />

        <Button
          variant="outlined"
          sx={{
            border: "0!important",
            background: "rgba(0,0,0,0.1)",
            mt: 3,
            borderBottom: "1px solid #313131 !important",
            py: 2,
            px: 1.5,
            width: "100%",
            textAlign: "left",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            borderRadius: 0,
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
          }}
          aria-haspopup="true"
          disabled={global.property.permission === "read-only"}
          onClick={handleClick}
        >
          <Typography
            sx={{
              textTransform: "capitalize",
              display: "flex",
              alignItems: "center",
              color: colors[color][global.user.darkMode ? 50 : 900].toString(),
              gap: "10px",
            }}
          >
            <Icon>
              {propertyType === "dorm"
                ? "cottage"
                : propertyType === "apartment"
                ? "location_city"
                : propertyType === "study group"
                ? "school"
                : "home"}
            </Icon>
            {propertyType}
          </Typography>
        </Button>
        <FormControl fullWidth sx={{ my: 4 }}>
          <Typography
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "error",
            }}
          >
            <Icon>warning</Icon>
            Heads up! Changing your property type may cause data loss. Change
            this setting with caution.
          </Typography>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => {
              setAnchorEl(null);
            }}
          >
            <MenuItem onClick={() => handleCloseMenu("house")} value="house">
              House
            </MenuItem>
            <MenuItem
              onClick={() => handleCloseMenu("apartment")}
              value="house"
            >
              Apartment
            </MenuItem>
            <MenuItem onClick={() => handleCloseMenu("dorm")} value="house">
              Dorm
            </MenuItem>
            <MenuItem
              onClick={() => handleCloseMenu("study group")}
              value="house"
            >
              Study group{" "}
              <Chip
                color="error"
                size="small"
                label="NEW"
                sx={{ pointerEvents: "none" }}
              />
            </MenuItem>
          </Menu>
        </FormControl>

        <Color setColor={setColor} s={color} color={"pink"} />
        <Color setColor={setColor} s={color} color={"red"} />
        <Color setColor={setColor} s={color} color={"green"} />
        <Color setColor={setColor} s={color} color={"teal"} />
        <Color setColor={setColor} s={color} color={"cyan"} />
        <Color setColor={setColor} s={color} color={"blue"} />
        <Color setColor={setColor} s={color} color={"indigo"} />
        <Color setColor={setColor} s={color} color={"purple"} />
        <Color setColor={setColor} s={color} color={"deepPurple"} />
        <Color setColor={setColor} s={color} color={"orange"} />
        <Color setColor={setColor} s={color} color={"deepOrange"} />
        <Color setColor={setColor} s={color} color={"lime"} />
        <Color setColor={setColor} s={color} color={"brown"} />
      </Box>
    </SwipeableDrawer>
  );
}
