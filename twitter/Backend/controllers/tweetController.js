import { Tweet } from "../models/tweetSchema.js";
import { User } from "../models/userSchema.js";

export const createTweet = async (req, res) => {
    try {
        const { description, id } = req.body;

        if (!description || !id) {
            return res.status(400).json({
                message: "Fields are required.",
                success: false
            });
        }

        // Check if user exists
        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        // Create tweet
        await Tweet.create({
            description,
            userId: id,
            userDetails: user
        });

        return res.status(201).json({
            message: "Tweet created successfully.",
            success: true
        });
    } catch (error) {
        console.error("Error in createTweet controller:", error.message);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}

export const deleteTweet = async (req,res) => {
    try {
        const {id}  = req.params;
        await Tweet.findByIdAndDelete(id);
        return res.status(200).json({
            message:"Tweet deleted successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}

export const likeOrDislike = async (req, res) => {
    try {
        const loggedInUserId = req.body.id;
        const tweetId = req.params.id;

        // Find the tweet
        const tweet = await Tweet.findById(tweetId);

        // Check if tweet exists
        if (!tweet) {
            return res.status(404).json({
                message: "Tweet not found.",
                success: false
            });
        }

        // Check if the user has already liked the tweet
        if (tweet.like.includes(loggedInUserId)) {
            // Dislike
            await Tweet.findByIdAndUpdate(tweetId, { $pull: { like: loggedInUserId } });
            return res.status(200).json({
                message: "User disliked the tweet.",
                success: true
            });
        } else {
            // Like
            await Tweet.findByIdAndUpdate(tweetId, { $push: { like: loggedInUserId } });
            return res.status(200).json({
                message: "User liked the tweet.",
                success: true
            });
        }
    } catch (error) {
        console.log("Error in likeOrDislike controller:", error.message);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

export const getAllTweets = async (req,res) => {
    // loggedInUser ka tweet + following user tweet
    try {
        const id = req.params.id;
        const loggedInUser = await User.findById(id);
        const loggedInUserTweets = await Tweet.find({userId:id});
        const followingUserTweet = await Promise.all(loggedInUser.following.map((otherUsersId)=>{
            return Tweet.find({userId:otherUsersId});
        }));
        return res.status(200).json({
            tweets:loggedInUserTweets.concat(...followingUserTweet),
        })
    } catch (error) {
        console.log(error);
    }
}
export const getFollowingTweets = async (req,res) =>{
    try {
        const id = req.params.id;
        const loggedInUser = await User.findById(id); 
        const followingUserTweet = await Promise.all(loggedInUser.following.map((otherUsersId)=>{
            return Tweet.find({userId:otherUsersId});
        }));
        return res.status(200).json({
            tweets:[].concat(...followingUserTweet)
        });
    } catch (error) {
        console.log(error);
    }
}
 