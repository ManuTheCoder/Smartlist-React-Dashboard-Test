import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import React from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

/**
 * Component for a room card
 * @param {string} data - Room data, including name and ID
 */
function Room({ data }) {
  const [deleted, setDeleted] = React.useState<boolean>(false);
  return deleted ? null : (
    <ListItem
      sx={{
        background: "rgba(0,0,0,0.05)",
        mb: 2,
        borderRadius: 5,
        p: 3,
        px: 4,
      }}
    >
      <ListItemText
        primary={data.name}
        secondary={
          <Button
            onClick={() => {
              if (
                confirm(
                  "Delete this room including the items in it? This action is irreversible."
                )
              ) {
                setDeleted(true);
                fetch(
                  `/api/rooms/delete?${new URLSearchParams({
                    id: data.id,
                    property: global.property.propertyId,
                    accessToken: global.property.accessToken,
                  }).toString()}`,
                  {
                    method: "POST",
                  }
                )
                  .then(() => toast.success("Room deleted!"))
                  .catch(() => {
                    toast.error("Failed to delete room");
                    setDeleted(false);
                  });
              }
            }}
            sx={{ mt: 1, borderWidth: "2px!important", borderRadius: 3 }}
            variant="outlined"
          >
            Delete
          </Button>
        }
      />
    </ListItem>
  );
}
/**
 * Top-level component for the room settings page.
 */
export default function Rooms() {
  const url = `/api/property/rooms?${new URLSearchParams({
    property: global.property.propertyId,
    accessToken: global.property.accessToken,
  }).toString()}`;
  const { error, data }: any = useSWR(url, () =>
    fetch(url, {
      method: "POST",
    }).then((res) => res.json())
  );
  if (error) {
    return <>An error occured while trying to fetch your rooms. </>;
  }

  return (
    <Box
      sx={{
        p: 4,
      }}
    >
      <ListItem
        sx={{
          background: "rgba(0,0,0,0.05)",
          mb: 2,
          borderRadius: 5,
          p: 3,
          px: 4,
        }}
      >
        <ListItemText
          primary={
            <Button
              onClick={() => {
                document.getElementById("setCreateRoomModalOpen")?.click();
              }}
              sx={{ mt: 1, borderWidth: "2px!important", borderRadius: 3 }}
              variant="outlined"
            >
              Create room
            </Button>
          }
        />
      </ListItem>
      {data ? (
        <>
          {data.data.map((room: any, key: number) => (
            <Room data={room} key={key.toString()} />
          ))}
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            mt: -5,
            justifyContent: "center",
            height: "100%",
            alignItems: "center",
            px: 10,
          }}
        >
          Loading...
        </Box>
      )}
    </Box>
  );
}
