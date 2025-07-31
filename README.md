# 📄 Resume Crafter With ATS Analysis

**Automated Resume Builder Optimized for Applicant Tracking Systems**  
Create ATS-friendly resumes, get real-time feedback, and export polished PDFs—all in one place.

---

## 🖼️ Project Screenshots  
| ![Home Page (Dark Mode)](static/project_screenshots/home_page_dark.png) | ![Create Resume](static/project_screenshots/create_resume.png) |  
|:--:|:--:|  
| **Home Page** | **Resume Editor** |  

| ![Login Page](static/project_screenshots/login_page.png) | ![Register Page](static/project_screenshots/register_page.png) |  
|:--:|:--:|  
| **User Login** | **Account Registration** |  

## 🚀 Key Features

- **📝 Smart Resume Builder**  
  Drag-and-drop sections with pre-optimized templates
- **🔍 ATS Scorecard**  
  Analyzes keyword density, section ordering, and readability
- **📊 Competency Matching**  
  Compares your resume against job descriptions
- **🎯 One-Click Optimization**  
  AI-powered suggestions to beat ATS filters
- **📤 Multi-Format Export**  
  PDF, Word, and plain text outputs

---

## � How It Works

1. **Upload/Template Start**  
   Begin with a blank template or import your existing resume
2. **Edit with Guidance**  
   Real-time ATS feedback highlights issues (red/yellow/green system)
3. **Job Description Scan** (Optional)  
   Paste a JD to get tailored optimization tips
4. **Export & Apply**  
   Download an ATS-optimized file with confidence

---

## 🛠️ Tech Stack

- **Backend**: Django + Django REST Framework
- **Frontend**: Tailwind + Bootsrap + CSS+
- **ATS Analysis**: NLP via spaCy/NLTK
- **Database**: MySQL (for structured resume data)
- **PDF Generation**: WeasyPrint

---

## � Installation

### Prerequisites
- Python 3.9+
- Django
- Weasyprint
- MySQL

### Setup
```bash
# Clone repo
git clone https://github.com/soaebhasan12/RESUME-CRAFTER-With-ATS-ANALYSIS.git
cd project_folder

# Backend
python -m venv .venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate

# Run (separate terminals)
python manage.py runserver
npm start
```

---

## 🧑‍💻 Admin Panel

Access at `/admin` after creating superuser:
```bash
python manage.py createsuperuser
```
**Admin Features**:
- Monitor user resume analytics
- Manage template library
- Update ATS keyword databases

---


## 🧠 ATS Optimization Rules

The system checks for:
✅ **Keyword Matching** (Hard skills > Soft skills)  
✅ **Section Order** (Experience → Education → Skills)  
✅ **Readability** (Bullet points, action verbs)  
✅ **Formatting** (No headers/footers, standard fonts)  
✅ **Length** (1-2 pages for most roles)  

---





## 🤝 Contributing

We welcome PRs! Please:
1. Open an issue to discuss changes
2. Fork the repository
3. Submit a pull request with tests

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

> 💡 **Pro Tip**: For best ATS results, focus on **position-specific keywords** and **quantifiable achievements**.  
> This tool surfaces what matters most—not just beautiful designs.

**Build resumes that get seen, not filtered.** ✨

