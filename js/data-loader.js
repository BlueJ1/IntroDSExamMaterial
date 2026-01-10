/**
 * Data Loader Module
 * Handles loading and parsing of JSON data files
 */

class DataLoader {
    constructor() {
        this.slides = [];
        this.notes = [];
        this.exercises = [];
        this.loaded = false;
    }

    async loadAll() {
        try {
            const [slidesData, notesData, exercisesData] = await Promise.all([
                this.loadJSON('data/slides.json'),
                this.loadJSON('data/notes.json'),
                this.loadJSON('data/exercises.json')
            ]);

            this.slides = slidesData.slides || [];
            this.notes = notesData.notes || [];
            this.exercises = exercisesData.exercises || [];
            this.loaded = true;

            return {
                slides: this.slides,
                notes: this.notes,
                exercises: this.exercises
            };
        } catch (error) {
            console.error('Error loading data:', error);
            // Return empty data if files don't exist yet
            return {
                slides: [],
                notes: [],
                exercises: []
            };
        }
    }

    async loadJSON(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.warn(`Could not load ${path}:`, error);
            return {};
        }
    }

    getSlides() {
        return this.slides;
    }

    getNotes() {
        return this.notes;
    }

    getExercises() {
        return this.exercises;
    }

    getAllTopics() {
        const topics = new Set();

        this.slides.forEach(slide => {
            if (slide.topic) topics.add(slide.topic);
        });

        this.notes.forEach(note => {
            if (note.topic) topics.add(note.topic);
        });

        this.exercises.forEach(exercise => {
            if (exercise.topic) topics.add(exercise.topic);
        });

        return Array.from(topics).sort();
    }

    getSlideTopics() {
        const topics = new Set();
        this.slides.forEach(slide => {
            if (slide.topic) topics.add(slide.topic);
        });
        return Array.from(topics).sort();
    }

    getNoteTopics() {
        const topics = new Set();
        this.notes.forEach(note => {
            if (note.topic) topics.add(note.topic);
        });
        return Array.from(topics).sort();
    }

    getExerciseTopics() {
        const topics = new Set();
        this.exercises.forEach(exercise => {
            if (exercise.topic) topics.add(exercise.topic);
        });
        return Array.from(topics).sort();
    }
}

// Global instance
const dataLoader = new DataLoader();

