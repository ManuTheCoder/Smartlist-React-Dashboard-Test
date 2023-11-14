"use client";

import { containerRef } from "@/app/(app)/container";
import { ErrorHandler } from "@/components/Error";
import { Navbar } from "@/components/Layout/Navigation/Navbar";
import { AvailabilityTrigger } from "@/components/Start/AvailabilityTrigger";
import { Friend } from "@/components/Start/Friend";
import { FriendsTrigger } from "@/components/Start/FriendsTrigger";
import { capitalizeFirstLetter } from "@/lib/client/capitalizeFirstLetter";
import { useSession } from "@/lib/client/session";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import {
  Alert,
  Box,
  Icon,
  IconButton,
  List,
  ListItem,
  NoSsr,
  Skeleton,
  SwipeableDrawer,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import dayjs from "dayjs";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Virtuoso } from "react-virtuoso";
import useSWR from "swr";
import { HeadingComponent } from "../../components/Start/HeadingComponent";
import { fetcher } from "./fetcher";
import { swipeablePageStyles } from "./swipeablePageStyles";
import airQuality from "./tasks/Layout/widgets/airQuality.json";
import weatherCodes from "./tasks/Layout/widgets/weatherCodes.json";
const ContactSync = dynamic(() => import("@/components/Start/ContactSync"));

function getAirQualityInfo(index) {
  const result = airQuality.find(
    (category) => index >= category.index.min && index <= category.index.max
  );

  return result || null; // Return null if no matching category is found
}

