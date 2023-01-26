import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  ListItem,
  ListItemText,
  Switch,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { fetchApiWithoutHook, useApi } from "../../hooks/useApi";
import { ConfirmationModal } from "../ConfirmationModal";
import { ErrorHandler } from "../Error";
import { updateSettings } from "./updateSettings";

const base64ToUint8Array = (base64) => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(b64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
/**
 * Top-level component for the notification settings page.
 */
export default function Notifications() {
  const { data, url, error } = useApi("user/notificationSettings");

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      // run only in browser
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (
            sub &&
            !(
              (sub as any).expirationTime &&
              Date.now() > (sub as any).expirationTime - 5 * 60 * 1000
            )
          ) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        });
        setRegistration(reg);
      });
    }
  }, []);

  const subscribeButtonOnClick = async (event) => {
    event.preventDefault();
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(
        process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
      ),
    });
    setSubscription(sub);
    setIsSubscribed(true);
    updateSettings("notificationSubscription", JSON.stringify(sub));
    console.log("web push subscribed!");
  };

  const unsubscribeButtonOnClick = async (event) => {
    event.preventDefault();
    await subscription.unsubscribe();
    updateSettings("notificationSubscription", "");
    setSubscription(null);
    setIsSubscribed(false);
    console.log("web push unsubscribed!");
  };

  const sendNotificationButtonOnClick = async (event) => {
    event.preventDefault();
    if (subscription === null) {
      console.error("web push not subscribed");
      return;
    }

    fetch("/api/notification", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        subscription,
      }),
    });
  };

  const isInPwa = useMediaQuery(
    "(display-mode: standalone), (display-mode: window-controls-overlay)"
  );

  const handleNotificationChange = async (name, value) => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        await fetchApiWithoutHook("user/handleNotificationChange", {
          name: name,
          value: value,
        });
        await mutate(url);
        resolve("");
      } catch (error: any) {
        reject(error.message);
      }
    });

    toast.promise(promise, {
      loading: "Saving...",
      success: "Saved!",
      error: "Failed to save",
    });
  };

  const enabledOnAnotherDevice =
    !isSubscribed && global.user.notificationSubscription;

  return isInPwa || process.env.NODE_ENV !== "production" ? (
    data ? (
      <Box sx={{ mb: 2 }}>
        <Alert
          severity="warning"
          variant="filled"
          sx={{ borderRadius: 4, mb: 1 }}
        >
          Notifications is still in beta, and you might encounter bugs. We
          recommend you to turn this on later, but if you are curious - feel
          free to try it out at your own risk!
        </Alert>
        <ListItem>
          <ListItemText
            primary="Enable notifications"
            secondary={
              <>
                <span
                  style={{
                    display: "block",
                  }}
                >
                  Receive push notifications on one device
                </span>
                <Button
                  onClick={sendNotificationButtonOnClick}
                  disabled={!isSubscribed}
                  variant="outlined"
                  size="small"
                  sx={{
                    mt: 1,
                    boxShadow: 0,
                  }}
                >
                  Send test notification
                </Button>
              </>
            }
          />
          <button
            style={{ display: "none" }}
            id="enable-notifications"
            onClick={(event) => subscribeButtonOnClick(event)}
          ></button>
          {enabledOnAnotherDevice ? (
            <>
              <ConfirmationModal
                title="Recieve notifications on this device?"
                question="If you've enabled notifications on another device, enabling them here will disable them on the other device."
                callback={() =>
                  document.getElementById("enable-notifications")?.click()
                }
              >
                <Button variant="contained">Enable</Button>
              </ConfirmationModal>
            </>
          ) : (
            <Switch
              checked={isSubscribed}
              disabled={enabledOnAnotherDevice}
              onClick={(event) => {
                if (isSubscribed) {
                  unsubscribeButtonOnClick(event);
                } else {
                  subscribeButtonOnClick(event);
                }
              }}
            />
          )}
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText
            primary="To-do list updates"
            secondary="Recieve notifiations when you set "
          />
          <Switch
            checked={data.todoListUpdates}
            onClick={(e: any) =>
              handleNotificationChange("todoListUpdates", e.target.checked)
            }
          />
        </ListItem>

        <ListItem>
          <ListItemText
            primary="Daily Coach reminders"
            secondary="Get a nudge to complete your daily routine every day"
          />
          <Switch
            checked={data.dailyRoutineNudge}
            onClick={(e: any) =>
              handleNotificationChange("dailyRoutineNudge", e.target.checked)
            }
          />
        </ListItem>

        <ListItem>
          <ListItemText
            primary="Account activity"
            secondary="Recieve a notification when suspicious or new activity is detected on your account. You cannot change this setting."
          />
          <Switch disabled checked />
        </ListItem>

        <ListItem>
          <ListItemText
            primary="Low item count reminders (COMING SOON)"
            secondary="Recieve a notification when you have less than 5 items in your inventory"
          />
          <Switch
            disabled
            checked={false}
            onClick={(e: any) =>
              handleNotificationChange("lowItemCount", e.target.checked)
            }
          />
        </ListItem>
      </Box>
    ) : error ? (
      <ErrorHandler error="An error occured while trying to fetch your notification settings" />
    ) : (
      <CircularProgress />
    )
  ) : (
    <Box
      sx={{ p: 3, borderRadius: 5, background: "rgba(200,200,200,.3)", mb: 5 }}
    >
      Use the Dysperse PWA to enable notifications for Android, Desktop, and
      Chrome OS
      <Button
        fullWidth
        variant="contained"
        href="//my.dysperse.com"
        target="_blank"
        sx={{
          mt: 2,
          borderRadius: 9999,
        }}
      >
        Open
      </Button>
      <Button
        fullWidth
        href="//my.dysperse.com"
        target="_blank"
        size="small"
        sx={{
          mt: 1,
          borderRadius: 9999,
        }}
      >
        Don&apos;t have the app? Install now
      </Button>
    </Box>
  );
}
