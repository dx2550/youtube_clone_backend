const mongoose = require('mongoose');
const { type } = require('os');

const sunscriptionSchema = mongoose.Schema({

    subscriber:
    {
        type: mongoose.Schema.Types.ObjectId, //the one who is subscribe 
        ref: "User"
    },
    
    channel:
    {
        type: mongoose.Schema.Types.ObjectId, //the one who is 'subscribe' is subscribing 
        ref: "User"
    },


})

const Subscription = mongoose.model("Subscription", sunscriptionSchema);

module.exports = Subscription