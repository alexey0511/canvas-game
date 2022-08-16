// NOTE:
// script is Work in Progress
// TODO: 
/**
 * NOTE: script is work in progress
 * 
 * TODO: 
 *  - tidy up layout
 *  - import types rather than hardcode
 *  - import or declare socket.io script
 *  - avoid using any
 */
type Coords = {
  x: number;
  y: number;
};

type Player = {
  id: string;
  name: string;
  color: string;
  coords: Coords;
};

type State = {
  puck: Coords;
  players: Player[];
};

// namespace, to keep funcs together
const App: any = {
  config: {
    canvasId: "game-canvas",
    canvasSize: {
      height: 400,
      width: 800,
    },
    puckSize: 20,
    radius: 20,
  },
};

// define client actions
App.setPlayer = function (player: Player) {
  App.player = player;
};

App.drawPlayer = function (coords: Coords, color: string) {
  const canvas = document.getElementById(
    App.config.canvasId
  ) as HTMLCanvasElement;
  if (canvas) {
    const context = canvas.getContext("2d");

    if (context) {
      context.beginPath();
      context.arc(coords.x, coords.y, App.config.radius, 0, 2 * Math.PI, false);
      context.fillStyle = color;
      context.fill();
      context.closePath();
    }
  }
};

App.redrawFromState = function (state: State) {
  App.clear();

  App.drawPuck(state.puck);
  // TODO: draw players on positions
  state.players.forEach((player) => {
    App.drawPlayer(player.coords, player.color);
  });
};

App.drawPuck = function ({ x, y }: Coords) {
  const canvas = document.getElementById(
    App.config.canvasId
  ) as HTMLCanvasElement;
  if (canvas) {
    const context = canvas.getContext("2d");

    if (context) {
      context.beginPath();
      context.arc(x, y, App.config.radius, 0, 2 * Math.PI, false);
      context.fillStyle = "red";
      context.fill();
      context.closePath();
    }
  }
};

App.clear = function () {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;

  if (!canvas) return;
  const context = canvas.getContext("2d");

  if (!context) return;
  context.clearRect(
    0,
    0,
    App.config.canvasSize.width,
    App.config.canvasSize.height
  );
};

document
  .getElementById("game-canvas")!
  .addEventListener("mousemove", function (e: MouseEvent) {
    App.socket.emit("playerMove", {
      id: App.socket.id,
      position: {
        x: e.pageX - this.offsetLeft,
        y: e.pageY - this.offsetTop,
      },
    });
  });

// SOCKET COMMUNICATION
// TODO: declare global io module or maybe just include as part of script
// @ts-expect-error need to register module
App.socket = io.connect("http://localhost:8000"); // NOTE: hardcoded PORT (needs to change)
App.socket.on("stateUpdate", App.redrawFromState);
App.socket.on("setPlayer", App.setPlayer);
