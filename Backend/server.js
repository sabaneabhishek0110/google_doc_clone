//backend code 

const express = require('express');
const http = require('http');
const Socket = require('socket.io');
const Document = require('./Model/Document');
const mongoose = require('mongoose');
const cors = require("cors");


const app = express();
app.use(cors({ origin: "http://localhost:5173" }));


mongoose.connect("mongodb://localhost:27017/googleDocClone").then(()=>{
    console.log("connected to MongoDB");
}).catch((error)=>{
    console.log("Error in connecting to MongoDB",error);
})

const server = http.createServer(app);

server.listen(5000,()=>{
    console.log("Sever is running on Port no 5000....");
})

const io = require("socket.io")(server,{
    cors : {
        origin : "http://localhost:5173",
        methods : ['GET','POST'],
    }
})

io.on('connection',(socket)=>{
    console.log("User is connected using id : "+socket.id);

    socket.on('get-document', async (documentId) =>{
        const document = await findOrCreate(documentId);
        socket.join(documentId);
        
        socket.emit('load-content',document.data);

        socket.on('send-changes',(data)=>{
            socket.broadcast.to(documentId).emit('receive-changes',data);
        })

        socket.on('save-document',async (data)=>{
            await Document.findByIdAndUpdate(documentId,{data}); 
        })
    })

    
    socket.on('disconnect',()=>{
        console.log("User Disconnected : "+socket.id);
    })
})

const findOrCreate = async(id) =>{
    if(!id) return;
    const document = await Document.findById(id);
    if(document) return document;

    const newDocument = new Document({
        _id : id,
        data : ""
    })

    await newDocument.save();
    return newDocument;
}