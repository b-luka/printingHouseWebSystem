import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import path from 'path'
import process from 'process'

import userRouter from './routes/user.routes'
import adminRouter from './routes/admin.routes'
import productRouter from './routes/product.routes'
import cartRouter from './routes/cart.routes'
import orderRouter from './routes/order.routes'
import procurementRouter from './routes/procurement.router'

process.loadEnvFile();
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

mongoose.connect(process.env.DATABASE_URL as string)
.then(() => console.log('Connected to MongoDB!'))
.catch((err) => console.error('Failed to connect to MongoDB:', err));

app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/procurements', procurementRouter);

app.listen(process.env.PORT, ()=>console.log(`Express running on port ${process.env.PORT}!`))