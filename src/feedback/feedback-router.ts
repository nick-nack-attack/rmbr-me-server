import {json, Router} from 'express';

// service
import FeedbackService from "./feedback-service";
import requireAuth from "../middleware/jwt-auth";

const feedbackRouter = Router();
const jsonBodyParser = json();

export enum FeedbackCategory {
    BUG = 'Bug',
    NEW_FEATURE = 'New Feature',
    RANDOM = 'Random',
}

export interface IGiveFeedbackInfo {
    text: string;
    category: FeedbackCategory;
    userId: number;
}

// for posting new users (i.e. sign up)
feedbackRouter
    .route('/')
    .all(requireAuth)
    .post(jsonBodyParser, async (req, res, next) => {
        const newFeedback: IGiveFeedbackInfo = {
            text: FeedbackService.serializeFeedback(req.body.text),
            category: req.body.category,
            // @ts-ignore
            user_id: req.user.id,
        }

        for (const [key, value] of Object.entries(newFeedback))
            if (value === null)
                return res.status(400).json({
                    error: `Missing ${key} in request`
                });

        try {
            const feedback = await FeedbackService.insertFeedback(newFeedback);

            return res.status(201).json(feedback);
        } catch (err) {
            console.error(err);
            res.status(400).json({ error: err });
        } finally {
            next();
        }
    })

export default feedbackRouter;
