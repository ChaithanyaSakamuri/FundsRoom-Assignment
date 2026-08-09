import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 NEXORA API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
