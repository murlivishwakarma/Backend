
// require('dotenv').config({path:'./env'});

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js"

 dotenv.config({
    path:'./env'
 })


connectDB()
.then(()=>{

  
   app.listen(process.env.PORT, ()=>{
      console.log(`Server satrted at PORT:${process.env.PORT}`);
      
   })
   .on('error',(error)=>{
      console.log("Error on on:",error);
      throw error;
   })
    
})
.catch(error=>{
   console.log("Mongo db connection failed !!!",error)
   throw error;
})



























// ;( async ()=>{
//     try
//     {
//       await mongoose.connect(`${process.env.MONOGODB_URI}/${DB_NAME}`);
//       app.on("error",(error)=>{
//         console.log("ERROR:",error);
//         throw ErrorEvent;
//       })

//       app.listen(process.env.PORT,()=>{
//         console.log(`App is listening to: ${process.env.PORT}`); })
//     }
 


//     catch(error)
//     {
//         console.log("ERROR:" ,error);
//         throw error;
//     }
// })()