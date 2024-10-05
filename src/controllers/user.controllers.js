
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"


const generateAccessAndRefreshToken =async(userId)=> {
      
    try{
         const user= await   User.findById(userId);
           
       const accesToken= user.generateAccessToken();
       const refreshToken= user.generateRefreshToken();

       user.refreshToken=refreshToken;
       await user.save({validateBeforeSave:false});
        
       return {accesToken,refreshToken}

    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating token")
    }


}




const registerUser = asyncHandler( async (req,res)=>{
    
     // get user details from frontend
     // validation - not empty usename,email
     // check if user already exists:username,email
     // check for images ,check for avatar
     // upload them to cloudinary,avatar
     // create user object -create entry in db
     // remove password and refreshtoken field from response
     // check for user creation 
     // return response

    const {fullname,email,username,password}= req.body;
    console.log("email: ",email);

    // if(fullname === "")
    // {
    //     throw new ApiError(400,"All field are required");
    // }

    if(
        [fullname,email,username,password].some((field)=>{
             return field?.trim() === "";
        })
    )
    {
           throw new ApiError(400,"All fields are required");
    }

   const existedUser= await User.findOne({
        $or:[{ email },{ username }]
    })

    if(existedUser){
        throw new ApiError(409,"username or email exists already");
    }
    
    console.log(req.files);
  const avatarLocalPath=  req.files?.avatar[0]?.path;
  
 // const coverImageLocalPath= req.files?.coverImage[0]?.path;

 let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0)
 {
    coverImageLocalPath=req.files.coverImage[0].path;
  }

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required");
  }
  
    const avatar= await uploadOnCloudinary(avatarLocalPath);
    const coverImage=  await uploadOnCloudinary(coverImageLocalPath);



    if(!avatar){
        throw new ApiError(400,"Avatar file is required");
    }
   
 const user = await User.create({

        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
        
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser,"User register succesfully")
    )
   
})

const loginUser= asyncHandler( async(req,res)=>{
      
     // req.body-->data;
     // username or email
     // find the user
     // password check
     // acces and refresh token
     // send cookie
    
    const {email,username,password}=req.body;

    if(!(username || email))
        {
          throw new ApiError(400,"Username or email is required")
      }

   const user = await  User.findOne(
       {
        $or:[{username},{email}]
      }
    )
  
    if(!user){
        throw new ApiError(404),"User does not exist"
    }

    const isPasswordValid= await user.isPasswordCorrect(password);


    if(!isPasswordValid){
        throw new ApiError(401,"Invalid password");
    }


   const {accesToken,refreshToken} =await generateAccessAndRefreshToken(user._id);
   
   const logedInUser= await User.findById(user._id).select("-password -refreshToken");

   const options=
   {
    httpOnly:true,
    secure:true
   }

   return res
   .status(200)
   .cookie("accessToken",accesToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(
        200,
        {
            user:logedInUser,accesToken,refreshToken
        },
        "User loged in successfully"

    )
   )


})

const logOutUser=asyncHandler( async(req,res)=>{
   
  await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options = {

        httpOnly:true,
        secure:true
    }
     
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User loged Out")
    )

})

export { registerUser,loginUser ,logOutUser}