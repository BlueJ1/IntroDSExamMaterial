/**
 * Data Loader Module
 * Handles loading and parsing of JSON data files
 */

class DataLoader {
    constructor() {
        this.slides = [];
        this.notes = [];
        this.exams = [];
        this.loaded = false;
    }

    async loadAll() {
        try {
            const [slidesData, notesData, examsData] = await Promise.all([
                this.loadJSON('data/slides.json'),
                this.loadJSON('data/notes.json'),
                this.loadJSON('data/exams.json')
            ]);

            this.slides = slidesData.slides || [];
            this.notes = notesData.notes || [];
            this.exams = examsData.exams || [];
            this.loaded = true;

            return {
                slides: this.slides,
                notes: this.notes,
                exams: this.exams
            };
        } catch (error) {
            console.error('Error loading data:', error);
            // Return empty data if files don't exist yet
            return {
                slides: [],
                notes: [],
                exams: []
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

    getExams() {
        return this.exams;
    }

    getAllTopics() {
        const topics = new Set();

        this.slides.forEach(slide => {
            if (slide.topic) topics.add(slide.topic);
        });

        this.notes.forEach(note => {
            if (note.topic) topics.add(note.topic);
        });

        this.exams.forEach(exam => {
            if (exam.topic) topics.add(exam.topic);
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

    getExamTopics() {
        const topics = new Set();
        this.exams.forEach(exam => {
            if (exam.topic) topics.add(exam.topic);
        });
        return Array.from(topics).sort();
    }

    getExamYears() {
        const years = new Set();
        this.exams.forEach(exam => {
            if (exam.year) years.add(exam.year);
        });
        return Array.from(years).sort((a, b) => b - a);
    }
}

// Global instance
const dataLoader = new DataLoader();

