import LoadingButton from "@mui/lab/LoadingButton";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import NoSsr from "@mui/material/NoSsr";
import Masonry from "@mui/lab/Masonry";
import Skeleton from "@mui/material/Skeleton";
import {
  createTheme,
  experimental_sx as sx,
  ThemeProvider,
} from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import hex2rgba from "hex-to-rgba";
import Head from "next/head";
import Link from "next/link";
import { NextRouter } from "next/router";
import Script from "next/script";
import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import useSWR from "swr";
import LoginPrompt from "../components/Auth/Prompt";
import Layout from "../components/Layout";
import { colors } from "../lib/colors";
import "../styles/globals.scss";
import "../styles/search.scss";
import { Property, Session } from "../types/session";
dayjs.extend(relativeTime);

/**
 * Loading screen
 * @returns JSX.Element
 */
export function Loading(): JSX.Element {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        background:
          global.user && global.user.darkMode ? "hsl(240,11%,10%)" : "#fff",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <AppBar
        sx={{
          position: "fixed",
          top: 0,
          background: "transparent",
          py: {
            sm: 1,
            xs: 0.9,
          },
        }}
        elevation={0}
      >
        <Toolbar>
          <Skeleton
            animation={false}
            sx={{ width: { xs: 130, sm: 200 }, maxWidth: "100%" }}
          />
          <Skeleton
            animation={false}
            variant="rectangular"
            sx={{
              height: 40,
              borderRadius: 5,
              mx: "auto",
              width: { xs: 0, sm: "500px" },
              maxWidth: "100%",
            }}
          />
          <Box sx={{ ml: "auto", display: "flex", gap: 1.5 }}>
            {[...new Array(2)].map((id) => (
              <Skeleton
                variant="circular"
                animation={false}
                width={35}
                key={Math.random().toString()}
                height={35}
                sx={{
                  maxWidth: "100%",
                }}
              />
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: "flex",
        }}
      >
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "column",
            alignItems: "center",
            height: "100vh",
            gap: 2,
            justifyContent: "center",
            width: "95px",
            pt: 5,
            px: 1,
          }}
        >
          {[...new Array(5)].map(() => (
            <Skeleton
              variant="rectangular"
              animation={false}
              key={Math.random().toString()}
              sx={{ borderRadius: 5, height: 50, width: 50 }}
            />
          ))}
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            width: "100%",
          }}
        >
          <Container sx={{ mt: { xs: 5, sm: 15 } }}>
            <Masonry spacing={{ xs: 0, sm: 1 }} columns={{ xs: 1, sm: 2 }}>
              {[...new Array(10)].map(() => (
                <Box key={Math.random().toString()}>
                  <Skeleton
                    variant="rectangular"
                    animation={false}
                    sx={{
                      borderRadius: 5,
                      mb: { xs: 1, sm: 0 },
                      height: Math.random() * 200 + 200,
                    }}
                  />
                </Box>
              ))}
            </Masonry>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Main function, including layout and theme.
 * @param data User session data
 * @param Component Top-level page component
 * @param pageProps Page props
 * @param router Next.JS router
 * @returns JSX.Element
 */
