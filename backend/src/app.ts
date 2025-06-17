import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import passport from 'passport';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';
import path from 'path';

const app = express();
const __dirname = path.resolve();

// cài đặt cần thiết
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(
    cors({
      credentials: true,
      origin: 'http://localhost:5173',
    })
  );
}
app.use(cookieParser());
app.use(passport.initialize());

// setup routes
app.use('/api', routes);

// serve frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend', 'dist', 'index.html'));
  });
}

app.use(errorHandler);

export default app;