function Weather() {
  const hourlyRef = useRef();
  const { session } = useSession();
  const isDark = useDarkMode(session.darkMode);
  const palette = useColor(session.themeColor, isDark);
  const [open, setOpen] = useState(false);
  const [locationData, setLocationData] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [airQualityData, setAirQualityData] = useState<any>(null);

  const isNight = () => {
    const currentHour = new Date().getHours();
    return currentHour >= 18 || currentHour <= 6; // Assuming night is between 6 PM and 6 AM
  };

  const getWeather = async () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      let lat = position.coords.latitude;
      let long = position.coords.longitude;
      fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${long}`)
        .then((res) => res.json())
        .then((res) => setLocationData(res));
      fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${long}&current=pm2_5`
      )
        .then((r) => r.json())
        .then((r) => setAirQualityData(r))
        .catch((e) => toast.error("Couldn't get air quality"));
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=relative_humidity_2m&hourly=visibility,temperature_2m,wind_speed_10m,apparent_temperature,precipitation_probability,weathercode&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=10&daily=weather_code,temperature_2m_max,temperature_2m_min`;
      fetch(url)
        .then((res) => res.json())
        .then((res) => setWeatherData(res));
    });
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        document
          .getElementById("activeHour")
          .scrollIntoView({ block: "center", inline: "center" });
      }, 200);
    }
  }, [open]);

  useEffect(() => {
    getWeather();
    const interval = setInterval(getWeather, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return weatherData ? (
    <>
      <SwipeableDrawer
        open={open}
        onClose={() => setOpen(false)}
        anchor="bottom"
        PaperProps={{
          sx: {
            maxHeight: "calc(100dvh - 150px)",
            "& .MuiChip-root": {
              background: "rgba(255,255,255,.1)",
              color: "inherit",
              "& .MuiIcon-root": {
                color: "inherit",
              },
            },
            color:
              weatherCodes[weatherData.current_weather.weathercode][
                isNight() ? "night" : "day"
              ].textColor,
            background: `linear-gradient(${
              weatherCodes[weatherData.current_weather.weathercode][
                isNight() ? "night" : "day"
              ].backgroundGradient[0]
            },${
              weatherCodes[weatherData.current_weather.weathercode][
                isNight() ? "night" : "day"
              ].backgroundGradient[1]
            })`,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            my: 5,
          }}
        >
          <Icon sx={{ fontSize: "70px!important" }} className="outlined">
            {isNight()
              ? weatherCodes[weatherData.current_weather.weathercode].night.icon
              : weatherCodes[weatherData.current_weather.weathercode].day.icon}
          </Icon>
          <Typography variant="h2" sx={{ fontWeight: 200, ml: 2 }}>
            {-~weatherData.current_weather.temperature}&deg;
          </Typography>
          <Typography sx={{ opacity: 0.6 }}>
            {capitalizeFirstLetter(
              (isNight()
                ? weatherCodes[weatherData.current_weather.weathercode].night
                    .description
                : weatherCodes[weatherData.current_weather.weathercode].day
                    .description
              ).toLowerCase()
            )}
          </Typography>
        </Box>
        <Box sx={{ px: 3 }}>
          <Grid
            container
            spacing={2}
            sx={{
              "& .card": {
                display: "flex",
                alignItems: "center",
                background: "rgba(255,255,255,.1)",
                borderRadius: 5,
                p: 1,
                gap: 2,
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
                "& *": {
                  minWidth: 0,
                  maxWidth: "100%",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                },
                width: "100%",
                "& .MuiIcon-root": {
                  fontSize: "30px!important",
                  fontVariationSettings:
                    '"FILL" 0, "wght" 200, "GRAD" 0, "opsz" 40!important',
                },
              },
            }}
          >
            <Grid xs={6}>
              <Box className="card">
                <Icon>waving_hand</Icon>
                <Box>
                  <Typography>Feels like</Typography>
                  <Typography variant="h6">
                    {-~weatherData.hourly.apparent_temperature[dayjs().hour()]}
                    &deg;
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box className="card">
                <Icon>water_drop</Icon>
                <Box>
                  <Typography>Precipitation</Typography>
                  <Typography variant="h6">
                    {Math.round(
                      weatherData.hourly.precipitation_probability[
                        dayjs().hour()
                      ]
                    )}
                    %
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box className="card">
                <Icon>airwave</Icon>
                <Box>
                  <Typography>Wind</Typography>
                  <Typography variant="h6">
                    {Math.round(
                      weatherData.hourly.wind_speed_10m[dayjs().hour()]
                    )}{" "}
                    mph
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box className="card">
                <Icon>visibility</Icon>
                <Box>
                  <Typography>Visibility</Typography>
                  <Typography variant="h6">
                    {Math.round(
                      weatherData.hourly.visibility[dayjs().hour()] / 1609
                    )}{" "}
                    mi
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box className="card">
                <Icon>north</Icon>
                <Box>
                  <Typography>High</Typography>
                  <Typography variant="h6">
                    {-~weatherData.daily.temperature_2m_max[0]}&deg;
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid xs={6}>
              <Box className="card">
                <Icon>south</Icon>
                <Box>
                  <Typography>Low</Typography>
                  <Typography variant="h6">
                    {-~weatherData.daily.temperature_2m_min[0]}&deg;
                  </Typography>
                </Box>
              </Box>
            </Grid>
            {airQualityData ? (
              <Grid xs={12}>
                <Box className="card">
                  <Icon>eco</Icon>
                  <Box>
                    <Typography>Air quality</Typography>
                    <Typography variant="h6">
                      {
                        getAirQualityInfo(airQualityData?.current?.pm2_5)
                          ?.category
                      }
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: "normal!important" }}
                    >
                      {
                        getAirQualityInfo(airQualityData?.current?.pm2_5)
                          ?.meaning
                      }
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ) : (
              <Skeleton variant="rectangular" height={80} />
            )}
          </Grid>
          <Typography
            sx={{
              mt: 2,
              textTransform: "uppercase",
              fontWeight: "900",
              fontSize: "13px",
              opacity: 0.6,
            }}
          >
            Hourly
          </Typography>
          <Box
            sx={{
              borderRadius: 5,
              background: "rgba(255,255,255,.1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <SparkLineChart
              data={weatherData.hourly.temperature_2m.slice(0, 24)}
              height={100}
              curve="natural"
              area
              colors={["#fff"]}
              margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
              sx={{
                border: 0,
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                opacity: 0.3,
              }}
            />
            <Box
              sx={{
                overflow: "scroll",
                display: "flex",
                alignItems: "center",
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                width: "100%",
              }}
              ref={hourlyRef}
            >
              {weatherData.hourly.temperature_2m.slice(0, 24).map((temp, i) => (
                <Box
                  key={i}
                  {...(i === dayjs().hour() && { id: "activeHour" })}
                  sx={{
                    flexShrink: 0,
                    p: 1,
                    borderRadius: 5,
                    width: "80px",
                    display: "flex",
                    flexDirection: "column",
                    alignItem: "center",
                    justifyContent: "center",
                    ...(i === dayjs().hour() && {
                      background: "rgba(255,255,255,.1)",
                    }),
                  }}
                >
                  <Icon>
                    {
                      weatherCodes[weatherData.hourly.weathercode[i]][
                        isNight() ? "night" : "day"
                      ].icon
                    }
                  </Icon>
                  <Typography>{-~temp}&deg;</Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.6,
                      textTransform: "uppercase",
                      fontWeight: 900,
                    }}
                  >
                    {dayjs().startOf("day").add(i, "hours").format("hA")}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Typography
            sx={{
              mt: 2,
              textTransform: "uppercase",
              fontWeight: "900",
              fontSize: "13px",
              opacity: 0.6,
            }}
          >
            Daily
          </Typography>
          <List
            sx={{
              background: "rgba(255,255,255,.1)",
              borderRadius: 5,
              my: 2,
            }}
          >
            {weatherData.daily.weather_code.map((code, i) => (
              <ListItem
                key={code}
                sx={{
                  "&:not(:last-child)": {
                    borderBottom: "1px solid rgba(255,255,255,.1)",
                  },
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{ fontWeight: "900", opacity: 0.6, mr: "auto" }}
                >
                  {dayjs().startOf("day").add(i, "day").format("ddd")}
                </Typography>
                {-~weatherData.daily.temperature_2m_min[i]}
                {" - "}
                {-~weatherData.daily.temperature_2m_max[i]}&deg;
                <Icon className="outlined">
                  {isNight()
                    ? weatherCodes[code].night.icon
                    : weatherCodes[code].day.icon}
                </Icon>
              </ListItem>
            ))}
          </List>
        </Box>
      </SwipeableDrawer>
      <Box
        sx={{
          position: "relative",
          p: { xs: 2, sm: 3 },
          borderRadius: 5,
          background: palette[3],
          color: palette[11],
          height: "130px",
        }}
        onClick={() => setOpen(true)}
      >
        <Icon sx={{ fontSize: "40px!important" }} className="outlined">
          {isNight()
            ? weatherCodes[weatherData.current_weather.weathercode].night.icon
            : weatherCodes[weatherData.current_weather.weathercode].day.icon}
        </Icon>
        <Typography sx={{ ml: 0.2 }} variant="h5">
          {-~weatherData.current_weather.temperature}&deg;
        </Typography>
        <Typography sx={{ ml: 0.2 }} variant="body2">
          {isNight()
            ? weatherCodes[weatherData.current_weather.weathercode].night
                .description
            : weatherCodes[weatherData.current_weather.weathercode].day
                .description}
        </Typography>
      </Box>
    </>
  ) : (
    <Skeleton variant="rectangular" width="100%" height={130} />
  );
}

function TodaysDate() {
  const { session } = useSession();
  const isDark = useDarkMode(session.darkMode);
  const palette = useColor(session.themeColor, isDark);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 5,
        background: palette[3],
        color: palette[11],
      }}
    >
      <Icon sx={{ fontSize: "40px!important" }} className="outlined">
        calendar_today
      </Icon>
      <Typography sx={{ ml: 0.2 }} variant="h5">
        Sunday
      </Typography>
      <Typography sx={{ ml: 0.2 }} variant="body2">
        Nov 12th
      </Typography>
    </Box>
  );
}

function TodaysTasks() {
  const { session } = useSession();
  const isDark = useDarkMode(session.darkMode);
  const palette = useColor(session.themeColor, isDark);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 5,
        background: palette[3],
        color: palette[11],
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Icon sx={{ fontSize: "40px!important" }} className="outlined">
        check_circle
      </Icon>
      <Box>
        <Typography variant="h5">5 tasks</Typography>
        <Typography variant="body2">3 complete</Typography>
      </Box>
    </Box>
  );
}

function Home() {
  const { session } = useSession();
  const isDark = useDarkMode(session.darkMode);
  const palette = useColor(session.themeColor, isDark);
  const isMobile = useMediaQuery("(max-width: 600px)");

  const params: any = ["user/friends", { email: session.user.email }];

  const { data, error, mutate } = useSWR(
    params,
    fetcher(params, session) as any,
    {
      refreshInterval: 5000,
    }
  );

  const router = useRouter();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: 1,
    active: isMobile,
  });

  const [loadingIndex, setLoadingIndex] = useState(1);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("scroll", (e) => {
        if (e.selectedScrollSnap() == 0) {
          setLoadingIndex(0);
          document.getElementById("link1")?.click();
          // router.push("/tasks/home");
        } else if (e.selectedScrollSnap() == 2) {
          setLoadingIndex(2);
          document.getElementById("link3")?.click();
          // router.push("/rooms");
        } else {
          setLoadingIndex(1);
        }
      });
    }
  }, [emblaApi, router]);

  const sectionHeaderStyles = {
    textTransform: "uppercase",
    fontWeight: 900,
    fontSize: "14px",
    opacity: 0.6,
    mb: 1.5,
    mt: 3,
    color: palette[11],
  };

  return (
    <Box
      sx={{
        background: `radial-gradient(${palette[2]} 4px, ${palette[1]} 5px, transparent 0)`,
        backgroundSize: "50px 50px",
        // backgroundAttachment: "fixed",
        backgroundPosition: "-25px -25px",
      }}
    >
      {isMobile ? (
        <Navbar
          showLogo={isMobile}
          showRightContent={isMobile}
          right={
            <IconButton sx={{ background: palette[3] }}>
              <Icon className="outlined">workspaces</Icon>
            </IconButton>
          }
        />
      ) : (
        <Toolbar />
      )}
      <Box
        sx={{
          maxWidth: "100dvw",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          mt: "env(titlebar-area-height)",
          ...(loadingIndex !== 1 && {
            pointerEvents: "none",
          }),
        }}
        ref={emblaRef}
      >
        <Box sx={{ display: "flex" }}>
          {isMobile && (
            <Box
              sx={{
                flex: "0 0 100dvw",
              }}
            >
              <Box
                sx={{
                  transform: `scale(${loadingIndex === 0 ? 1.5 : 1})`,
                  transition: "all .4s cubic-bezier(.17,.67,.57,1.39)",
                }}
              >
                <Box sx={swipeablePageStyles(palette, "left")}>
                  <Icon>check_circle</Icon>
                  <Typography variant="h4" className="font-heading">
                    Tasks
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          <Box sx={{ flex: "0 0 100dvw" }}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }}>
              <Box
                sx={{
                  pt: { xs: 7, sm: 15 },
                }}
              >
                <Box
                  sx={{
                    mb: { xs: 2, sm: 2 },
                    px: { xs: 4, sm: 6 },
                  }}
                >
                  <Typography
                    sx={{
                      ...sectionHeaderStyles,
                      mb: 0,
                      ml: 0.1,
                      textShadow: `0 0 40px ${palette[8]}`,
                    }}
                  >
                    Hey{" "}
                    {capitalizeFirstLetter(session.user.name.split(" ")?.[0])},
                  </Typography>
                  <HeadingComponent palette={palette} isMobile={isMobile} />
                  <Typography
                    sx={{
                      mt: -1,
                      ml: 0.2,
                      fontWeight: 700,
                      color: palette[11],
                      opacity: 0.8,
                      textShadow: `0 0 40px ${palette[8]}`,
                    }}
                    variant="h6"
                  >
                    Are you ready to seize the day?
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  px: 3,
                  maxWidth: "100dvw",
                  display: "flex",
                  gap: 2,
                  "& .button": {
                    background: palette[3],
                    borderRadius: 5,
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    gap: 2,
                    fontWeight: 700,
                    color: palette[11],
                    "& .MuiIcon-root": {
                      fontSize: "30px!important",
                    },
                  },
                }}
              >
                <AvailabilityTrigger />
                <FriendsTrigger />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  mx: "auto",
                  width: "100%",
                  maxWidth: { sm: "500px" },
                  px: 3,
                  flexDirection: "column",
                }}
              >
                <Typography sx={sectionHeaderStyles}>
                  Today&apos;s rundown
                </Typography>
                <Box>
                  <Grid container sx={{ mb: 2 }} spacing={2}>
                    <Grid xs={6}>
                      <Weather />
                    </Grid>
                    <Grid xs={6}>
                      <TodaysDate />
                    </Grid>
                    <Grid xs={12}>
                      <TodaysTasks />
                    </Grid>
                  </Grid>
                </Box>
                <Box sx={{ mb: 5 }}>
                  <Typography sx={sectionHeaderStyles}>
                    Recent activity
                  </Typography>
                  {data?.length === 0 && (
                    <Alert
                      sx={{
                        mb: -2,
                        mt: 2,
                        background: palette[3],
                        color: palette[12],
                      }}
                      severity="info"
                      icon={
                        <Icon sx={{ color: palette[12] }} className="outlined">
                          info
                        </Icon>
                      }
                    >
                      Friends will appear here!
                    </Alert>
                  )}

                  {data ? (
                    data?.friends?.length > 0 && (
                      <Virtuoso
                        initialItemCount={
                          data.friends.length < 5 ? data.friends.length : 5
                        }
                        customScrollParent={
                          isMobile ? undefined : containerRef.current
                        }
                        useWindowScroll
                        totalCount={data.friends.length}
                        itemContent={(i) => (
                          <Friend
                            mutate={mutate}
                            friend={
                              data.friends[i].follower ||
                              data.friends[i].following
                            }
                            key={i}
                          />
                        )}
                      />
                    )
                  ) : error ? (
                    <ErrorHandler
                      callback={mutate}
                      error="Couldn't load your friends. Try again later."
                    />
                  ) : (
                    <>
                      {[...new Array(5)].map((_, i) => (
                        <Box
                          key={i}
                          sx={{
                            mb: 2,
                            px: 2,
                            display: "flex",
                            gap: 2,
                            alignItems: "center",
                            border: "2px solid",
                            borderColor: palette[3],
                            borderRadius: 5,
                            height: 95,
                          }}
                        >
                          <Skeleton
                            variant="circular"
                            width={50}
                            height={50}
                            sx={{ mt: -1 }}
                          />
                          <Box sx={{ flexGrow: 1 }}>
                            <Skeleton
                              width={"90%"}
                              height={35}
                              sx={{ mt: -1 }}
                            />
                            <Skeleton width={"50%"} sx={{ mt: -0.1 }} />
                          </Box>
                        </Box>
                      ))}
                    </>
                  )}
                </Box>
                <ContactSync showFriends={data?.friends?.length === 0} />
              </Box>
              <Toolbar />
            </motion.div>
          </Box>
          {isMobile && session.space.info.type !== "study group" && (
            <Box sx={{ flex: "0 0 100dvw" }}>
              <Box
                sx={{
                  transform: `scale(${loadingIndex === 2 ? 1.5 : 1})`,
                  transition: "all .4s cubic-bezier(.17,.67,.57,1.39)",
                }}
              >
                <Box sx={swipeablePageStyles(palette, "right")}>
                  <Icon>package_2</Icon>
                  <Typography variant="h4" className="font-heading">
                    Inventory
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default function Page() {
  return (
    <NoSsr>
      <Home />
    </NoSsr>
  );
}
