import { Error } from "@/components/Layout/Error";
import { Loading } from "@/components/Layout/Loading";
import { Analytics } from "@vercel/analytics/react";
import dynamic from "next/dynamic";
import { NextRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

// CSS files
import "../styles/calendar.scss";
import "../styles/globals.scss";
import "../styles/normalize.scss";

// Day.JS
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Hooks
import Layout from "@/components/Layout";
import { SessionProvider, useUser } from "@/lib/client/session";
import Head from "next/head";

import { AccountStorageState } from "@/lib/client/useAccountStorage";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import { toastStyles, useCustomTheme } from "@/lib/client/useTheme";
import { ThemeProvider, createTheme } from "@mui/material";
import { createContext } from "react";
import { SWRConfig } from "swr";

export const StorageContext: any = createContext(null);

const AuthLoading = dynamic(() => import("@/components/Auth/Loading"), {
  loading: () => <Loading />,
});

dayjs.extend(advancedFormat);
dayjs.extend(isoWeek);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

export const fetcher = ([url, params], session) => {
  if (url === null) return;
  const _params = {
    sessionId: session?.current?.token,
    property: session?.property?.propertyId,
    accessToken: session?.property?.accessToken,
    userIdentifier: session?.user?.identifier,
    ...params,
  };

  const _url = `/api/${url}?${new URLSearchParams(_params)}`;

  return fetch(_url).then((res) => {
    return res.json();
  });
};

/**
 * Function to check whether to add a layout or not
 * @param router Next.JS router
 * @param Component Top-level page component
 * @param pageProps Page props
 * @returns JSX.Element
 */
export default function App({
  router,
  Component,
  pageProps,
}: {
  router: NextRouter;
  Component: typeof React.Component;
  pageProps: JSX.Element;
}) {
  const { data, isLoading, isError } = useUser();

  /**
   * URLs to display without the application container
   */
  const bareUrls = [
    "/auth",
    "/auth/signup",
    "/auth/qr-success",
    "/auth/reset-id",
    "/auth/reset-password/[id]",
    "/canny-auth",
    "/invite/[id]",
    "/availability/[id]",
    "/share/[index]",
    "/_offline",
    "/404",
    "/scan",
    "/signup",
  ];

  const disableLayout = bareUrls.includes(router.pathname);

  const selectedProperty =
    data?.properties &&
    (data.properties.find((property: any) => property.selected) ||
      data.properties[0]);

  const themeColor = data?.user?.color || "violet";
  const isDark = useDarkMode(data?.user?.darkMode || "system");

  const palette = useColor(themeColor, isDark);

  const [isReached, setIsReached]: any =
    useState<AccountStorageState>("loading");

  const userTheme = createTheme(
    useCustomTheme({
      darkMode: isDark,
      themeColor: themeColor,
    })
  );

  useEffect(() => {
    localStorage.getItem("recentlyAccessedTasks");
    document.documentElement.classList[isDark ? "add" : "remove"]("dark");
  }, [isDark]);

  const children = <Component {...pageProps} />;

  const s = data?.properties && {
    ...data,
    property: selectedProperty,
    permission: selectedProperty.permission,
    themeColor,
    darkMode: data.user.darkMode,
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <SWRConfig value={{ fetcher: (d) => fetcher(d, s) }}>
        <SessionProvider session={s} isLoading={isLoading}>
          <StorageContext.Provider value={{ isReached, setIsReached }}>
            <ThemeProvider theme={userTheme}>
              <Toaster
                containerClassName="noDrag"
                containerStyle={{
                  top: "calc(0dvh + 10px) !important",
                  // bottom: "unset!important",
                }}
                toastOptions={toastStyles}
              />
              <Head>
                <title>Dysperse</title>
                <meta name="theme-color" content={palette[1]} />
                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1, user-scalable=no, interactive-widget=resizes-content, viewport-fit=cover"
                />
                <link
                  rel="shortcut icon"
                  href="https://assets.dysperse.com/v8/android/android-launchericon-48-48.png"
                />
              </Head>
              <Analytics />

              {disableLayout ? (
                children
              ) : (
                <>
                  {isLoading && <Loading />}
                  {!isLoading && !isError && data.error && <AuthLoading />}
                  {!isLoading && !isError && !data.error && (
                    <Layout>{children}</Layout>
                  )}
                  {isError && <Error />}
                </>
              )}
            </ThemeProvider>
          </StorageContext.Provider>
        </SessionProvider>
      </SWRConfig>
    </LocalizationProvider>
  );
}
