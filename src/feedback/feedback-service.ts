import * as xss from 'xss';
import { db } from "../database/connect";
import { IGiveFeedbackInfo } from "./feedback-router";

const FeedbackService = {
    insertFeedback: async (newFeedback: IGiveFeedbackInfo) => {
        return db
            .insert(newFeedback)
            .into('feedback')
            .returning('*')
            .then(([feedback]) => feedback)
    },

    serializeFeedback: (text: string | undefined) => {
        if (text) {
            return xss.filterXSS(text);
        } else {
            return '';
        }
    }
};

export default FeedbackService;
