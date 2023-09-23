import { useSession } from "@/lib/client/session";
import { fetchRawApi } from "@/lib/client/useApi";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import { Avatar, Box, CircularProgress, Icon, IconButton } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export function ProfilePicture({
  mutate,
  data,
  editMode,
  size = 150,
}: {
  mutate: any;
  data: any;
  editMode?: boolean;
  size?: number;
}) {
  const { session } = useSession();
  const [photo, setPhoto] = useState(data?.Profile?.photo);
  const [imageUploading, setImageUploading] = useState(false);

  const handleUpload = useCallback(
    async (e: any) => {
      const key = "9fb5ded732b6b50da7aca563dbe66dec";
      const form = new FormData();
      form.append("image", e.target.files[0]);
      setImageUploading(true);

      try {
        const res = await fetch(
          `https://api.imgbb.com/1/upload?name=image&key=${key}`,
          { method: "POST", body: form }
        ).then((res) => res.json());

        setPhoto(res.data.thumb.url);
        await fetchRawApi(session, "user/profile/update", {
          email: session.user.email,
          picture: res.data.thumb.url,
        });
        await mutate();

        setImageUploading(false);
      } catch (e) {
        toast.error(
          "Yikes! An error occured while trying to upload your image. Please try again later"
        );
        setImageUploading(false);
      }
    },
    [setPhoto, mutate, session]
  );

  useEffect(() => setPhoto(data?.Profile?.picture), [data]);
  const isDark = useDarkMode(session.darkMode);

  const palette = useColor(data?.color || "gray", isDark);

  return (
    <Box
      sx={{
        position: "relative",
        height: size,
        width: size,
        borderRadius: 9999,
        alignSelf: { xs: "center", md: "flex-start" },
      }}
    >
      <Box
        sx={{
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(10px)",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 9999,
          display: "flex",
          justifyContent: "center",
          zIndex: 99,
          alignItems: "center",
          ...(editMode
            ? {
                opacity: 1,
                transition: "transform 0.2s ",
                transform: "scale(1)",
              }
            : {
                transform: "scale(.9)",
                transition: "all 0.2s",
                opacity: 0,
                pointerEvents: "none",
              }),
        }}
      >
        {imageUploading ? (
          <CircularProgress
            sx={{
              color: "#fff",
            }}
          />
        ) : (
          <IconButton
            onClick={() => document.getElementById("upload")?.click()}
            sx={{
              transform: "scale(1.5)",
            }}
          >
            <Icon sx={{ color: "#fff" }}>edit</Icon>
          </IconButton>
        )}
        <input
          type="file"
          id="upload"
          hidden
          onChange={handleUpload}
          accept="image/*"
        />
      </Box>
      <Avatar
        src={photo}
        sx={{
          height: size,
          width: size,
          fontSize: size == 150 ? 65 : 25,
          textTransform: "uppercase",
          background: `linear-gradient(${palette[8]} 30%, ${palette[7]})`,
          mb: 2,
        }}
      >
        {data.name.trim().charAt(0)}
        {data.name.split(" ")?.[1]?.charAt(0) || data.name.charAt(1)}
        <input type="file" id="upload" hidden onChange={handleUpload} />
      </Avatar>
    </Box>
  );
}
