# trail-viz
An attempt at visualizing the GPS/Elevation data from my watch, after over a year of workouts.
[See Demo](http://mikatalk.github.io/trail-viz/)

# Run
```bash
# Set Up
$ npm install

# Start Dev
$ npm start
```

# Build
```bash
# Production Ready Build
$ npm run build
```

# Parse Your Own CSV
Drop your CSV logs inside `csv-logs/`
```bash
$ npm run parse
```
![parse-cmd](https://github.com/mikatalk/trail-viz/blob/master/docs/parse-cmd.png)

Copy the the output from the command line 
edit the tools/parser.js as needed:
run parser again. 
```bash
$ npm run parse
```
You're all set to `npm start`!

