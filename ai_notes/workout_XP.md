# Workout XP Calculation System

This document explains how XP is calculated for each workout type in the FitnessFreak app.

## Basic XP Calculation Logic

In our application, XP is calculated based on the workout value (distance, reps, or time) and a specific XP rate for each workout type:

| **Category**              | **Workout Type**       | **Unit**    | **XP Rate**               |
|---------------------------|------------------------|-------------|---------------------------|
| **Cardiovascular**        | Running                | km          | 3 XP per km               |
|                           | Cycling                | km          | 2 XP per km               |
|                           | Swimming               | km          | 4 XP per km               |
|                           | Walking                | km          | 1 XP per km               |
| **Strength Training**     | Push-ups               | reps        | 1 XP per 10 reps          |
|                           | Pull-ups               | reps        | 1 XP per 5 reps           |
|                           | Squats                 | reps        | 1 XP per 10 reps          |
|                           | Planks                 | minutes     | 0.5 XP per minute         |
| **Flexibility & Mobility**| Static Stretching      | minutes     | 0.5 XP per 5 min          |
|                           | Dynamic Stretching     | minutes     | 0.5 XP per 5 min          |
|                           | Yoga                   | minutes     | 2 XP per 10 min           |
|                           | Pilates                | minutes     | 2 XP per 10 min           |
|                           | PNF Stretching         | minutes     | 0.5 XP per 5 min          |
| **Balance & Stability**   | Tai Chi                | minutes     | 2 XP per 10 min           |
|                           | Yoga Balance           | minutes     | 1 XP per 5 min            |
|                           | Single-Leg Stand       | minutes     | 0.5 XP per 2 min          |
|                           | Heel-to-Toe Walking    | minutes     | 0.5 XP per 5 min          |
|                           | Balance Board          | minutes     | 0.5 XP per 3 min          |
| **HIIT**                  | Sprint Intervals       | meters      | 3 XP per 100m             |
|                           | Circuit Training       | minutes     | 3 XP per 5 min            |
|                           | Tabata                 | minutes     | 3 XP per 4 min            |
|                           | Burpees                | reps        | 2 XP per 10 reps          |
|                           | Box Jumps              | reps        | 2 XP per 10 reps          |
| **Functional Training**   | Lunges                 | reps        | 1 XP per 10 reps          |
|                           | Step-Ups               | reps        | 1 XP per 10 reps          |
|                           | Medicine Ball Throws   | reps        | 1 XP per 10 reps          |
|                           | Kettlebell Swings      | reps        | 1 XP per 10 reps          |


## XP Calculation Process

1. When a workout is completed (marked with `completed: true`), the system calculates XP based on:
   - The workout value (distance, reps, or time)
   - The XP rate for that workout type
   - Formula: `XP = Value × XP Rate`

2. If a workout is not completed (`completed: false`), no XP is awarded.

3. Each day's total XP is capped at 100 XP.

4. Total XP is calculated as the sum of all daily XP values.

## Implementation Details

The XP calculation is implemented in the `recalculateAllXP` function, which:

1. Processes all workouts in the `daily_workout_progress` collection
2. Checks each workout entry to ensure it's marked as completed
3. Calculates XP for each completed workout based on its value and XP rate
4. Caps each day's XP at 100 if it exceeds that value
5. Calculates total XP by summing all daily XP values
6. Updates the user's document with the new XP values

## Example Calculations

- 10 km of Running = 10 × 3 = 30 XP
- 50 Push-ups = 50 × 0.1 = 5 XP (1 XP per 10 reps)
- 30 minutes of Yoga = 30 × 0.2 = 6 XP (2 XP per 10 minutes)

## Important Rules

- Only completed workouts contribute to XP
- XP is calculated based on workout value and type-specific XP rates
- XP is tracked per day, with each day having its own cap of 100 XP
- The system always recalculates XP from scratch based on workout progress data
- XP values are stored in the `dailyXP` field in the user document
- Total lifetime XP is stored in the `totalXP` field

This system rewards users based on the actual amount of exercise they complete, encouraging more challenging workouts while maintaining a reasonable daily cap to promote consistent exercise habits. 