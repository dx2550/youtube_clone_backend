const mongoose = require('mongoose');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const videoSchema = new mongoose.Schema({

    videoFile: {
        type: String, //cloudnary url
        required: true,
    },
    thumbnail: {
        type: String, //cloudnary url
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    views: {
        type: Number,
        required: true,
        default: 0
    },
    isPublised: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true })

videoSchema.plugin(aggregatePaginate)

const Video = mongoose.model("Video", videoSchema)

module.exports = Video