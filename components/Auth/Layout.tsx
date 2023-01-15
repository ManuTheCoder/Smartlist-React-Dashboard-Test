import { Box, Chip, createTheme, Typography } from "@mui/material";
import { brown } from "@mui/material/colors";
import { ThemeProvider } from "@mui/material/styles";
import Head from "next/head";
import { Toaster } from "react-hot-toast";

const darkTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: brown[900],
    },
  },
});

/**
 * Layout for the app, including navbar, sidenav, etc
 * @param children Children
 * @returns JSX.Element
 */
export function Layout({ children }): JSX.Element {
  return (
    <>
      <Head>
        <title>Login &bull; Dysperse</title>
      </Head>
      <ThemeProvider theme={darkTheme}>
        <Box
          sx={{
            backgroundColor: "#6b4b4b",
            position: "fixed",
            top: 0,
            left: 0,
            overflow: "scroll",
            width: "100%",
            height: "100%",
          }}
        >
          <Toaster />
          <Box
            sx={{
              display: "inline-flex",
              color: "#c4b5b5",
              alignItems: "center",
              gap: "10px",
              userSelect: "none",
              mx: 2,
              pr: 2,
              borderRadius: 4,
              mt: 2,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:active": {
                transform: "scale(0.95)",
                transitionDuration: "0s",
              },
            }}
            onClick={() => window.open("//dysperse.com")}
          >
            <picture>
              <img
                src="https://i.ibb.co/F7vSQPP/Dysperse-Home-inventory-and-finance-tracking-2.png"
                width="80"
                height="80"
                alt="logo"
                style={{
                  borderRadius: "28px",
                }}
                draggable={false}
              />
            </picture>
            <Typography variant="h6" sx={{ mt: -0.5 }}>
              Dysperse
            </Typography>
            <Chip label="ALPHA" color="warning" size="small" sx={{ ml: 1 }} />
          </Box>
          {children}
        </Box>
      </ThemeProvider>
    </>
  );
}
