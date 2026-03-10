import "dotenv/config";
import connectDB from "./db/index.js";
import {app} from "./app.js"
import { connectRedis } from "./config/redis.js";
 

connectDB()
  .then(async() => {
    await connectRedis();
    app.listen(process.env.PORT||5000,"0.0.0.0",() => {
      console.log(`Server is running on port ${process.env.PORT || 5000}`);
    })
  })
  .catch((error) => {
    console.log("MONGODB CONNECTION ERROR", error);
  });
