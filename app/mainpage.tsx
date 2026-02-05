import {useState} from 'react'
import {useEffect} from 'react'
import {useRef} from 'react'
import { Link } from 'react-router';
type chatmessage={
    role:"user"|"assistant";
    content:string;

};
export default function Mainpage() {
    const [message,setMessage]=useState("")
    const [sec,setsec]=useState("")
    const [chathistory,setchathistory]=useState<chatmessage[]>([]);
    const [loading,setloading]=useState(false)
    const bottomref=useRef<HTMLDivElement| null>(null);
    useEffect(()=>{
        bottomref.current?.scrollIntoView({behavior:"smooth"});

    },[chathistory]);

    const handlesubmit=async()=>{
        if (!message.trim()) return;
        setsec(message)
        
        setchathistory((prev) => [...prev, { role: "user", content: message }]);

        const response= await fetch("https://backend-mcp-08gt.onrender.com/message",{
            method:'POST',
            headers:{
                'content-type':'application/json',
            },
            body:JSON.stringify({text:message}),
        });
        setMessage("")
        const data=await response.json();
    
        setchathistory((prev)=>[
            ...prev,
            {role:"assistant",content:data.text||"No Response"},
        ]

        );
        
        
    }

    return (
        <main className="min-h-screen w-full flex bg-pink-300 justify-center items-center">
            <Link to="/signup">
            <button className="
                h-14
                m-4
                px-5
                rounded-full
                bg-blue-600
                text-white
                hover:bg-blue-700
                shrink-0">
                Sign up
            </button>
            </Link>
            <button className="h-14
                px-5
                rounded-full
                bg-blue-600
                text-white
                hover:bg-blue-700
                shrink-0">
                Sign In
            </button>
            <div className="m-10 border-0 bg-white p-8 rounded w-full max-w-3xl shadow-lg flex flex-col">
                <h5 className="font-black text-black text-center w-full text-xl mb-4">
                        Customer Support
                </h5>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
            {chathistory.map((msg,idx)=>(
                <div
                key={idx}
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed break-words
            ${
                msg.role==="user"? "ml-auto bg-blue-600 text-white rounded-br-md":"mr-auto bg-gray-200 text-gray-900 rounded-bl-md"
                }`}
                
                >
                    {msg.content}
                    
                </div>
                
            )
                
            )}
            <div ref={bottomref}/>

        </div>
        <div className="flex items-center gap-2 w-full mt-4">
            <textarea
                value={message}
                placeholder="Send the message..."
                className="
                flex-1
                h-14
                resize-none
                overflow-y-auto
                rounded-full
                px-4
                py-4
                bg-black
                text-white
                focus:outline-none
                "
                onChange={(e)=>setMessage(e.target.value)}
            />

            <button
                className="
                h-14
                px-5
                rounded-full
                bg-blue-600
                text-white
                hover:bg-blue-700
                shrink-0
                " onClick={handlesubmit}>
                    Send
            </button>
        </div>
        </div>

    </main>
  );
}
