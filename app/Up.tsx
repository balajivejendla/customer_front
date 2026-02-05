import {io} from "socket.io-client"
import {useState} from 'react'
import {useActionState} from 'react'
import {actions} from './actions'



export default function Up(){
    const [name,setname]=useState("")
    const [pass,setpass]=useState("")
    //useActionState
    const [state,action,isPending]=useActionState(actions,undefined)
    const handleSubmit=async()=>{
        const socket=io("http://localhost:3000");

        socket.on('connect',()=>{
            console.log("connected",socket.id)
        })
            
        socket.emit('auth',name,pass)
    }

    return(
        <form action={action}>
        <div>
            <p>Enter the name</p>
            <input
            name="email"
            type="email"
            value={name}
            onChange={(e)=>setname(e.target.value)}
            placeholder="enter the name"
            required
            />

            <p>
                Enter the password
            </p>
            <input
            name="password"
            
            type="password"
            value={pass}
            onChange={(e)=>setpass(e.target.value)}
            placeholder="enter the password"
            minLength={8}
            required
            />

            <button  disabled={isPending} onClick={handleSubmit}>
                Submit
            </button>
            {/* //to print whether its error or not */}
            {state?.status=="error" && <span className="text-red-500">Email invalid</span>}
            {state?.status=="error1" && <span className="text-red-500">password invalid</span>}
        </div>

        </form>

    )
};