function Render({
  data,
  Component,
  pageProps,
  router,
}: {
  data: Session;
  Component: typeof React.Component;
  pageProps: JSX.Element;
  router: NextRouter;
}) {
  global.user = data.user;
  const [theme, setTheme] = useState<"dark" | "light">(
    data.user.darkMode ? "dark" : "light"
  );
  const [themeColor, setThemeColor] = useState(data.user.color);
  const [loadingButton, setLoadingButton] = useState(false);

  const [itemLimitReached, setItemLimitReached] = useState(true);
  global.itemLimitReached = itemLimitReached;
  global.setItemLimitReached = setItemLimitReached;

  global.theme = theme;
  global.themeColor = themeColor;

  global.setTheme = setTheme;
  global.setThemeColor = setThemeColor;

  if (data.user.darkMode) {
    document
      .querySelector(`meta[name="theme-color"]`)
      ?.setAttribute("content", "hsl(240, 11%, 10%)");
  }

  useEffect(() => {
    global.user = data.user;
    global.theme = theme;
    global.themeColor = themeColor;
    global.setTheme = setTheme;
    global.setThemeColor = setThemeColor;
    setThemeColor(data.user.color);

    setTheme(data.user.darkMode ? "dark" : "light");
    if (data.user.darkMode) {
      document
        .querySelector(`meta[name="theme-color"]`)
        ?.setAttribute("content", "hsl(240, 11%, 10%)");
    }
  }, [data, setTheme, setThemeColor, theme, themeColor]);

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
      MuiMenu: {
        defaultProps: {
          BackdropProps: {
            sx: {
              opacity: "0!important",
            },
          },
        },
        styleOverrides: {
          root: sx({
            transition: "all .2s",
            "& .MuiPaper-root": {
              mt: 1,
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              ml: -1,
              borderRadius: "15px",
              minWidth: 180,
              background: global.user.darkMode
                ? colors[global.themeColor][900]
                : colors[global.themeColor][50],

              color: global.user.darkMode
                ? colors[global.themeColor][200]
                : colors[global.themeColor][800],
              "& .MuiMenu-list": {
                padding: "4px",
              },
              "& .MuiMenuItem-root": {
                "&:hover": {
                  background: global.user.darkMode
                    ? colors[global.themeColor][800]
                    : colors[global.themeColor][100],
                  color: global.user.darkMode
                    ? colors[global.themeColor][100]
                    : colors[global.themeColor][900],
                  "& .MuiSvgIcon-root": {
                    color: global.user.darkMode
                      ? colors[global.themeColor][200]
                      : colors[global.themeColor][800],
                  },
                },
                padding: "10px 15px",
                borderRadius: "15px",
                marginBottom: "1px",

                "& .MuiSvgIcon-root": {
                  fontSize: 25,
                  color: colors[global.themeColor][700],
                  marginRight: 1.9,
                },
                "&:active": {
                  background: global.user.darkMode
                    ? colors[global.themeColor][700]
                    : colors[global.themeColor][200],
                },
              },
            },
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            ...(global.user.darkMode && {
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
            color: global.user.darkMode
              ? "hsl(240, 11%, 30%)"
              : colors[themeColor]["50"],
            background: global.user.darkMode
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
        main: colors[themeColor][global.user.darkMode ? "A200" : "800"],
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

  if (data.user.properties.length === 0) {
    return <Box>0 properties!</Box>;
  }

  // find active property in the array of properties
  const selectedProperty =
    data.user.properties.find((property: Property) => property.selected) ||
    data.user.properties[0];

  global.property = selectedProperty;

  localStorage.setItem("propertyId", selectedProperty.propertyId);
  localStorage.setItem("accessToken", selectedProperty.accessToken);

  // set CSS variable to <html>
  document.documentElement.style.setProperty(
    "--theme",
    hex2rgba(colors[themeColor ?? "brown"]["100"], 0.5)
  );
  document.documentElement.style.setProperty(
    "--bgtheme",
    hex2rgba(colors[themeColor ?? "brown"]["400"], 0.3)
  );
  document.documentElement.style.setProperty("--bg", colors[themeColor][900]);

  return (
    <>
      <Head>
        {/* Prevent page zoom*/}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no"
        />
        <title>Carbon: Next-gen personal home inventory</title>
      </Head>
      <ThemeProvider theme={userTheme}>
        <Box
          sx={{
            "& *::selection": {
              color: "#fff!important",
              background: `${colors[themeColor]["A700"]}!important`,
            },
          }}
        >
          <Toaster />
          {window.location.pathname == "/onboarding" ? (
            <Component {...pageProps} />
          ) : data.user.onboardingComplete ? (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          ) : (
            <LoadingButton
              ref={(i) => i && i.click()}
              loading={loadingButton}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              onClick={() => {
                setLoadingButton(true);
                router.push("/onboarding");
              }}
            >
              Click here if you&apos;re not being redirected
            </LoadingButton>
          )}
        </Box>
      </ThemeProvider>
    </>
  );
}

/**
 * Fetches user session data
 * @returns {any}
 */
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

/**
 * Function to just render a component, instead of adding a layout for the whole page
 * @param data data
 * @param Component Top-level page component
 * @param pageProps Page props
 * @returns JSX.Element
 */
function RenderComponent({
  Component,
  pageProps,
  data,
}: {
  data: Session;
  Component: typeof React.Component;
  pageProps: JSX.Element;
}) {
  global.user = data;

  return (
    <NoSsr>
      <Component {...pageProps} />
      <Toaster />
    </NoSsr>
  );
}

/**
 * Function to check whether to add a layout or not
 * @param router Next.JS router
 * @param Component Top-level page component
 * @param pageProps Page props
 * @returns JSX.Element
 */
function RenderApp({
  router,
  Component,
  pageProps,
}: {
  Component: typeof React.Component;
  pageProps: JSX.Element;
  router: NextRouter;
}) {
  const { data, isLoading, isError } = useUser();
  return router.pathname === "/share/[index]" ||
    router.pathname === "/invite/[id]" ||
    router.pathname === "/scan" ||
    router.pathname === "/signup" ||
    router.pathname === "/canny-auth" ? (
    <RenderComponent Component={Component} data={data} pageProps={pageProps} />
  ) : (
    <>
      {!isLoading && <Loading />}
      {isError && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            textAlign: "center",
            background: "hsl(240, 11%, 10%)",
            height: "100%",
            width: "100%",
            color: "#fff",
            left: 0,
          }}
        >
          <Box
            ref={() =>
              document
                .querySelector(`meta[name="theme-color"]`)
                ?.setAttribute("content", "hsl(240, 11%, 10%)")
            }
            sx={{
              position: "fixed",
              p: 5,
              borderRadius: 5,
              top: "50%",
              textAlign: "center",
              background: "hsl(240, 11%, 13%)",
              left: "50%",
              maxWidth: "calc(100vw - 20px)",
              width: "350px",
              transform: "translate(-50%, -50%)",
            }}
          >
            <picture>
              <img
                src="https://i.ibb.co/1GnBXX4/image.png"
                alt="An error occured"
              />
              <Typography variant="h5" sx={{ textAlign: "center" }}>
                An error occured
              </Typography>
              <Typography variant="body1" sx={{ textAlign: "center" }}>
                Please try again later. If the problem persists, please contact
                us at{" "}
                <Link href="mailto:hello@smartlist.tech" target="_blank">
                  <MuiLink href="mailto:hello@smartlist.tech" target="_blank">
                    hello@smartlist.tech
                  </MuiLink>
                </Link>
              </Typography>
            </picture>
          </Box>
        </Box>
      )}
      {false && !isLoading && !isError && !data.error && (
        <Render
          router={router}
          Component={Component}
          pageProps={pageProps}
          data={data}
        />
      )}
      {!isLoading && !isError && data.error && <LoginPrompt />}
    </>
  );
}

/**
 * NoSsr wrapper to prevent server-side rendering
 * @param router Next.JS router
 * @returns JSX.Element
 */
function SmartlistApp({
  router,
  Component,
  pageProps,
}: {
  Component: typeof React.Component;
  pageProps: JSX.Element;
  router: NextRouter;
}): JSX.Element {
  return (
    <>
      {/* <NoSsr> */}
      <RenderApp router={router} Component={Component} pageProps={pageProps} />
      {/* </NoSsr> */}
      <Script src="/prevent-navigate-history.js" />
    </>
  );
}

export default SmartlistApp;
