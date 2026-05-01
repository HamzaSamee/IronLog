"use strict";

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { query } = require("../config/db");

// GET /api/nutrition - Fetch meals and their items for the user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await query(`
            SELECT m.id as meal_id, m.meal_type, m.log_date, mi.id as item_id, mi.food_name, mi.calories
            FROM meals m
            LEFT JOIN meal_items mi ON m.id = mi.meal_id
            WHERE m.user_id = $1
            ORDER BY m.log_date DESC, m.created_at DESC
        `, [req.user.id]);
        
        // Group by meal
        const meals = result.rows.reduce((acc, row) => {
            const meal = acc.find(m => m.id === row.meal_id);
            if (meal) {
                if (row.item_id) meal.items.push({ id: row.item_id, name: row.food_name, calories: row.calories });
            } else {
                acc.push({
                    id: row.meal_id,
                    meal_type: row.meal_type,
                    log_date: row.log_date,
                    items: row.item_id ? [{ id: row.item_id, name: row.food_name, calories: row.calories }] : []
                });
            }
            return acc;
        }, []);
        
        res.json(meals);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/nutrition/meal - Create a meal with items (3NF Transactional feel)
router.post("/meal", authMiddleware, async (req, res) => {
    const { meal_type, items } = req.body; // items = [{ name: 'Rice', calories: 200 }]
    try {
        // Start "Transaction" manually via series of queries
        const mealResult = await query(
            "INSERT INTO meals (user_id, meal_type) VALUES ($1, $2) RETURNING id",
            [req.user.id, meal_type]
        );
        const mealId = mealResult.rows[0].id;

        for (const item of items) {
            await query(
                "INSERT INTO meal_items (meal_id, food_name, calories) VALUES ($1, $2, $3)",
                [mealId, item.name, item.calories]
            );
        }

        res.status(201).json({ message: "Meal logged successfully", mealId });
    } catch (error) {
        res.status(400).json({ error: "Bad request" });
    }
});

// GET /api/nutrition/daily-calories - Get daily calorie totals for graph
router.get("/daily-calories", authMiddleware, async (req, res) => {
    try {
        const result = await query(`
            SELECT m.log_date, SUM(mi.calories) as total_calories
            FROM meals m
            JOIN meal_items mi ON m.id = mi.meal_id
            WHERE m.user_id = $1
            GROUP BY m.log_date
            ORDER BY m.log_date ASC
        `, [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
