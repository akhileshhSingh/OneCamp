if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}


// console.log(process.env.SECRET);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');//one of the engine used to run or parse basically make sense of ejs
const session = require('express-session');
const flash = require('connect-flash');
const expressError = require('./utils/expressError')
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

// const Joi = require('joi');//we are exporing our schema from our schemas file now

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

// const session = require('express-session');already present above
const MongoStore = require('connect-mongo');


// mongoose.connect('mongodb://localhost:27017/yelp-camp'
// );

// const dbUrl = process.env.DB_URL
const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp'||process.env.DB_URL;
// 'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect(dbUrl)//farmStand database shuoldbe created for us
.then(()=> {
    
})
.catch(err => {
    console.log("OH NO MONGO CONNECTION ERROR!!!")
    console.log(err);
})


const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",() =>{
    console.log("Database connected");
});

const app = express();


app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));
//in res.send(req.body)
//we are sending body but we dont see anything because req.body has not been parsed so we need to tellexpress to parse the body
//to do that we use app.use
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize());
const secret = 'thisshouldbeabettersecret!'|| process.env.SECRET;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: secret,
});
store.on("error",function(e){
    console.log("SESSION STORE ERROR",e)
})

const sessionConfig = {
    store,
    name:'session',
    secret:'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly:true,
        // secure:true,
        expires:Date.now() + 1000 * 60 *60 * 24*7,
        maxAge:1000 * 60 *60 * 24*7,
    }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls,'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css'],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dbj0l80uj/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
    // console.log(req.session);  vid:537
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser',async (req,res) =>{
    const user = new User({email:'akhilesh@gmail.com',username:'akhilesh'});
    const newUser = await User.register(user,'chicken');
    res.send(newUser);
})

app.use('/',userRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);


app.get('/',(req,res) =>{
    res.render('home');
})

// app.get('/makecampground',async (req,res) =>{
//     const camp = new Campground({title: 'My Backyard', description: 'cheap camping'});
//     await camp.save();
//     res.send(camp);
// })


app.all('*',(req,res,next) =>{//for every single req
    next(new expressError('page not found!',404));//this will only run if nothing else is matched
})
app.use((err,req,res,next) =>{
    // res.send('oh man,something went wrong!!')
    const { statusCode = 500} = err;
    if(!err.message) err.message = 'Oh No,Something Went Wrong!!'
    res.status(statusCode).render('error',{err});
})


app.listen(3000, ()=>{
    console.log('serving on port 3000')
})