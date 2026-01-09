/**
 * Fuzzy Search Module
 * Uses Fuse.js for fuzzy matching across all content
 */

class FuzzySearch {
    constructor() {
        this.fuseSlides = null;
        this.fuseNotes = null;
        this.fuseExams = null;
        this.fuseAll = null;
    }

    /**
     * Initialize Fuse.js instances with data
     */
    initialize(slides, notes, exams) {
        // Fuse.js options for fuzzy matching
        const baseOptions = {
            includeScore: true,
            includeMatches: true,
            threshold: 0.4, // Lower = more strict, Higher = more fuzzy
            ignoreLocation: true,
            minMatchCharLength: 2,
            findAllMatches: true
        };

        // Slides search configuration
        this.fuseSlides = new Fuse(slides, {
            ...baseOptions,
            keys: [
                { name: 'title', weight: 2 },
                { name: 'topic', weight: 1.5 },
                { name: 'description', weight: 1 },
                { name: 'keywords', weight: 1.5 }
            ]
        });

        // Notes search configuration
        this.fuseNotes = new Fuse(notes, {
            ...baseOptions,
            keys: [
                { name: 'title', weight: 2 },
                { name: 'topic', weight: 1.5 },
                { name: 'content', weight: 1 },
                { name: 'keywords', weight: 1.5 }
            ]
        });

        // Exams search configuration
        this.fuseExams = new Fuse(exams, {
            ...baseOptions,
            keys: [
                { name: 'title', weight: 2 },
                { name: 'topic', weight: 1.5 },
                { name: 'question', weight: 1.5 },
                { name: 'answer', weight: 1 },
                { name: 'keywords', weight: 1.5 }
            ]
        });

        // Combined search for global search
        const allItems = [
            ...slides.map(s => ({ ...s, type: 'slide' })),
            ...notes.map(n => ({ ...n, type: 'note' })),
            ...exams.map(e => ({ ...e, type: 'exam' }))
        ];

        this.fuseAll = new Fuse(allItems, {
            ...baseOptions,
            keys: [
                { name: 'title', weight: 2 },
                { name: 'topic', weight: 1.5 },
                { name: 'content', weight: 1 },
                { name: 'description', weight: 1 },
                { name: 'question', weight: 1.5 },
                { name: 'answer', weight: 1 },
                { name: 'keywords', weight: 1.5 }
            ]
        });
    }

    /**
     * Search across all content types
     */
    searchAll(query) {
        if (!query || !this.fuseAll) return [];
        return this.fuseAll.search(query).map(result => ({
            ...result.item,
            score: result.score,
            matches: result.matches
        }));
    }

    /**
     * Search only slides
     */
    searchSlides(query) {
        if (!query || !this.fuseSlides) return [];
        return this.fuseSlides.search(query).map(result => ({
            ...result.item,
            score: result.score,
            matches: result.matches
        }));
    }

    /**
     * Search only notes
     */
    searchNotes(query) {
        if (!query || !this.fuseNotes) return [];
        return this.fuseNotes.search(query).map(result => ({
            ...result.item,
            score: result.score,
            matches: result.matches
        }));
    }

    /**
     * Search only exams
     */
    searchExams(query) {
        if (!query || !this.fuseExams) return [];
        return this.fuseExams.search(query).map(result => ({
            ...result.item,
            score: result.score,
            matches: result.matches
        }));
    }

    /**
     * Highlight matched text in a string
     */
    highlightMatches(text, matches, key) {
        if (!matches || !text) return text;

        const relevantMatches = matches.filter(m => m.key === key);
        if (relevantMatches.length === 0) return text;

        let result = text;
        const indices = [];

        relevantMatches.forEach(match => {
            match.indices.forEach(([start, end]) => {
                indices.push({ start, end: end + 1 });
            });
        });

        // Sort indices in reverse order to maintain positions during replacement
        indices.sort((a, b) => b.start - a.start);

        indices.forEach(({ start, end }) => {
            const before = result.substring(0, start);
            const match = result.substring(start, end);
            const after = result.substring(end);
            result = `${before}<span class="highlight">${match}</span>${after}`;
        });

        return result;
    }

    /**
     * Get excerpt around matched text
     */
    getExcerpt(text, matches, key, maxLength = 150) {
        if (!text) return '';

        const relevantMatches = matches?.filter(m => m.key === key);

        if (!relevantMatches || relevantMatches.length === 0) {
            return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
        }

        // Find the first match position
        const firstMatch = relevantMatches[0].indices[0];
        const matchStart = firstMatch[0];

        // Calculate excerpt boundaries
        const excerptStart = Math.max(0, matchStart - 40);
        const excerptEnd = Math.min(text.length, matchStart + maxLength - 40);

        let excerpt = text.substring(excerptStart, excerptEnd);

        if (excerptStart > 0) excerpt = '...' + excerpt;
        if (excerptEnd < text.length) excerpt = excerpt + '...';

        // Apply highlighting
        return this.highlightMatches(excerpt, matches, key);
    }
}

// Global instance
const fuzzySearch = new FuzzySearch();

