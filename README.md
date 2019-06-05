# Personal Website ![v2.0.0](https://img.shields.io/badge/version-v2.0.0-blue.svg)
This is the second version of my personal website. I wrote a few [gulp](https://gulpjs.com/) tasks to let me easily generate a production build as well as deploy to my web server.

## Quick Start
1. Install dependencies

    ```
    npm install
    ```
2. Start the development task

    ```
    npm start
    ```

## Building for production
A production build can be generated for deployment:
```
npm run build
```

## Deploying to a web server
The production build can be deployed to a web server using rsync:
```
npm run deploy
```
