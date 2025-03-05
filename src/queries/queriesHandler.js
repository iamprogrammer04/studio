import pool from "../connection/connection.js";
import apiResHandler from "../utils/apiResponseHandler.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";
import { workScoreNames, locationScoreNames, endowmentScoreNames } from "../static/static.js"

const fetchWorkScores = asyncErrorHandler(async (req, res) => {
    const [workScores] = await pool.query(`
        SELECT 
            uav.score AS work_score, 
            COUNT(*) AS count
        FROM users_assessments ua
        JOIN users_assessments_82_variables uav 
            ON ua.id = uav.user_assessment_id
        WHERE 
            ua.status = 'complete'
            AND uav.variable = 'work'
            AND uav.score BETWEEN 1 AND 8
        GROUP BY uav.score
        ORDER BY uav.score;
    `);

    const mappedWorkScores = {};
    workScores.forEach(item => {
        const key = workScoreNames[item.work_score] || item.work_score;
        mappedWorkScores[key] = item.count;
    });

    res.status(200).json(apiResHandler("Work scores fetched", mappedWorkScores));
});

const fetchLocationScores = asyncErrorHandler(async (req, res) => {
    const [locationScores] = await pool.query(`
        SELECT 
            uav.score AS location_score, 
            COUNT(*) AS count
        FROM users_assessments ua
        JOIN users_assessments_82_variables uav 
            ON ua.id = uav.user_assessment_id
        WHERE 
            ua.status = 'complete'
            AND uav.variable = 'location'
            AND uav.score BETWEEN 1 AND 3
        GROUP BY uav.score
        ORDER BY uav.score;
    `);


    const mappedLocationScores = {};
    locationScores.forEach(item => {
        const key = locationScoreNames[item.location_score] || item.location_score;
        mappedLocationScores[key] = item.count;
    });

    res.status(200).json(apiResHandler("Location scores fetched", mappedLocationScores));
});

const fetchEndowmentScores = asyncErrorHandler(async (req, res) => {
    const [endowmentScoresResult, combinedScoresResult] = await Promise.all([
        pool.query(`
            SELECT DISTINCT uav1.score AS endowment_score
            FROM users_assessments ua
            JOIN users_assessments_82_variables uav1 
                ON ua.id = uav1.user_assessment_id
            WHERE 
                ua.status = 'complete'
                AND uav1.variable = 'endowment'
                AND uav1.score BETWEEN 1 AND 6
            ORDER BY uav1.score;
        `),

        pool.query(`
            SELECT 
                uav1.score AS endowment_score,
                uav2.score AS work_score,
                COUNT(*) AS count
            FROM users_assessments ua
            JOIN users_assessments_82_variables uav1 
                ON ua.id = uav1.user_assessment_id
            JOIN users_assessments_82_variables uav2 
                ON ua.id = uav2.user_assessment_id
            WHERE 
                ua.status = 'complete'
                AND uav1.variable = 'endowment'
                AND uav2.variable = 'work'
                AND uav1.score BETWEEN 1 AND 6
                AND uav2.score BETWEEN 1 AND 8
            GROUP BY uav1.score, uav2.score
            ORDER BY uav1.score, uav2.score;
        `)
    ]);

    const endowmentScores = endowmentScoresResult[0];
    const combinedScores = combinedScoresResult[0];


    const formattedResults = {};
    endowmentScores.forEach(endowment => {
        const endowmentKey = endowmentScoreNames[endowment.endowment_score] || endowment.endowment_score;
        formattedResults[endowmentKey] = {};

        combinedScores.forEach(score => {
            if (score.endowment_score === endowment.endowment_score) {
                const workKey = workScoreNames[score.work_score] || score.work_score;
                formattedResults[endowmentKey][workKey] = score.count;
            }
        });
    });

    res.status(200).json(apiResHandler("Endowment scores fetched", formattedResults));
});

export default {
    fetchWorkScores,
    fetchLocationScores,
    fetchEndowmentScores
};