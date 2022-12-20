import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import toast from "react-hot-toast";
import useWindowSize from "react-use/lib/useWindowSize";
import Webcam from "react-webcam";
import { colors } from "../../../lib/colors";

const WebcamComponent = ({ facingMode, setFacingMode }) => {
  const webcamRef: any = React.useRef(null);
  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    alert(imageSrc);
    toast.promise(
      fetch("/api/property/inventory/image-recognition", {
        method: "POST",
        body: JSON.stringify({
          imageUrl: imageSrc,
        }),
      })
        .then((res) => res.json())
        .then((res) => res)
        .catch((err) => {
          alert("Error: " + err.message);
        }),
      {
        loading: "Fetching image recognition...",
        success: (response) => {
          alert(JSON.stringify(response));
          return "Image recognition updated!";
        },
        error: (e) => "Image recognition failed: " + e.message,
      }
    );
  }, [webcamRef]);

  const { width, height } = useWindowSize();

  const videoConstraints = {
    width: width,
    height: height,
    facingMode:
      facingMode == "user"
        ? "user"
        : {
            exact: "environment",
          },
  };

  return (
    <>
      <Webcam
        screenshotQuality={0.3}
        audio={false}
        height={height}
        ref={webcamRef}
        screenshotFormat="image/png"
        width={width}
        videoConstraints={videoConstraints}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          backdropFilter: "blur(10px)",
          width: 75,
          height: 75,
          left: "50%",
          transform: "translateX(-50%)",
          border: "5px solid #fff",
          cursor: "pointer",
          transition: "all .2s",
          "&:active": {
            transition: "none",
            transform: "translateX(-50%) scale(.9)",
          },
          borderRadius: 99,
        }}
        onClick={capture}
      />
    </>
  );
};

export function ImageRecognition() {
  const [open, setOpen] = React.useState(false);
  const [facingMode, setFacingMode] = React.useState("user");

  React.useEffect(() => {
    const tag: any = document.querySelector(`meta[name="theme-color"]`);
    tag.content = open ? "#000000" : colors[themeColor]["200"];
  }, [open]);

  return (
    <>
      <IconButton disableRipple onClick={() => setOpen(true)}>
        <span className="material-symbols-rounded">view_in_ar</span>
      </IconButton>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: "100vw",
            background: "#000",
          },
        }}
      >
        <AppBar
          elevation={0}
          position="static"
          sx={{
            zIndex: 999,
            background: "linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,0))",
          }}
        >
          <Toolbar className="flex" sx={{ height: "70px" }}>
            <IconButton
              color="inherit"
              disableRipple
              onClick={() => setOpen(false)}
            >
              <span className="material-symbols-rounded">west</span>
            </IconButton>
            <Typography sx={{ mx: "auto", fontWeight: "600" }}>Scan</Typography>
            <IconButton
              color="inherit"
              disableRipple
              onClick={() => {
                setFacingMode(facingMode == "user" ? "environment" : "user");
              }}
            >
              <span
                className={
                  facingMode == "user"
                    ? "material-symbols-outlined"
                    : "material-symbols-rounded"
                }
              >
                cameraswitch
              </span>
            </IconButton>
          </Toolbar>
        </AppBar>
        <WebcamComponent
          facingMode={facingMode}
          setFacingMode={setFacingMode}
        />
      </Drawer>
    </>
  );
}
