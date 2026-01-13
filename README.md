# Intro DS Exam Prep Website

A static website for exam preparation that can be hosted on GitHub Pages: https://bluej1.github.io/IntroDSExamMaterial/. Features HTML lecture slides, notes, and exercises with fuzzy search capability and MathJax support for mathematical notation.

## 🚀 Quick Start

### Deploying to GitHub Pages

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial exam prep website"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "Deploy from a branch"
   - Choose `main` branch and `/ (root)` folder
   - Click Save

3. Your site will be available at: `https://[your-username].github.io/IntroDSExamMaterial/`

## 📁 Project Structure

```
IntroDSExamMaterial/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # Styling
├── js/
│   ├── app.js             # Main application logic
│   ├── data-loader.js     # Data loading module
│   └── search.js          # Fuzzy search module (uses Fuse.js)
├── data/
│   ├── slides.json        # Lecture slides metadata
│   ├── notes.json         # Notes content
│   └── exercises.json     # Exercises with questions & answers
├── slides/                 # HTML slide files go here
│   └── *.html
├── assets/                 # Images and other assets
│   └── *.png
├── past_exams/            # Past exam notebooks and solutions
│   ├── *.ipynb
│   ├── *.py
│   └── data/              # Data files for exams
└── README.md
```

## 📚 Adding Content

### Adding Lecture Slides (HTML)

1. Place your HTML slide files in the `slides/` directory
2. Update `data/slides.json` with the metadata:

```json
{
    "id": "slide-06",
    "title": "Lecture 06 - Fundamentals of Estimation",
    "description": "Introduction to estimation theory, bias, variance, MSE",
    "topic": "Estimation",
    "slidePath": "slides/06-Fundamentals_of_estimation.html",
    "keywords": ["estimation", "bias", "variance", "MSE", "estimator"]
}
```

### Adding Notes

Edit `data/notes.json` to add new notes:

```json
{
    "id": "note-6",
    "title": "Decision Trees",
    "topic": "Machine Learning",
    "content": "**Decision Trees** are a non-parametric supervised learning method...\n\n- Uses tree-like structure\n- Can handle both classification and regression\n- Easy to interpret\n\n```python\nfrom sklearn.tree import DecisionTreeClassifier\nclf = DecisionTreeClassifier()\nclf.fit(X_train, y_train)\n```",
    "keywords": ["decision tree", "classification", "regression", "CART", "entropy"]
}
```

**Formatting supported:**
- `**bold**` for bold text
- `*italic*` for italic text
- `` `code` `` for inline code
- Triple backticks for code blocks
- Newlines (`\n`) for line breaks
- LaTeX math: `$inline$` and `$$display$$`

### Adding Exercises

Edit `data/exercises.json` to add exercises with questions and answers:

```json
{
    "id": "exercise-1",
    "title": "Exercise 1: Independence of Complements",
    "topic": "Probability Theory",
    "question": "Suppose that A and B are independent events, show that $A^{c}$ and $B^{c}$ are independent.",
    "answer": "We want to show that $P(A^c \\cap B^c) = P(A^c)P(B^c)$...",
    "keywords": ["independence", "probability", "complements", "proof"]
}
```

**Math Support:**
- Inline math: `$x^2 + y^2 = 1$`
- Display math: `$$\\sum_{i=1}^{n} x_i$$`

## 🔍 Search Features

The website uses **Fuse.js** for fuzzy search, which means:
- Typos are tolerated (e.g., "regressin" will find "regression")
- Partial matches work (e.g., "ML" can find "Machine Learning")
- Search works across all content types simultaneously

### Search Tips:
- Use the global search bar in the header to search everything
- Use section-specific search boxes to filter within that section
- Combine search with topic filters for precise results

## 🎨 Customization

### Changing Colors

Edit the CSS variables in `css/style.css`:

```css
:root {
    --primary-color: #2563eb;    /* Main blue color */
    --secondary-color: #10b981;  /* Green accent */
    --accent-color: #f59e0b;     /* Orange/yellow accent */
    /* ... */
}
```

### Adding New Topics

Topics are automatically extracted from your content. Just add a new topic value to any slide, note, or exercise, and it will appear in the filter dropdowns.

## 📱 Features

- ✅ Responsive design (works on mobile)
- ✅ HTML slide viewer modal for lecture slides
- ✅ MathJax support for LaTeX mathematical notation
- ✅ Fuzzy search across all content
- ✅ Topic filters for all sections
- ✅ Show/hide answers for exercises
- ✅ Dashboard with content counts
- ✅ Keyboard shortcuts (Escape to close modals)
- ✅ Code syntax highlighting in notes and answers

## 🔧 Local Development

To test locally, you need a local server (browsers block file:// CORS for JSON):

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if http-server is installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 📋 Data Schema Reference

### Slide Object
```json
{
    "id": "string (unique)",
    "title": "string",
    "description": "string",
    "topic": "string",
    "slidePath": "string (path to HTML slide file)",
    "keywords": ["array", "of", "strings"]
}
```

### Note Object
```json
{
    "id": "string (unique)",
    "title": "string",
    "topic": "string",
    "content": "string (supports markdown-like formatting and LaTeX)",
    "keywords": ["array", "of", "strings"]
}
```

### Exercise Object
```json
{
    "id": "string (unique)",
    "title": "string",
    "topic": "string",
    "question": "string (supports LaTeX math)",
    "answer": "string (supports LaTeX math)",
    "keywords": ["array", "of", "strings"]
}
```

## 🎓 Good Luck with Your Exam!

This tool is designed to help you quickly access and search through your study materials during an open-internet exam. Make sure to:

1. Add all your lecture slides
2. Add comprehensive notes with relevant keywords
3. Include exercises for practice
4. Test the search functionality before your exam

---

Built with ❤️ for exam success
