require("dotenv").config();

const redis = require("socket.io-redis");
const io = require("socket.io")(process.env.PORT);

const { verifyToken, decodeToken } = require("./services/jwt");

const Location = require("./model/location");
const Notification = require("./model/notification");

// Connect to database
require("./database/index")();

io.adapter(redis({ host: "localhost", port: 6379 }));

io.on("connect", client => {
  console.log(`${client.id} is connected!`);
  client.on("auth", userCreds => {
    // check if token is present
    if (!userCreds.token) {
      io.to(`${client.id}`).emit("auth", {
        status: "fail",
        message: "No token receive!"
      });
      io.sockets.connected[client.id].disconnect();
      console.log(`${client.id}: No token receive!`);
      return;
    }
    // check if token is valid
    if (!verifyToken(userCreds.token)) {
      io.to(`${client.id}`).emit("auth", {
        status: "fail",
        message: "Invalid token!"
      });
      io.sockets.connected[client.id].disconnect();
      console.log(`${client.id}: Invalid token!`);
      return;
    }

    const payload = decodeToken(userCreds.token);
    payload.session_id = client.id;
    client.credentials = payload;
    // check if admin
    if (payload.admin) {
      // admin
      io.to(`${client.id}`).emit("users", {
        status: "success",
        data: {
          users: checkUsersStatus(payload.id)
        }
      });
    } else {
      // client
      const { admin_id, id } = client.credentials;
      const session_id = getAdminSessionId(admin_id);
      // save new notification
      const newNotification = new Notification();
      newNotification.user_id = id;
      newNotification.admin_id = admin_id;
      newNotification.status = 1;
      newNotification.save();

      if (session_id) {
        io.to(`${session_id}`).emit("user", {
          id: credential.id,
          action: "connect"
        });
      }
    }
  });

  client.on("location", payload => {
    const data = JSON.parse(payload);
    const { admin_id, id } = client.credentials;
    if (client.credentials) {
      const session_id = getAdminSessionId(admin_id);
      // save new location
      const newLocation = new Location();
      newLocation.user_id = id;
      newLocation.admin_id = admin_id;
      newLocation.lat = data.lat;
      newLocation.lng = data.lng;
      newLocation.save();

      io.to(`${session_id}`).emit("location", {
        id: id,
        data: {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng)
        }
      });
    }
  });

  //disconnect
  client.on("disconnect", () => {
    console.log(`${client.id} got disconnect!`);
    if (client.credentials) {
      const { admin_id, id } = client.credentials;
      const session_id = getAdminSessionId(admin_id);
      // save new notification
      const newNotification = new Notification();
      newNotification.user_id = id;
      newNotification.admin_id = admin_id;
      newNotification.status = 0;
      newNotification.save();
      io.to(`${session_id}`).emit("user", {
        id: id,
        action: "disconnect"
      });
    }
  });
});

const getAuthenticatedClients = () => {
  const connectedClients = io.sockets.clients().connected;
  const sockets = Object.values(connectedClients);
  return sockets.filter(clients => typeof clients.credentials !== "undefined");
};

const checkUsersStatus = admin_id => {
  let loggedUsers = [];
  const clients = getAuthenticatedClients();
  clients.forEach(element => {
    if (typeof element !== "undefined") {
      if (element.admin_id) {
        if (element.admin_id == admin_id) {
          loggedUsers.push(element);
        }
      }
    }
  });
  return loggedUsers;
};

const getAdminSessionId = admin_id => {
  let session_id = "";
  const clients = getAuthenticatedClients();
  clients.forEach(element => {
    if (typeof element !== "undefined") {
      if (element.admin) {
        if (element.id == admin_id) {
          session_id = element.session_id;
        }
      }
    }
  });
  return session_id;
};
