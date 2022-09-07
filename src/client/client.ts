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
console.log('test');
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

type Puck = {
  pos: Coords;
  speed: Coords;
};

type State = {
  puck: Puck;
  players: Player[];
};

// namespace, to keep funcs together
const App: any = {
  config: {
    canvasId: 'game-canvas',
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
  const canvas = document.getElementById(App.config.canvasId) as HTMLCanvasElement;
  if (canvas) {
    const context = canvas.getContext('2d');

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

App.drawPuck = function (puck: Puck) {
  const canvas = document.getElementById(App.config.canvasId) as HTMLCanvasElement;
  if (canvas) {
    const context = canvas.getContext('2d');

    if (context) {
      context.beginPath();
      context.arc(puck.pos.x, puck.pos.y, App.config.radius, 0, 2 * Math.PI, false);
      context.fillStyle = 'red';
      context.fill();
      context.closePath();
    }
  }
};

App.clear = function () {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

  if (!canvas) return;
  const context = canvas.getContext('2d');

  if (!context) return;
  context.clearRect(0, 0, App.config.canvasSize.width, App.config.canvasSize.height);
};

let debounceTimeoutId: ReturnType<typeof setTimeout>;

document.getElementById('game-canvas')!.addEventListener('mousemove', function (e: MouseEvent) {
  clearTimeout(debounceTimeoutId);

  debounceTimeoutId = setTimeout(() => {
    App.socket.emit('playerMove', {
      id: App.socket.id,
      position: {
        x: e.pageX - this.offsetLeft,
        y: e.pageY - this.offsetTop,
      },
    });
  }, 16);
});

// SOCKET COMMUNICATION
// TODO: declare global io module or maybe just include as part of script
declare const io: any;

App.socket = io();
App.socket.on('stateUpdate', App.redrawFromState);
App.socket.on('setPlayer', App.setPlayer);
