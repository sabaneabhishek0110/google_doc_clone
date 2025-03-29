import React ,{useState,useEffect, useCallback}from "react"
import { useParams } from "react-router-dom/cjs/react-router-dom.min"
import Quill from 'quill';
import "quill/dist/quill.snow.css";
import {io} from 'socket.io-client';

export default function TextEditor (){
    const {id:documentId} = useParams();
    const [socket,setSocket] = useState(null);
    const [quill,setQuill] = useState(null);

    const SAVE_INTERVAL_MS = 2000;

    const TOOLBAR_OPTIONS = [
        [{header : [1,2,3,4,5,6,false]}],
        [{font : []}],
        [{list : "ordered"},{list : "bullet"}],
        ["bold","italic","underline"],
        [{color : []},{background : []}],
        [{script : "sub"},{script : "super"}],
        [{align : []}],
        ["image","blockquote","code-block"],
        ["clean"],
    ]

    useEffect(()=>{
        const s = io("http://localhost:5000",{
            transports: ["websocket", "polling"],
        });
        setSocket(s);
        return ()=>{
            s.disconnect();
        }
    },[])

    useEffect(()=>{
        if(!socket || !quill) return;
        socket.once('load-content',(document)=>{
            quill.setContents(document);
            quill.enable();
        })

        socket.emit('get-document',documentId);
    },[socket,quill,documentId]);

    useEffect(()=>{
        if(!socket || !quill) return;

        const handler = (data,oldData,source) =>{
            if(source !== "user") return;
            socket.emit('send-changes',data);
        }
        quill.on('text-change',handler);

        return () =>{
            quill.off('text-change',handler)
        }
    },[socket,quill]);

    useEffect(()=>{
        if(!socket || !quill) return;
        
        const handler = (data) =>{
            quill.updateContents(data);
        }
        socket.on('receive-changes',handler);

        return () =>{
            socket.off('receive-changes',handler)
        }
    },[socket,quill]);

    useEffect(()=>{
        if(!socket || !quill) return;

        const interval = setInterval(()=>{
            socket.emit('save-document',quill.getContents());
        },SAVE_INTERVAL_MS);

        return ()=>{
            clearInterval(interval);
        }
    },[socket,quill]);

    const wrapperRef = useCallback((wrapper)=>{
        if(!wrapper) return;
        wrapper.innerHTML="";  
        const editor = document.createElement('div');

        wrapper.append(editor);

        const q = new Quill(editor,{
            theme : 'snow',
            modules : {toolbar : TOOLBAR_OPTIONS},
        })
        
        // q.disable();
        q.setText("Loading...");
        setQuill(q);
    },[]);

    return(
        <div className="container" ref={wrapperRef}></div>
    )
}