/**
 * Main Application Module
 * Handles UI interactions and rendering
 */

class App {
    constructor() {
        this.currentSection = 'dashboard';
        this.slides = [];
        this.notes = [];
        this.exercises = [];
    }

    async init() {
        // Load data
        const data = await dataLoader.loadAll();
        this.slides = data.slides;
        this.notes = data.notes;
        this.exercises = data.exercises;

        // Initialize fuzzy search
        fuzzySearch.initialize(this.slides, this.notes, this.exercises);

        // Update dashboard counts
        this.updateDashboardCounts();

        // Render initial content
        this.renderSlides(this.slides);
        this.renderNotes(this.notes);
        this.renderExercises(this.exercises);

        // Populate filter dropdowns
        this.populateFilters();

        // Setup event listeners
        this.setupEventListeners();
    }

    updateDashboardCounts() {
        document.getElementById('slides-count').textContent = `${this.slides.length} slides`;
        document.getElementById('notes-count').textContent = `${this.notes.length} notes`;
        document.getElementById('exercises-count').textContent = `${this.exercises.length} exercises`;
    }

    populateFilters() {
        const slideTopics = dataLoader.getSlideTopics();
        const noteTopics = dataLoader.getNoteTopics();
        const exerciseTopics = dataLoader.getExerciseTopics();

        // Slides topic filter
        const slidesTopicFilter = document.getElementById('slides-topic-filter');
        slideTopics.forEach(topic => {
            slidesTopicFilter.innerHTML += `<option value="${topic}">${topic}</option>`;
        });

        // Notes topic filter
        const notesTopicFilter = document.getElementById('notes-topic-filter');
        noteTopics.forEach(topic => {
            notesTopicFilter.innerHTML += `<option value="${topic}">${topic}</option>`;
        });

        // Exercises topic filter
        const exercisesTopicFilter = document.getElementById('exercises-topic-filter');
        exerciseTopics.forEach(topic => {
            exercisesTopicFilter.innerHTML += `<option value="${topic}">${topic}</option>`;
        });
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.navigateTo(section);
            });
        });

        // Dashboard cards
        document.querySelectorAll('.dashboard-card').forEach(card => {
            card.addEventListener('click', () => {
                const section = card.dataset.goto;
                this.navigateTo(section);
            });
        });

        // Global search
        const globalSearch = document.getElementById('global-search');
        let searchTimeout;
        globalSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleGlobalSearch(e.target.value);
            }, 200);
        });

        // Section-specific searches
        this.setupSectionSearch('slides-search', this.filterSlides.bind(this));
        this.setupSectionSearch('notes-search', this.filterNotes.bind(this));
        this.setupSectionSearch('exercises-search', this.filterExercises.bind(this));

        // Filter dropdowns
        document.getElementById('slides-topic-filter').addEventListener('change', () => this.applyFilters('slides'));
        document.getElementById('notes-topic-filter').addEventListener('change', () => this.applyFilters('notes'));
        document.getElementById('exercises-topic-filter').addEventListener('change', () => this.applyFilters('exercises'));

        // Modal close
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('slide-modal').classList.remove('active');
        });

        // Close modal on backdrop click
        document.getElementById('slide-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.classList.remove('active');
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.getElementById('slide-modal').classList.remove('active');
            }
        });
    }

    setupSectionSearch(inputId, handler) {
        const input = document.getElementById(inputId);
        let timeout;
        input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                handler(e.target.value);
            }, 200);
        });
    }

    navigateTo(section) {
        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === section);
        });

        // Update sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.toggle('active', sec.id === section);
        });

        this.currentSection = section;

        // Clear global search when navigating
        document.getElementById('global-search').value = '';
        document.getElementById('quick-search-results').classList.remove('active');
    }

    handleGlobalSearch(query) {
        const resultsContainer = document.getElementById('quick-search-results');
        const searchResultsContainer = document.getElementById('search-results-container');

        if (!query || query.length < 2) {
            resultsContainer.classList.remove('active');
            return;
        }

        const results = fuzzySearch.searchAll(query);

        if (results.length === 0) {
            searchResultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${query}"</p>
                </div>
            `;
        } else {
            searchResultsContainer.innerHTML = results.slice(0, 10).map(result => {
                const typeLabel = result.type === 'slide' ? 'Slide' :
                                  result.type === 'note' ? 'Note' : 'Exercise';

                let excerpt = '';
                if (result.type === 'slide') {
                    excerpt = fuzzySearch.getExcerpt(result.description || '', result.matches, 'description');
                } else if (result.type === 'note') {
                    excerpt = fuzzySearch.getExcerpt(result.content || '', result.matches, 'content');
                } else {
                    excerpt = fuzzySearch.getExcerpt(result.question || '', result.matches, 'question');
                }

                return `
                    <div class="search-result-item" data-type="${result.type}" data-id="${result.id}">
                        <span class="result-type ${result.type}">${typeLabel}</span>
                        <span class="result-title">${fuzzySearch.highlightMatches(result.title, result.matches, 'title')}</span>
                        <p class="result-excerpt">${excerpt}</p>
                    </div>
                `;
            }).join('');

            // Add click handlers to results
            searchResultsContainer.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const type = item.dataset.type;
                    const id = item.dataset.id;
                    this.navigateToItem(type, id);
                });
            });
        }

        resultsContainer.classList.add('active');
    }

    navigateToItem(type, id) {
        if (type === 'slide') {
            this.navigateTo('slides');
            // Could scroll to specific slide
        } else if (type === 'note') {
            this.navigateTo('notes');
        } else if (type === 'exercise') {
            this.navigateTo('exercises');
        }
    }

    filterSlides(query) {
        if (!query) {
            this.applyFilters('slides');
            return;
        }
        const results = fuzzySearch.searchSlides(query);
        this.renderSlides(results);
    }

    filterNotes(query) {
        if (!query) {
            this.applyFilters('notes');
            return;
        }
        const results = fuzzySearch.searchNotes(query);
        this.renderNotes(results);
    }

    filterExercises(query) {
        if (!query) {
            this.applyFilters('exercises');
            return;
        }
        const results = fuzzySearch.searchExercises(query);
        this.renderExercises(results);
    }

    applyFilters(section) {
        if (section === 'slides') {
            const topic = document.getElementById('slides-topic-filter').value;
            const query = document.getElementById('slides-search').value;

            let filtered = this.slides;
            if (topic) {
                filtered = filtered.filter(s => s.topic === topic);
            }
            if (query) {
                const searchResults = fuzzySearch.searchSlides(query);
                const searchIds = new Set(searchResults.map(r => r.id));
                filtered = filtered.filter(s => searchIds.has(s.id));
            }
            this.renderSlides(filtered);
        } else if (section === 'notes') {
            const topic = document.getElementById('notes-topic-filter').value;
            const query = document.getElementById('notes-search').value;

            let filtered = this.notes;
            if (topic) {
                filtered = filtered.filter(n => n.topic === topic);
            }
            if (query) {
                const searchResults = fuzzySearch.searchNotes(query);
                const searchIds = new Set(searchResults.map(r => r.id));
                filtered = filtered.filter(n => searchIds.has(n.id));
            }
            this.renderNotes(filtered);
        } else if (section === 'exercises') {
            const topic = document.getElementById('exercises-topic-filter').value;
            const query = document.getElementById('exercises-search').value;

            let filtered = this.exercises;
            if (topic) {
                filtered = filtered.filter(e => e.topic === topic);
            }
            if (query) {
                const searchResults = fuzzySearch.searchExercises(query);
                const searchIds = new Set(searchResults.map(r => r.id));
                filtered = filtered.filter(e => searchIds.has(e.id));
            }
            this.renderExercises(filtered);
        }
    }

    renderSlides(slides) {
        const container = document.getElementById('slides-container');

        if (slides.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-chalkboard"></i>
                    <p>No slides found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = slides.map(slide => `
            <div class="slide-card" data-slide-path="${slide.slidePath}" data-title="${slide.title}">
                <div class="slide-thumbnail">
                    <i class="fas fa-chalkboard-teacher"></i>
                </div>
                <div class="slide-info">
                    <h4>${slide.title}</h4>
                    <p>${slide.description || ''}</p>
                    ${slide.topic ? `<span class="slide-topic">${slide.topic}</span>` : ''}
                </div>
            </div>
        `).join('');

        // Add click handlers for slide viewing
        container.querySelectorAll('.slide-card').forEach(card => {
            card.addEventListener('click', () => {
                const slidePath = card.dataset.slidePath;
                const title = card.dataset.title;
                this.openSlideViewer(slidePath, title);
            });
        });
    }

    openSlideViewer(slidePath, title) {
        const modal = document.getElementById('slide-modal');
        const iframe = document.getElementById('slide-iframe');
        const titleEl = document.getElementById('slide-title');
        const openNewLink = document.getElementById('slide-open-new');

        titleEl.textContent = title;
        iframe.src = slidePath;
        openNewLink.href = slidePath;
        modal.classList.add('active');
    }

    renderNotes(notes) {
        const container = document.getElementById('notes-container');

        if (notes.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-sticky-note"></i>
                    <p>No notes found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = notes.map(note => `
            <div class="note-card">
                <h4><i class="fas fa-sticky-note"></i> ${note.title}</h4>
                <div class="note-content">${this.formatNoteContent(note.content)}</div>
                ${note.keywords ? `
                    <div class="note-keywords">
                        ${note.keywords.map(kw => `<span class="keyword-tag">${kw}</span>`).join('')}
                    </div>
                ` : ''}
                ${note.topic ? `<span class="note-topic">${note.topic}</span>` : ''}
            </div>
        `).join('');

        // Trigger MathJax to render math formulas
        if (window.MathJax) {
            MathJax.typesetPromise([container]).catch((err) => console.log('MathJax error:', err));
        }
    }

    formatNoteContent(content) {
        if (!content) return '';

        // Store code blocks and math to prevent interference
        const codeBlocks = [];
        const mathBlocks = [];
        const inlineMath = [];

        // Temporarily replace code blocks
        let formatted = content.replace(/```([\s\S]*?)```/g, (match, code) => {
            codeBlocks.push(code);
            return `__CODEBLOCK_${codeBlocks.length - 1}__`;
        });

        // Temporarily replace display math ($$...$$)
        formatted = formatted.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
            mathBlocks.push(math);
            return `__MATHBLOCK_${mathBlocks.length - 1}__`;
        });

        // Temporarily replace inline math ($...$)
        formatted = formatted.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
            inlineMath.push(math);
            return `__INLINEMATH_${inlineMath.length - 1}__`;
        });

        // Now process markdown
        formatted = formatted
            // Headers
            .replace(/^### (.+)$/gm, '<h4>$1</h4>')
            .replace(/^## (.+)$/gm, '<h3>$1</h3>')
            .replace(/^# (.+)$/gm, '<h3>$1</h3>')
            // Bold (before italic to avoid conflicts)
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
            // Inline code (backticks)
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Unordered lists
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            // Numbered lists
            .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
            // Line breaks
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');

        // Wrap consecutive <li> items in <ul>
        formatted = formatted.replace(/(<li>.*?<\/li>(?:<br>)?)+/g, (match) => {
            return '<ul>' + match.replace(/<br>/g, '') + '</ul>';
        });

        // Restore code blocks
        formatted = formatted.replace(/__CODEBLOCK_(\d+)__/g, (match, index) => {
            return `<pre><code>${codeBlocks[index]}</code></pre>`;
        });

        // Restore display math
        formatted = formatted.replace(/__MATHBLOCK_(\d+)__/g, (match, index) => {
            return `<div class="math-display">\\[${mathBlocks[index]}\\]</div>`;
        });

        // Restore inline math
        formatted = formatted.replace(/__INLINEMATH_(\d+)__/g, (match, index) => {
            return `<span class="math-inline">\\(${inlineMath[index]}\\)</span>`;
        });

        return formatted;
    }

    renderExercises(exercises) {
        const container = document.getElementById('exercises-container');

        if (exercises.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-pencil-alt"></i>
                    <p>No exercises found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = exercises.map((exercise, index) => `
            <div class="exercise-card">
                <div class="exercise-header">
                    <h4>${exercise.title}</h4>
                </div>
                <div class="exercise-question">${this.formatNoteContent(exercise.question)}</div>
                <div class="exercise-answer">
                    <button class="answer-toggle" data-index="${index}">
                        <i class="fas fa-eye"></i> Show Answer
                    </button>
                    <div class="answer-content" id="answer-${index}">
                        ${this.formatNoteContent(exercise.answer)}
                    </div>
                </div>
                ${exercise.topic ? `<span class="note-topic">${exercise.topic}</span>` : ''}
            </div>
        `).join('');

        // Add answer toggle handlers
        container.querySelectorAll('.answer-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = btn.dataset.index;
                const answerEl = document.getElementById(`answer-${index}`);
                const isVisible = answerEl.classList.contains('visible');

                answerEl.classList.toggle('visible');
                btn.innerHTML = isVisible
                    ? '<i class="fas fa-eye"></i> Show Answer'
                    : '<i class="fas fa-eye-slash"></i> Hide Answer';

                // Trigger MathJax when answer is shown
                if (!isVisible && window.MathJax) {
                    MathJax.typesetPromise([answerEl]).catch((err) => console.log('MathJax error:', err));
                }
            });
        });

        // Trigger MathJax to render math formulas in questions
        if (window.MathJax) {
            MathJax.typesetPromise([container]).catch((err) => console.log('MathJax error:', err));
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

