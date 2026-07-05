require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const restaurantsRouter = require("./routes/restaurants");
const driversRouter = require("./routes/drivers");
const makeOrdersRouter = require("./routes/orders");

const PORT = process.env.PORT || 4000;
const ADMIN_KEY = process.env.ADMIN_KEY || "changeMwenTanpri123";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("join-admin", (key) => {
    if (key === ADMIN_KEY) socket.join("admin");
  });
  socket.on("join-order", (orderId) => {
    socket.join(`order:${orderId}`);
  });
});

app.use("/api/restaurants", restaurantsRouter);
app.use("/api/drivers", driversRouter);
app.use("/api/orders", makeOrdersRouter(io));

app.use("/api/admin", (req, res, next) => {
  if (req.header("x-admin-key") !== ADMIN_KEY) {
    return res.status(401).json({ error: "Kle admin envalid" });
  }
  next();
});

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

server.listen(PORT, () => {
  console.log(`✅ STEVE FOOD backend ap kouri sou pò ${PORT}`);
  console.log(`   Admin dashboard: http://localhost:${PORT}/admin.html`);
});
