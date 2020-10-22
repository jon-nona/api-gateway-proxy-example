# Api Gateway Proxy :: Node Version <!-- omit in toc -->

The Node version for this project is automatically managed by:

- a `.node-version` file
- the `NVM` and `AVN` packages

## Setup

1. install [NVM](https://github.com/nvm-sh/nvm) (Node Version Manager)

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
   ```

2. install [AVN](https://github.com/wbyoung/avn) (Automatic Version Switching for Node.js)

   ```bash
   npm install -g avn avn-nvm avn-n
   avn setup
   ```

## Usage

Once you've gone through the `Setup` above, AVN will automatically switch to version of node specified in your project's `.node-version` file, whenever you cd into the project's root or open a new terminal window in the project's root.
