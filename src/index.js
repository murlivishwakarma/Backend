
// require('dotenv').config({path:'./env'});

import dotenv from "dotenv";
import connectDB from "./db/index.js";


 dotenv.config({
    path:'./env'
 })
connectDB();



























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