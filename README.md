# Canvas multiplayer

## About

This is an try out of server / client communication over sockets.

## Game

The idea is that multiple people can join and interact a puck
How game works, scrorring and etc are still to be developed

## Development

### Quick Start

```
npm ci
npm start
```

The code above starts app in the dev mode.
It runs on http://localhost:8000 by default, but can be modified
There are 2 processes running: 
  - nodeJS - to watch any changes on the server
  - typescript watch - to watch client changes

### Code formatting
We are using [prettier](https://prettier.io/) to format the code.
Code that you're committing should be formatted

to format the code run the snippet below

```
npm run format
```

### Code styling
We are using ESLint for code styling.
It's based on [Airbnb styleguide](https://github.com/airbnb/javascript)

Please run commands below to identify or fix any styling issues

```
npm run eslint:fix
```

### Testing
[TODO]

## Production
[TODO]
currently there are no scripts for building for production.
It can be done manually when you know what you're doing

## Contribution
Feel free to contribute and extend the game.
You can create an issue with proposed functionality

## Extensions
- [ ] implement better collision detection and reflection
- [ ] implement different colors for different users
- [ ] implement points system

![Game video](./game.gif)
