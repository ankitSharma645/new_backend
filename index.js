import dotenv from "dotenv";
dotenv.config()
import express from 'express'
import { expressConfig } from './config/express.js';
import { MongoDb } from './config/mongoose.js';
import admin from './routes/adminRoutes.js'
import patient from './routes/patientRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import medicineRoutes from './routes/medicineRoutes.js'
import inventoryRoutes from './routes/inventoryRoutes.js'
import doctorRoutes from './routes/doctorRoutes.js'
import departmentRoutes from './routes/departmentRoutes.js'
import remarkRoutes from "./routes/remarkRoutes.js";
import labtestRoutes from './routes/labtestRoutes.js'
import hospitalRoutes from './routes/hospitalRoutes.js';
import { returnError } from './exceptions/errorHandler.js';

const app = express()

MongoDb() //Db connection
expressConfig(app) //Express configuration


app.get('/', (req, res) => { res.send('Hello World, from express.') });
app.use('/admin', admin)
app.use('/patients', patient)
app.use('/dashboard', dashboardRoutes)
app.use('/appointment', appointmentRoutes)
app.use('/medicine', medicineRoutes)
app.use('/inventory', inventoryRoutes)
app.use('/doctors', doctorRoutes)
app.use('/department', departmentRoutes)
app.use('/remark', remarkRoutes)
app.use('/labtest', labtestRoutes)
app.use('/hospital', hospitalRoutes);

app.use(returnError)

app.listen(process.env.PORT, () => {
    console.log(`Server started at PORT - ${process.env.PORT}`)
})