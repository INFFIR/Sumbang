
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const requestDataRoutes = require("./routes/request_data");
const verifikasiRoutes = require("./routes/verifikasi");
const manageUsersRoutes = require("./routes/manageUsers");
const manageContentRoutes = require("./routes/manageContent");
const detailRoute = require("./routes/detail");

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());
app.use("/api", authRoutes);
app.use("/api", requestDataRoutes);
app.use("/api", verifikasiRoutes);
app.use("/api", manageUsersRoutes);
app.use("/api", manageContentRoutes);
app.use('/api', detailRoute);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
