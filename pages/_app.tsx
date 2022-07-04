import Box from "@mui/material/Box";
import * as colors from "@mui/material/colors";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useState } from "react";
import { Offline, Online } from "react-detect-offline";
import { Toaster } from "react-hot-toast";
import useSWR from "swr";
import Layout from "../components/Layout";
import LoginPrompt from "../components/LoginPrompt";
import "../styles/global.css";
import Head from "next/head";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import Script from "next/script";
import { withRouter } from "next/router";

dayjs.extend(relativeTime);

function Render({ data, Component, pageProps }: any) {
  global.session = data;
  const [theme, setTheme] = useState<"dark" | "light">(
    data.user.darkMode === "true" ? "dark" : "light"
  );
  const [themeColor, setThemeColor] = useState<
    | "red"
    | "green"
    | "blue"
    | "pink"
    | "purple"
    | "orange"
    | "teal"
    | "cyan"
    | "brown"
  >(data.user.theme);
  global.theme = theme;
  global.setTheme = setTheme;
  global.themeColor = themeColor;
  global.setThemeColor = setThemeColor;

  if (data.user.darkMode === "true") {
    document
      .querySelector(`meta[name="theme-color"]`)!
      .setAttribute("content", "hsl(240, 11%, 10%)");
  }

  const userTheme = createTheme({
    components: {
      MuiPaper: {
        defaultProps: { elevation: 0 },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            ...(global.theme === "dark" && {
              background: "hsl(240, 11%, 30%)",
            }),
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: "20px",
            fontSize: "14px",
            background:
              global.theme === "dark"
                ? "hsl(240, 11%, 30%)"
                : colors[themeColor]["A100"],
            color:
              global.theme === "dark"
                ? "hsl(240, 11%, 90%)"
                : colors[themeColor]["900"],
            paddingLeft: "13px",
            paddingRight: "13px",
            paddingTop: "5px",
            paddingBottom: "5px",
          },
        },
      },
    },
    palette: {
      primary: {
        main: colors[themeColor][global.theme === "dark" ? "A200" : "A700"],
      },
      mode: theme,
      ...(theme === "dark" && {
        background: {
          default: "hsl(240, 11%, 10%)",
          paper: "hsl(240, 11%, 10%)",
        },
        text: {
          primary: "hsl(240, 11%, 90%)",
        },
      }),
    },
  });

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,user-scalable=no"
        />
        <title>Carbon: Home inventory and personal finances</title>
      </Head>
      <Offline>
        <Box
          sx={{
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100vw",
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            p: 1,
            boxSizing: "border-box",
            fontSize: "13px",
            color: "#505050",
          }}
        >
          <Box
            sx={{
              p: 4,
              background: "rgba(200,200,200,.3)",
              borderRadius: 5,
              maxWidth: "calc(100vw - 40px)",
              maxHeight: "calc(100vh - 20px)",
            }}
          >
            Please connect to the internet to access Smartlist
          </Box>
        </Box>
      </Offline>
      <Online>
        <ThemeProvider theme={userTheme}>
          <Box
            sx={{
              "& *::selection": {
                color: "#fff!important",
                background: colors[themeColor]["A700"] + "!important",
              },
            }}
          >
            <Toaster />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </Box>
        </ThemeProvider>
      </Online>
    </>
  );
}

function useUser() {
  const url = "/api/user";
  const { data, error } = useSWR(url, () =>
    fetch(url).then((res) => res.json())
  );

  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
  };
}

function SmartlistApp({ router, Component, pageProps }: any): JSX.Element {
  const { data, isLoading, isError } = useUser();

  return (
    <>
      {router && router.pathname === "/share/[index]" ? (
        <Component {...pageProps} />
      ) : (
        <>
          {!isLoading &&
            !isError &&
            (data.user ? (
              <Render Component={Component} pageProps={pageProps} data={data} />
            ) : (
              <LoginPrompt />
            ))}
        </>
      )}
      <Script src="/prevent-navigate-history.js"></Script>
    </>
  );
}

export default SmartlistApp;
