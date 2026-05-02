
const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments"); // Stripe & PayFast (Strategy Pattern)
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");
const courseRequestRoutes = require("./routes/courseRequest");
const adminRoutes = require("./routes/Admin");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const EmailEnrollmentHandler = require("./observers/handlers/EmailEnrollmentHandler");

dotenv.config();
const PORT = process.env.PORT || 5000;


database.connect();


EmailEnrollmentHandler.register();

//middlewares
app.use(express.json());
app.use(cookieParser());
// app.use(
// 	cors({
// 		origin:"http://localhost:3000",
// 		credentials:true,
// 	})
// )
app.use(
	cors({
		origin: "*",
		credentials: true,
	})
);
// app.use(function(req, res, next) {
// 	res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
// 	res.header(
// 	  'Access-Control-Allow-Headers',
// 	  'Origin, X-Requested-With, Content-Type, Accept'
// 	);
// 	next();
// });

app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: "/tmp",
	})
)
//cloudinary connection
cloudinaryConnect();

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);
app.use("/api/v1/courseRequest", courseRequestRoutes);
app.use("/api/v1/admin", adminRoutes);


//def route

app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: 'Your server is up and running....'
	});
});

app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`)
})


module.exports = app