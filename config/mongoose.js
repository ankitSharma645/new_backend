import mongoose from "mongoose"

export const MongoDb=()=>{
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`Connected with Database`)
    })
    .catch((err) => {
        console.log(err)
    })
}
