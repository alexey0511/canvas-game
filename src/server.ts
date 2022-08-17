/* eslint-disable no-param-reassign */
import express, { Application } from 'express';
import { Server } from 'socket.io';

// TYPES
export type Coords = {
  x: number;
  y: number;
};

export type Puck = {
  pos: Coords;
  speed: Coords;
};

export type Player = {
  id: string;
  name: string;
  color: string;
  coords: Coords;
  force: Coords;
};

export type State = {
  puck: Puck;
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
  INITIAL_PUCK_SPEED: 1,
  SPEED_SLOWING_RATE: 0.01,
};

const { CANVAS_HEIGHT, CANVAS_WIDTH, RADIUS } = config;
const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// ROUTING
app.use('/resources', express.static(`${__dirname}/public`));
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/canvas.html`);
});

// THE APP
let state: State = {
  puck: {
    pos: {
      x: CANVAS_WIDTH / 2, // start in the middle
      y: CANVAS_HEIGHT / 2,
    },
    speed: {
      x: config.INITIAL_PUCK_SPEED,
      y: config.INITIAL_PUCK_SPEED,
    },
  },
  players: [],
};

function updatePuckPosition(puck: Puck, players: Player[]) {
  // TODO: might need more complicated formula for slowing down
  if (puck.speed.x !== 0) {
    puck.speed.x =
      puck.speed.x > 0
        ? puck.speed.x - config.SPEED_SLOWING_RATE
        : puck.speed.x + config.SPEED_SLOWING_RATE;
  }

  const { y } = puck.speed;
  if (puck.speed.y !== 0) {
    puck.speed.y = y > 0 ? y - config.SPEED_SLOWING_RATE : y + config.SPEED_SLOWING_RATE;
  }

  // detect collision
  // TODO: might need more complicated formula for reflection

  // walls
  if (puck.pos.x > CANVAS_WIDTH - RADIUS || puck.pos.x < RADIUS) {
    puck.speed.x = -puck.speed.x;
  }
  if (puck.pos.y > CANVAS_HEIGHT - RADIUS || puck.pos.y < RADIUS) {
    puck.speed.y = -puck.speed.y;
  }

  // players
  players.forEach((player) => {
    if (
      Math.abs(puck.pos.x - player.coords.x) < 2 * RADIUS &&
      Math.abs(puck.pos.y - player.coords.y) < 2 * RADIUS
    ) {
      // on colusion with player, make puck move
      // restart speed
      // TODO: might need to base it on force applied
      if (player.force.x) {
        puck.speed.x = player.force.x;
        player.force.x = 0; // reset after contact with puck
      }
      if (player.force?.y) {
        puck.speed.y = player.force.y;
        player.force.y = 0; // reset after contact with puck
      }
      // // bounce (reflect) the ball
      if (puck.pos.x < player.coords.x) {
        puck.speed.x = -puck.speed.x;
      }
      if (puck.pos.y < player.coords.y) {
        puck.speed.y = -puck.speed.y;
      }
    }
  });

  return {
    x: puck.pos.x + puck.speed.x,
    y: puck.pos.y + puck.speed.y,
  };
}

function makePlayer(playerId: string, playersNum: number) {
  return {
    id: playerId,
    name: `Player ${playersNum}`,
    color: 'green',
    coords: { x: playersNum * 10, y: playersNum * 20 },
    force: { x: 0, y: 0 },
  };
}

// SOCKET COMMUNICATIONS
const io = new Server(server);

io.sockets.on('connection', (socket) => {
  const newPlayer = makePlayer(socket.id, state.players.length);
  state.players.push(newPlayer);

  socket.emit('setPlayer', {
    name: newPlayer.name,
  });

  setInterval(() => {
    state = {
      ...state,
      puck: {
        ...state.puck,
        pos: updatePuckPosition(state.puck, state.players),
      },
    };
    socket.emit('stateUpdate', state);
  }, config.REFRESH_RATE);

  socket.on('playerMove', (data: any) => {
    state.players.forEach((player) => {
      if (player.id === data.id) {
        player.force = {
          x: player.coords.x - data.position.x,
          y: player.coords.y - data.position.y,
        };
        player.coords = data.position;
      }
    });
  });

  socket.on('disconnect', () => {
    state.players = state.players.filter((p) => p.id !== socket.id);
  });
});
