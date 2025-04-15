const app = require('./app');
const PORT = process.env.PORT || 5080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});