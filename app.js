const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();

const server = http.createServer(app); // http k server ko express k server s link kra dia with the help of socket
const io = socket(server); //socket jo kr skta vo io q ki usne sb io p dal dia

const chess = new Chess();
let players = {};
let currentPlayer = "W";

app.set('view engine', 'ejs'); //middleware
app.use(express.static(path.join(__dirname, "public"))); // img js use kr paege

app.get("/", (req, res)=> {
    res.render("index", { title: "Chess Game"}); //pahla page render kar ke dega
});

io.on("connection", function(uniquesocket){
    console.log("connected");

    if (!players.white) {
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
    } else if (!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    } else {
        uniquesocket.emit("spectatorRole");
    }

    uniquesocket.on("disconnect", function(){
        if(uniquesocket.id === players.white){
            delete players.white;
        } else if (uniquesocket.id === players.black){
            delete players.black;
        }
    });

    uniquesocket.on("move", (move)=>{
        try{
            if(chess.turn() === 'w' && uniquesocket.id !== players.white) return;
            if(chess.turn() === 'b' && uniquesocket.id !== players.black) return;
            const result = chess.move(move);
            if(result){
                currentPlayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen());
            } else {
                console.log("invalid move : ", move);
                uniquesocket.emit("invalidMove" ,move);
            }
         } catch(err){
            console.log(err);
            uniquesocket.emit("invalid move : ", move);

        }
    });
});



server.listen(3000);
    
