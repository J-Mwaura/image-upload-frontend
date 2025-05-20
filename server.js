//Install express server
const express = require('express');
const path = require('path');
const app = express();

// Serve only the static files form the dist directory
app.use(express.static('./dist/ecommerceApp'));

app.get('/*', (req, res) =>
    res.sendFile('index.html', {root: 'dist/ecommerceApp'}),
);

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 5000, function(err){if (err) console.log("Error in server setup")
console.log("Server listening on Port", process.env.PORT);
});