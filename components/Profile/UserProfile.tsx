import { capitalizeFirstLetter } from "@/lib/client/capitalizeFirstLetter";
import { useSession } from "@/lib/client/session";
import { fetchRawApi } from "@/lib/client/useApi";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import { useStatusBar } from "@/lib/client/useStatusBar";
import { colors } from "@/lib/colors";
import { Masonry } from "@mui/lab";
import {
  Box,
  Chip,
  Icon,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { Twemoji } from "react-emoji-render";
import { mutate } from "swr";
import { Followers } from "./Followers";
import { Following } from "./Following";
import { WorkingHours } from "./WorkingHours";

function SpotifyCard({ styles, profile }) {
  const session = useSession();
  const [playing, setPlaying] = useState<null | any>(null);

  const getSpotifyData = useCallback(async () => {
    const { access_token, refresh_token } = profile.spotify;
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/currently-playing`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    ).then((res) => res.json());

    setPlaying(response);

    if (response.error?.status === 401) {
      await fetchRawApi(session, "user/spotify/refresh", {
        refresh_token,
      });
    }
  }, [profile.spotify, session]);

  useEffect(() => {
    getSpotifyData();
    const interval = setInterval(() => {
      getSpotifyData();
    }, 10000);

    window.addEventListener("focus", getSpotifyData);
    return () => {
      window.removeEventListener("focus", getSpotifyData);
      clearInterval(interval);
    };
  }, [getSpotifyData]);

  return (
    <Box
      sx={{
        ...styles,
        background: "#1db954",
        color: "#fff",
        cursor: "pointer",
        transition: "transform .2s",
        "&:hover": {
          transform: "scale(1.02)",
        },
        "&:active": {
          transform: "scale(.95)",
        },
      }}
      onClick={() =>
        window.open(
          playing?.item?.external_urls?.spotify || "https://open.spotify.com"
        )
      }
    >
      {playing?.item ? (
        <>
          <Box sx={{ display: "flex", gap: 3 }}>
            <picture>
              <img
                src={playing?.item?.album.images[0].url}
                alt="Spotify album cover"
                style={{ width: "100%", borderRadius: "25px" }}
              />
            </picture>
            <picture>
              <img
                src={
                  "https://cdn.freebiesupply.com/logos/large/2x/spotify-2-logo-black-and-white.png"
                }
                alt="Spotify"
                style={{ width: "45px", height: "45px" }}
              />
            </picture>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              overflow: "hidden",
            }}
          >
            <Icon className="outlined" sx={{ fontSize: "40px!important" }}>
              {playing.is_playing ? "pause_circle_filled" : "play_circle"}
            </Icon>
            <Box sx={{ flexGrow: 1, maxWidth: "100%", minWidth: 0, mt: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {playing.item.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {playing.item.artists.map((artist) => artist.name).join(", ")}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(playing.progress_ms / playing.item.duration_ms) * 100}
                sx={{
                  height: 10,
                  borderRadius: 99,
                  background: "rgba(255, 255, 255, 0.2)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 99,
                    background: "#fff",
                  },
                }}
              />
            </Box>
          </Box>
        </>
      ) : (
        "Not playing anything - check back later!"
      )}
    </Box>
  );
}

export function UserProfile({
  mutationUrl,
  isCurrentUser,
  data,
  profileCardStyles,
}) {
  const session = useSession();
  const birthdayRef: any = useRef();

  const profile = data.Profile;

  const chipStyles = () => ({
    color: palette[11],
    background: palette[3],
    "&:hover": {
      background: palette[4],
    },
    "& .MuiIcon-root": {
      color: palette[10] + "!important",
      fontVariationSettings:
        '"FILL" 0, "wght" 350, "GRAD" 0, "opsz" 40!important',
    },
  });

  const [hobbies, setHobbies] = useState(data.Profile.hobbies);

  const handleChange = async (key, value) => {
    await fetchRawApi(session, "user/profile/update", {
      email: session.user.email,
      [key]: value,
    });
    await mutate(mutationUrl);
  };

  const handleDelete = async () => {
    await fetchRawApi(session, "user/profile/delete", {
      email: session.user.email,
    });
    await mutate(mutationUrl);
  };

  const today = dayjs();
  const nextBirthday = dayjs(profile.birthday).year(today.year());
  const isDark = useDarkMode(session.darkMode);

  const palette = useColor(data?.color || "gray", isDark);

  const daysUntilNextBirthday =
    nextBirthday.diff(today, "day") >= 0
      ? nextBirthday.diff(today, "day")
      : nextBirthday.add(1, "year").diff(today, "day");

  useStatusBar(palette[1]);

  const styles = {
    color: palette[11],
    textAlign: "center",
    width: { sm: "auto" },
    px: 2,
    py: 2,
    borderRadius: "20px",
    "& h6": {
      mt: -1,
      fontSize: 27,
      fontWeight: 900,
    },
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mt: 2,
          alignItems: "center",
          justifyContent: { xs: "center", sm: "flex-start" },
          flexWrap: "wrap",
        }}
      >
        <Tooltip title="Goals completed">
          <Chip
            sx={chipStyles}
            label={data.trophies}
            icon={
              <Icon sx={{ color: "inherit!important" }}>military_tech</Icon>
            }
          />
        </Tooltip>
        <Tooltip title="Timezone">
          <Chip
            sx={chipStyles}
            label={
              <>
                <b>
                  {data.timeZone.includes("/")
                    ? data.timeZone.split("/")[1].replace("_", " ")
                    : data.timeZone}
                </b>
                {data.timeZone.includes("/") &&
                  ` - ${data.timeZone.split("/")[0]}`}
              </>
            }
            icon={<Icon>location_on</Icon>}
          />
        </Tooltip>
        {data.CoachData && (
          <Tooltip title="Coach streak">
            <Chip
              sx={{
                ...(data.CoachData.streakCount > 0
                  ? {
                      background: colors.orange[isDark ? 900 : 100],
                      "&, & *": {
                        color: colors.orange[isDark ? 50 : 900],
                      },
                    }
                  : chipStyles),
              }}
              label={data.CoachData.streakCount}
              icon={
                <Icon sx={{ color: "inherit!important" }}>
                  local_fire_department
                </Icon>
              }
            />
          </Tooltip>
        )}
        {profile &&
          profile.badges.map((badge) => (
            <Chip
              sx={chipStyles}
              label={badge}
              key={badge}
              {...(badge === "Early supporter" && {
                icon: <Icon>favorite</Icon>,
              })}
            />
          ))}
      </Box>
      <Typography
        variant="body2"
        sx={{
          gap: 1,
          display: "flex",
          mb: 2,
          mt: 1,
          opacity: 0.7,
          color: palette[9],
        }}
      >
        <Followers styles={styles} data={data} />
        <Following styles={styles} data={data} />
      </Typography>
      <Box sx={{ mr: -2 }}>
        <Masonry sx={{ mt: 3 }} columns={{ xs: 1, sm: 2, md: 3 }} spacing={2}>
          {profile && profile.hobbies.length > 0 && (
            <Box sx={profileCardStyles}>
              <Typography sx={profileCardStyles.heading}>Hobbies</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {profile &&
                  profile.hobbies.map((badge) => (
                    <Chip
                      sx={{ ...chipStyles, textTransform: "capitalize" }}
                      label={badge}
                      size="small"
                      key={badge}
                    />
                  ))}
              </Box>
            </Box>
          )}
          {profile && (
            <WorkingHours
              editMode={false}
              color={data.color}
              isCurrentUser={isCurrentUser}
              mutationUrl={mutationUrl}
              profile={profile}
              profileCardStyles={profileCardStyles}
            />
          )}
          <Box sx={profileCardStyles}>
            <Typography sx={profileCardStyles.heading}>Birthday</Typography>
            <>
              <Typography
                variant="h5"
                sx={{
                  mt: 0.5,
                  color: palette[12],
                }}
              >
                {dayjs(profile.birthday).format("MMMM D")}
              </Typography>
              <Typography sx={{ color: palette[11] }}>
                In {daysUntilNextBirthday} days
              </Typography>
            </>
          </Box>

          {profile.bio && (
            <Box sx={profileCardStyles}>
              <Typography sx={profileCardStyles.heading}>About</Typography>
              {profile && profile.bio && (
                <Typography sx={{ fontSize: "17px" }}>
                  <Twemoji>{profile?.bio || ""}</Twemoji>
                </Typography>
              )}
            </Box>
          )}

          {profile.spotify && (
            <SpotifyCard styles={profileCardStyles} profile={profile} />
          )}

          {data.Status && (
            <Box sx={profileCardStyles}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  width: 70,
                  height: 70,
                  background: palette[2],
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2">{dayjs().format("MMM")}</Typography>
                <Typography variant="h5">{dayjs().format("D")}</Typography>
              </Box>
              <Box sx={{ mt: 5 }} />
              <Typography sx={profileCardStyles.heading}>Right now</Typography>
              <Typography variant="h4">
                {capitalizeFirstLetter(data.Status.status)}
              </Typography>
              <LinearProgress
                variant="determinate"
                sx={{
                  my: 1,
                  height: 10,
                  borderRadius: 99,
                }}
                value={
                  (dayjs().diff(data.Status.started, "minute") /
                    dayjs(data.Status.until).diff(
                      data.Status.started,
                      "minute"
                    )) *
                  100
                }
              />
              <Typography variant="body2">
                Until {dayjs(data.Status.until).format("h:mm A")}
              </Typography>
            </Box>
          )}
        </Masonry>
      </Box>
    </Box>
  );
}
