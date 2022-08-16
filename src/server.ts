import express, { Application } from "express";
import { Server } from "socket.io";

// TYPES
export type Coords = {
  x: number;
  y: number;
};

export type Player = {
  id: string;
  name: string;
  color: string;
  coords: Coords;
};

export type State = {
  puck: Coords;
  players: Player[];
};

// App
const app: Application = express();
const PORT = process.env.PORT || 8000;

const config = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 400,
  RADIUS: 20,
  REFRESH_RATE: 16, // ~60fps...
};

const INITIAL_SPEED = 1;
let speedSlowing = 0.01;
let speedX = INITIAL_SPEED;
let speedY = INITIAL_SPEED;

const { CANVAS_HEIGHT, CANVAS_WIDTH, RADIUS } = config;
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});

// ROUTING
app.use("/resources", express.static(__dirname + "/public"));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/canvas.html");
});

// THE APP

let state: State = {
  puck: {
    x: CANVAS_WIDTH / 2, // start in the middle
    y: CANVAS_HEIGHT / 2,
  },
  players: [],
};

function updatePuckPosition(puck: Coords, players: Player[]) {
  if (speedX !== 0) {
    speedX = speedX > 0 ? speedX - speedSlowing : speedX + speedSlowing;
  }

  if (speedY !== 0) {
    speedY = speedY > 0 ? speedY - speedSlowing : speedY + speedSlowing;
  }

  // detect collision
  // walls
  // TODO: might need more complicated reflection
  if (puck.x > CANVAS_WIDTH - RADIUS || puck.x < RADIUS) speedX = -speedX;
  if (puck.y > CANVAS_HEIGHT - RADIUS || puck.y < RADIUS) speedY = -speedY;

  // players
  players.forEach((p) => {
    if (
      Math.abs(puck.x - p.coords.x) < 2 * RADIUS &&
      Math.abs(puck.y - p.coords.y) < 2 * RADIUS
    ) {
      // restart speed
      // TODO: might need to base it on force applied

      // reset speed
      speedX = INITIAL_SPEED;
      speedY = INITIAL_SPEED;

      // bounce (reflect) the ball
      if (puck.x < p.coords.x) {
        speedX = -speedX;
      }

      if (puck.y < p.coords.y) {
        speedY = -speedY;
      }
    }
  });

  return {
    x: puck.x + speedX,
    y: puck.y + speedY,
  };
}

function makePlayer(playerId: string, playersNum: number) {
  return {
    id: playerId,
    name: `Player ${playersNum}`,
    color: "green",
    coords: { x: playersNum * 10, y: playersNum * 20 },
  };
}

// SOCKET COMMUNICATIONS
const io = new Server(server);

io.sockets.on("connection", function (socket) {
  const player = makePlayer(socket.id, state.players.length);
  state.players.push(player);

  socket.emit("setPlayer", {
    name: player.name,
  });

  setInterval(() => {
    state = {
      ...state,
      puck: updatePuckPosition(state.puck, state.players),
    };
    socket.emit("stateUpdate", state);
  }, config.REFRESH_RATE);

  socket.on("playerMove", (data: any) => {
    state.players.forEach((player) => {
      if (player.id === data.id) {
        player.coords = data.position;
      }
    });
  });

  socket.on("disconnect", (reason) => {
    state.players = state.players.filter((p) => p.id !== socket.id);
  });
});
