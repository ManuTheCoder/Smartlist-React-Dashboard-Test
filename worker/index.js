"use strict";

self.__WB_DISABLE_DEV_LOGS = true;

self.addEventListener("message", function (event) {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});

self.addEventListener("push", (event) => {
  const data = event.data && JSON.parse(event.data.text());
  const title = data?.title || "You have a new notification • Carbon";
  const body = data?.body || "Tap to open";
  const icon = data?.icon || "https://assets.dysperse.com/v7/ios/192.png";

  const tag = `dysperse-notification-${new Date().getTime()}`;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag,
      icon,
      vibrate: [200, 100, 200],
      badge: "https://assets.dysperse.com/v6/20230123_114910_0000.png",
      actions: JSON.parse(event?.data?.text() ?? "{}").actions ?? [],
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  let path = "/";

  switch (event.action) {
    case "startDailyRoutine":
      path = "/coach#daily-routine";
      break;
    default:
      const regex = /^routine-(\d+)$/;
      const match = event.action.match(regex);
      if (match) {
        path = `/#/routine-${match[1]}`;
      }

      if (event.action.match(/^dailyCheckIn-(\d+)$/)) {
        path = `/#/dailyCheckIn-${match[1]}`;
      }
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
            }
          }
          return client.focus();
        }
        return clients.openWindow(path);
      })
  );
});

self.addEventListener("pushsubscriptionchange", function (event) {
  event.waitUntil(
    Promise.all([
      Promise.resolve(
        event.oldSubscription ? deleteSubscription(event.oldSubscription) : true
      ),
      Promise.resolve(
        event.newSubscription
          ? event.newSubscription
          : subscribePush(registration)
      ).then(function (sub) {
        return saveSubscription(sub);
      }),
    ])
  );
});
