const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReview = async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);//it'll create a new review
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Created new review!!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async(req,res)=>{
    const{id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull: { reviews: reviewId}});//pull anything with reviewId out of reviews and reviews is array of ids
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Deleted The Review!!');
    res.redirect(`/campgrounds/${id}`);
}