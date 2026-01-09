/**
 * Fuzzy Search Module
 * Uses Fuse.js for fuzzy matching across all content
 */

class FuzzySearch {
    constructor() {
        this.fuseSlides = null;
        this.fuseNotes = null;
        this.fuseExercises = null;
        this.fuseAll = null;
    }

    /**
     * Initialize Fuse.js instances with data
     */
    initialize(slides, notes, exercises) {
        // Fuse.js options for fuzzy matching
        const baseOptions = {
            includeScore: true,
            includeMatches: true,
            threshold: 0.2, // Lower = more strict, Higher = more fuzzy
            ignoreLocation: true,
            minMatchCharLength: 3,
            distance: 100
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

        // Exercises search configuration
        this.fuseExercises = new Fuse(exercises, {
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
            ...exercises.map(e => ({ ...e, type: 'exercise' }))
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
        const results = this.fuseAll.search(query);
        // Filter by score (lower is better) and limit results
        return results
            .filter(result => result.score < 0.4)
            .slice(0, 10)
            .map(result => ({
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
        const results = this.fuseSlides.search(query);
        return results
            .filter(result => result.score < 0.4)
            .map(result => ({
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
        const results = this.fuseNotes.search(query);
        return results
            .filter(result => result.score < 0.4)
            .map(result => ({
                ...result.item,
                score: result.score,
                matches: result.matches
            }));
    }

    /**
     * Search only exercises
     */
    searchExercises(query) {
        if (!query || !this.fuseExercises) return [];
        const results = this.fuseExercises.search(query);
        return results
            .filter(result => result.score < 0.4)
            .map(result => ({
                ...result.item,
                score: result.score,
                matches: result.matches
            }));
    }

    /**
     * Highlight matched text in a string
     */
    highlightMatches(text, matches, key) {
        if (!matches || !text) return this.escapeHtml(text);

        const relevantMatches = matches.filter(m => m.key === key);
        if (relevantMatches.length === 0) return this.escapeHtml(text);

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
            const matchText = result.substring(start, end);
            const after = result.substring(end);
            result = `${before}__HIGHLIGHT_START__${matchText}__HIGHLIGHT_END__${after}`;
        });

        // Escape HTML first, then replace highlight markers
        result = this.escapeHtml(result);
        result = result.replace(/__HIGHLIGHT_START__/g, '<span class="highlight">');
        result = result.replace(/__HIGHLIGHT_END__/g, '</span>');

        return result;
    }

    /**
     * Escape HTML entities
     */
    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Get excerpt around matched text
     */
    getExcerpt(text, matches, key, maxLength = 150) {
        if (!text) return '';

        // Clean the text of markdown/LaTeX for display
        let cleanText = text
            .replace(/\$\$[\s\S]*?\$\$/g, '[formula]')
            .replace(/\$[^\$\n]+?\$/g, '[formula]')
            .replace(/\\[a-zA-Z]+/g, '')
            .replace(/[{}]/g, '')
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/###?\s*/g, '')
            .replace(/\n+/g, ' ')
            .trim();

        const relevantMatches = matches?.filter(m => m.key === key);

        if (!relevantMatches || relevantMatches.length === 0) {
            const excerpt = cleanText.substring(0, maxLength);
            return this.escapeHtml(excerpt) + (cleanText.length > maxLength ? '...' : '');
        }

        // Find the first match position in original text
        const firstMatch = relevantMatches[0].indices[0];
        const matchStart = firstMatch[0];
        const matchEnd = firstMatch[1] + 1;
        const matchedText = text.substring(matchStart, matchEnd);

        // Calculate excerpt boundaries
        const excerptStart = Math.max(0, matchStart - 50);
        const excerptEnd = Math.min(text.length, matchStart + maxLength - 50);

        let excerpt = text.substring(excerptStart, excerptEnd);

        // Clean the excerpt
        excerpt = excerpt
            .replace(/\$\$[\s\S]*?\$\$/g, '[formula]')
            .replace(/\$[^\$\n]+?\$/g, '[formula]')
            .replace(/\\[a-zA-Z]+/g, '')
            .replace(/[{}]/g, '')
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/###?\s*/g, '')
            .replace(/\n+/g, ' ')
            .trim();

        if (excerptStart > 0) excerpt = '...' + excerpt;
        if (excerptEnd < text.length) excerpt = excerpt + '...';

        // Escape HTML and highlight the matched term directly
        excerpt = this.escapeHtml(excerpt);

        // Try to highlight the matched text in the excerpt (case-insensitive)
        const escapedMatch = this.escapeHtml(matchedText).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedMatch})`, 'gi');
        excerpt = excerpt.replace(regex, '<span class="highlight">$1</span>');

        return excerpt;
    }
}

// Global instance
const fuzzySearch = new FuzzySearch();

