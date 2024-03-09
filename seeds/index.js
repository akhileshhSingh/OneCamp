
const mongoose = require('mongoose');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

// mongoose.connect('mongodb://localhost:27017/yelp-camp'
// );
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')//farmStand database shuoldbe created for us
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

const sample = (array) =>array[Math.floor(Math.random() * array.length)];


const seedDB = async() =>{
    await Campground.deleteMany({});//delesting everything in database
    for(let i=0;i<300;i++){
        const random1000 = Math.floor(Math.random() * 1000)//we'll pick a random numer 50 times to get a city
        const price = Math.floor(Math.random()*20) + 10;
        const camp= new Campground({
            author:'65cfac7f046c4cc88a7a82ba',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,//set that city name to a location
            title: `${sample(descriptors)} ${sample(places)}`,//we pick a random descriptor and random place for our title
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora labore asperiores repudiandae accusantium culpa porro nisi consectetur, cum incidunt enim! Excepturi eius, quibusdam velit suscipit nihil illum perspiciatis consequatur necessitatibus!',
            price:price,
            geometry: {
                 type: 'Point', 
                 coordinates: [ 
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                  ] 
                },
            images: [
                {
                  url: 'https://res.cloudinary.com/dbj0l80uj/image/upload/v1708361379/OneCamp/ikhoq84tf8g7c1n1obwj.jpg',
                  filename: 'OneCamp/ikhoq84tf8g7c1n1obwj',
                },
                {
                  url: 'https://res.cloudinary.com/dbj0l80uj/image/upload/v1708361381/OneCamp/jzso1z7ellprjaz6qvnh.jpg',
                  filename: 'OneCamp/jzso1z7ellprjaz6qvnh',
                }
              ]
        })
        await camp.save();//we save
    }
}
seedDB().then(() =>{
    mongoose.connection.close();
});