import express, { Application } from "express";
import { Server } from "socket.io";

// TYPES
export type Coords = {
  x: number;
  y: number;
};

export type Player = {
  name: string;
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
};

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
    x: 25,
    y: 25,
  },
  players: [],
};

let moveX = 1;
let moveY = 1;

function updatePuckPosition(
  puck: Coords,
  field: { height: number; width: number },
  players: Player[]
) {
  // detect collision
  if (puck.x > CANVAS_WIDTH - RADIUS || puck.x < RADIUS) moveX = -moveX;
  if (puck.y > CANVAS_HEIGHT - RADIUS || puck.y < RADIUS) moveY = -moveY;

  return {
    x: puck.x + moveX,
    y: puck.y + moveY,
  };
}
function makePlayer(playersNum: number) {
  return {
    name: `Player ${playersNum}`,
    coords: { x: 0, y: 0 },
  };
}

// SOCKET COMMUNICATIONS
const io = new Server(server);

io.sockets.on("connection", function (socket) {
  const player = makePlayer(state.players.length);
  state.players.push(player);

  socket.emit("setPlayer", { name: player.name });

  setInterval(() => {
    state = {
      ...state,
      puck: updatePuckPosition(
        state.puck,
        { height: config.CANVAS_HEIGHT, width: config.CANVAS_WIDTH },
        state.players
      ),
    };
    socket.emit("stateUpdate", state);
  }, 100);
});
