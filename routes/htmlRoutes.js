//creates the  home page for the Progessive web application
const path = require("path");

function webPath(app){
    app.get("*", function(req, res){
        res.sendFile(path.join(__dirname, "../public/index.html"));
    });
};

module.exports = webPath;