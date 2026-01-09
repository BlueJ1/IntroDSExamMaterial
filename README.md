# Intro DS Exam Prep Website

A static website for exam preparation that can be hosted on GitHub Pages. Features PDF lecture slides, notes, and past exam questions with fuzzy search capability.

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
│   └── exams.json         # Past exam questions & answers
├── slides/                 # PDF files go here
│   └── *.pdf
└── README.md
```

## 📚 Adding Content

### Adding Lecture Slides (PDFs)

1. Place your PDF files in the `slides/` directory
2. Update `data/slides.json` with the metadata:

```json
{
    "id": "slide-6",
    "title": "Lecture 6 - Classification",
    "description": "Logistic regression, decision trees, SVM, evaluation metrics",
    "topic": "Machine Learning",
    "pdfPath": "slides/lecture-06-classification.pdf",
    "keywords": ["classification", "logistic regression", "decision tree", "SVM"]
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

### Adding Exam Questions

Edit `data/exams.json` to add past exam questions:

```json
{
    "id": "exam-6",
    "title": "Question 6: Decision Tree Splitting",
    "year": 2024,
    "points": 10,
    "topic": "Machine Learning",
    "question": "Explain how a decision tree chooses the best feature to split on. Compare information gain and Gini impurity.",
    "answer": "**Decision trees split on features that maximize information gain or minimize Gini impurity...**\n\n**Information Gain:**\n- Based on entropy...",
    "keywords": ["decision tree", "information gain", "Gini", "entropy", "splitting"]
}
```

## 🔍 Search Features

The website uses **Fuse.js** for fuzzy search, which means:
- Typos are tolerated (e.g., "regressin" will find "regression")
- Partial matches work (e.g., "ML" can find "Machine Learning")
- Search works across all content types simultaneously

### Search Tips:
- Use the global search bar in the header to search everything
- Use section-specific search boxes to filter within that section
- Combine search with dropdown filters for precise results

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

Topics are automatically extracted from your content. Just add a new topic value to any slide, note, or exam question, and it will appear in the filter dropdowns.

## 📱 Features

- ✅ Responsive design (works on mobile)
- ✅ PDF viewer modal for lecture slides
- ✅ Fuzzy search across all content
- ✅ Topic and year filters
- ✅ Show/hide answers for exam questions
- ✅ Dashboard with content counts
- ✅ Keyboard shortcuts (Escape to close modals)

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
    "pdfPath": "string (path to PDF)",
    "keywords": ["array", "of", "strings"]
}
```

### Note Object
```json
{
    "id": "string (unique)",
    "title": "string",
    "topic": "string",
    "content": "string (supports markdown-like formatting)",
    "keywords": ["array", "of", "strings"]
}
```

### Exam Question Object
```json
{
    "id": "string (unique)",
    "title": "string",
    "year": "number",
    "points": "number",
    "topic": "string",
    "question": "string",
    "answer": "string",
    "keywords": ["array", "of", "strings"]
}
```

## 🎓 Good Luck with Your Exam!

This tool is designed to help you quickly access and search through your study materials during an open-internet exam. Make sure to:

1. Add all your lecture PDFs
2. Add comprehensive notes with relevant keywords
3. Include past exam questions for practice
4. Test the search functionality before your exam

---

Built with ❤️ for exam success

