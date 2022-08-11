// namespace, to keep funcs together
const App = {
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
App.setPlayer = function (player) {
  App.player = player;
};

App.drawPlayer = function (coords, color) {
  const canvas = document.getElementById(App.config.canvasId);
  const context = canvas.getContext("2d");

  context.beginPath();
  context.arc(coords.x, coords.y, App.config.radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
  context.closePath();
};

App.redrawFromState = function (state) {
  App.clear();

  App.drawPuck(state.puck);
  // TODO: draw players on positions
  // state.players.forEach(player => {
  //   App.drawPlayer(player.coords, player.color);
  // })
};

App.drawPuck = function (coords) {
  const canvas = document.getElementById("game-canvas");
  const context = canvas.getContext("2d");
  const centerX = coords.x;
  const centerY = coords.y;
  const radius = 20;

  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle = "red";
  context.fill();
  context.closePath();
};

App.clear = function () {
  const canvas = document.getElementById("game-canvas");
  const context = canvas.getContext("2d");
  context.clearRect(
    0,
    0,
    App.config.canvasSize.width,
    App.config.canvasSize.height
  );
};

// SOCKET COMMUNICATION
App.socket = io.connect("http://localhost:8000"); // NOTE: hardcoded PORT (needs to change)
App.socket.on("stateUpdate", App.redrawFromState);
App.socket.on("setPlayer", App.setPlayer);
