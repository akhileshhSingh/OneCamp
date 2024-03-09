const express = require('express');
const router = express.Router({mergeParams: true});
const{validateReview,isLoggedIn,isReviewAuthor} = require('../middleware')

const expressError = require('../utils/expressError')
const catchAsync = require('../utils/catchAsync');

const Review = require('../models/review');
const Campground = require('../models/campground');

const {reviewSchema} = require('../schemas')//joi schema
//controller stuff
const reviews = require('../controllers/reviews');



router.post('/',isLoggedIn, validateReview ,catchAsync(reviews.createReview))
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview))

module.exports = router;