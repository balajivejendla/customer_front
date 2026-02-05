"use server"
export async function actions(prev:any,data:FormData){
    const email=data.get("email")
    if(!email || typeof(email)!="string"|| !email.includes('@')){
        return{
            status:"error",
            reason:"invalid email"
        }
    }
    const password=data.get("password") as string
    const length=password.length;
    if (length<8){
        return {
            status:"error1",
            reason:"password must be length greater than equal to 8"
        }
    }
    return{
        status:"success",
        reason:"good"
    }
    
}