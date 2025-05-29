# Install React-firestrap for dev
- Create new folder react-firestrap
- Clone repository react-firestrap in folder react-firestrap
- npm install
- npm run build:local
- npm link

# Create new project
- Create new folder, the name of the folder is project 
- Put the package.json inside the project foldername
- npm install
- delete folder in node_modules/react-firestrap
- npm link react-firestrap

# Scaffold new project
- npx react-firestrap setup
- follow the instructions

# Reinstall project after scaffold
- go in react-firestrap folder
- npm run build:local
- go in project folder
- Copy .env project file out of the project folder
- npx react-firestrap setup --reset
- Copy .env file back to project folder

# Create new theme
- Clean all project folder except package.json, package-lock.json, node_modules
- Create src and public folders
- Create theme
- npm start

# Porting theme
- Inside of react-firestrap create in themes/[theme-name]
- Copy inside [theme-name] src and public folders of new theme project


```json
{
  "name": "[theme-name]",
  "type": "module",
  "version": "1.0.0",
  "description": "",
  "author": "[author]",
  "license": "Apache-2.0",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-papaparse": "^4",
    "react-firestrap": "^1.2.9",
    "react-router-dom": "^6.22.0",
    "react-scripts": "^5"
  },
  "devDependencies": {
    "@babel/plugin-proposal-private-property-in-object": "^7.21.0"
  },
  "eslintConfig": {
    "extends": "react-app"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```


# Deploy React Firestrap
- go in folder react-firestrap
- npm run build:local


# Kill process by port 3000
netstat -aon | findstr :3000
taskkill /PID [pid_number] /F
