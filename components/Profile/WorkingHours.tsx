import { fetchRawApi } from "@/lib/client/useApi";
import { useSession } from "@/lib/client/useSession";
import {
  Box,
  FormControl,
  Icon,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { mutate } from "swr";

export function WorkingHours({
  isCurrentUser,
  editMode,
  mutationUrl,
  profileCardStyles,
  profile,
}) {
  const session = useSession();
  const [workingHours, setWorkingHours] = useState(
    JSON.parse(profile.workingHours || "[]")
  );

  const handleChange = (index, field, value) => {
    const updatedWorkingHours = [...workingHours];
    updatedWorkingHours[index][field] = value;
    setWorkingHours(updatedWorkingHours);
  };

  const [edited, setEdited] = useState(false);

  const handleSave = useCallback(async () => {
    const data = await fetchRawApi("user/profile/update", {
      email: session.user.email,
      workingHours: JSON.stringify(workingHours),
    });
    console.log(data);
    await mutate(mutationUrl);
  }, [workingHours, mutationUrl, session.user.email]);

  // Save
  useEffect(() => {
    if (edited && isCurrentUser) handleSave();
  }, [workingHours, handleSave, edited, isCurrentUser]);

  return (
    <Box
      sx={{
        ...profileCardStyles,
        ...(!editMode && workingHours.length == 0 && { display: "none" }),
        overflowX: "auto",
      }}
    >
      <Typography
        sx={{
          ...profileCardStyles.heading,
          display: "flex",
          alignItems: "center",
        }}
      >
        Working hours
        <IconButton
          sx={{ ml: "auto", ...(!editMode && { display: "none" }) }}
          onClick={() => {
            const updatedWorkingHours = [...workingHours];
            updatedWorkingHours.push({
              dayOfWeek: 1,
              startTime: 9,
              endTime: 17,
            });
            setWorkingHours(updatedWorkingHours);
            setEdited(true);
          }}
          disabled={workingHours.length === 7}
        >
          <Icon>add</Icon>
        </IconButton>
      </Typography>
      {workingHours.map((hour, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 1,
            color: `hsl(240,11%,${session.user.darkMode ? 80 : 20}%)`,
            gap: 2,
            minWidth: editMode ? "470px" : "auto",
          }}
        >
          {!editMode ? (
            <b>
              {
                [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ][hour.dayOfWeek]
              }
            </b>
          ) : (
            <FormControl fullWidth variant="standard">
              {editMode && <InputLabel>Day</InputLabel>}
              <Select
                value={hour.dayOfWeek}
                size="small"
                {...(!editMode && {
                  inputProps: { IconComponent: () => null },
                })}
                onChange={(e) => {
                  setEdited(true);
                  handleChange(index, "dayOfWeek", e.target.value);
                }}
              >
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day, i) => (
                  <MenuItem value={i} key={i}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {!editMode && (
            <Typography sx={{ color: `hsl(240,11%,50%)` }}>from</Typography>
          )}
          {!editMode ? (
            <b>
              {((hour.startTime + 1) % 12 || 12) +
                (hour.startTime + 1 >= 12 ? " PM" : " AM")}
            </b>
          ) : (
            <FormControl fullWidth variant="standard">
              {editMode && <InputLabel>Start Time</InputLabel>}
              <Select
                value={hour.startTime}
                label="Start time"
                {...(!editMode && {
                  inputProps: { IconComponent: () => null },
                })}
                size="small"
                onChange={(e) => {
                  setEdited(true);
                  handleChange(index, "startTime", e.target.value);
                }}
                readOnly={!editMode}
                disabled={!editMode}
              >
                {[...new Array(23)].map((_, i) => (
                  <MenuItem key={i} value={i}>{`${i + 1}:00`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {!editMode && (
            <Typography sx={{ color: `hsl(240,11%,50%)` }}>to</Typography>
          )}
          {!editMode ? (
            <b>
              {((hour.endTime + 1) % 12 || 12) +
                (hour.endTime + 1 >= 12 ? " PM" : " AM")}
            </b>
          ) : (
            <FormControl fullWidth variant="standard">
              {editMode && <InputLabel>End Time</InputLabel>}
              <Select
                label="End time"
                size="small"
                {...(!editMode && {
                  inputProps: { IconComponent: () => null },
                })}
                onChange={(e) => {
                  setEdited(true);
                  handleChange(index, "endTime", e.target.value);
                }}
                readOnly={!editMode}
                disabled={!editMode}
                value={hour.endTime}
              >
                {[...new Array(23)].map((_, i) => (
                  <MenuItem key={i} value={i}>{`${i + 1}:00`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {editMode && (
            <IconButton
              onClick={() => {
                setEdited(true);
                const updatedWorkingHours = [...workingHours];
                updatedWorkingHours.splice(index, 1);
                setWorkingHours(updatedWorkingHours);
              }}
            >
              <Icon>delete</Icon>
            </IconButton>
          )}
        </Box>
      ))}
    </Box>
  );
}
