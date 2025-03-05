import { Router } from "express";
import queryHandler from "../queries/queriesHandler.js";

const apiRouter = Router();

apiRouter.route('/scores/work').get(queryHandler.fetchWorkScores);
apiRouter.route('/scores/location').get(queryHandler.fetchLocationScores);
apiRouter.route('/scores/endowment').get(queryHandler.fetchEndowmentScores);

export default apiRouter;
