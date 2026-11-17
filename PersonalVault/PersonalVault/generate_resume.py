import os
import sys
from PIL import Image, ImageDraw, ImageFont

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PersonalVault.settings')

import django
django.setup()

from django.contrib.auth.models import User
from resume.models import Resume

def generate_resume_pdf(output_path):
    # High-resolution A4-proportional canvas: 1240 x 1860
    width, height = 1240, 1860
    img = Image.new('RGB', (width, height), color='#ffffff')
    draw = ImageDraw.Draw(img)
    
    # Define color scheme
    primary_color = '#0b0f19' # Dark Navy/Slate
    accent_color = '#0284c7'  # Sky Blue / Tech Accent
    text_dark = '#0f172a'     # Slate-900
    text_color = '#334155'    # Slate-700
    light_bg = '#f8fafc'      # Slate-50
    line_color = '#e2e8f0'    # Slate-200
    tag_bg = '#f1f5f9'
    
    # Load fonts
    try:
        font_bold_huge = ImageFont.truetype("arial.ttf", 44)
        font_bold_large = ImageFont.truetype("arial.ttf", 22)
        font_bold_medium = ImageFont.truetype("arial.ttf", 17)
        font_regular = ImageFont.truetype("arial.ttf", 15)
        font_italic = ImageFont.truetype("arial.ttf", 14)
        font_small = ImageFont.truetype("arial.ttf", 13)
    except IOError:
        font_bold_huge = ImageFont.load_default()
        font_bold_large = ImageFont.load_default()
        font_bold_medium = ImageFont.load_default()
        font_regular = ImageFont.load_default()
        font_italic = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Draw header background
    draw.rectangle([0, 0, width, 255], fill=primary_color)
    
    # Name and Title
    draw.text((70, 38), "CHIRANJEEB SATAPATHY", fill='#ffffff', font=font_bold_huge)
    draw.text((70, 95), "Computer Science Engineer | AI/ML & Distributed Full-Stack Systems", fill='#38bdf8', font=font_bold_large)
    
    # Contact Info with icons/labels
    draw.text((70, 150), "Email: chiranjeebsatapathy123@gmail.com", fill='#e2e8f0', font=font_regular)
    draw.text((540, 150), "Phone: +91 93375 79848  |  Bhubaneswar, Odisha, India", fill='#e2e8f0', font=font_regular)
    draw.text((70, 185), "LinkedIn: linkedin.com/in/chiranjeeb-satapathy-283b40353", fill='#93c5fd', font=font_regular)
    draw.text((540, 185), "GitHub: github.com/chiranjeebsatapathy123-sudo (12 Repositories)", fill='#93c5fd', font=font_regular)
    draw.text((70, 218), "Portfolio: chiranjeebsatapathy.me  |  LeetCode: 340+ Problems Conquered", fill='#cbd5e1', font=font_small)

    # Paste User Photo at Top-Right
    try:
        photo_path = os.path.join("media", "profile", "chiranjeeb_photo.jpg")
        if os.path.exists(photo_path):
            photo = Image.open(photo_path).convert("RGBA")
            photo = photo.resize((150, 150), Image.Resampling.LANCZOS)
            # Create rounded circle mask
            mask = Image.new('L', (150, 150), 0)
            mask_draw = ImageDraw.Draw(mask)
            mask_draw.ellipse((0, 0, 150, 150), fill=255)
            # Draw subtle outline ring
            draw.ellipse((1028, 48, 1182, 202), outline='#38bdf8', width=3)
            img.paste(photo, (1030, 50), mask)
    except Exception as e:
        print(f"Error drawing profile photo: {e}")

    y_pos = 285
    
    def draw_section_header(title):
        nonlocal y_pos
        draw.text((70, y_pos), title.upper(), fill=accent_color, font=font_bold_large)
        draw.line([70, y_pos + 28, width - 70, y_pos + 28], fill=line_color, width=2)
        y_pos += 44

    # 1. Summary
    draw_section_header("Professional Summary")
    summary_lines = [
        "Passionate Computer Science & Engineering undergraduate at ITER, Siksha 'O' Anusandhan (SOA University) with demonstrated expertise in",
        "Artificial Intelligence, Deep Learning Computer Vision (YOLOv8, OpenCV), and scalable Full-Stack Web Platforms (Django, React, Next.js).",
        "Completed industry software internships at InAmigos Foundation and IBM SkillsBuild/AICTE. Active competitive programmer with 340+ LeetCode",
        "problems solved and 12 production GitHub repositories. Seeking high-impact software engineering and AI/ML development roles."
    ]
    for line in summary_lines:
        draw.text((70, y_pos), line, fill=text_color, font=font_regular)
        y_pos += 21
    y_pos += 12

    # 2. Education
    draw_section_header("Education")
    # Undergrad
    draw.text((70, y_pos), "B.Tech in Computer Science & Engineering (B.Tech CSE)", fill=text_dark, font=font_bold_medium)
    draw.text((width - 290, y_pos), "2024 – 2028 (Ongoing 3rd Year)", fill=text_color, font=font_regular)
    y_pos += 22
    draw.text((70, y_pos), "Institute of Technical Education and Research (ITER) — Siksha 'O' Anusandhan (SOA Deemed to be University), Bhubaneswar", fill=text_color, font=font_italic)
    y_pos += 20
    draw.text((70, y_pos), "Coursework: Data Structures & Algorithms, Machine Learning Systems, Database Management (DBMS), Operating Systems, Cloud Architectures", fill=text_color, font=font_small)
    y_pos += 28

    # High School
    draw.text((70, y_pos), "Higher Secondary Education (+2 Science / PCM & Computer Science)", fill=text_dark, font=font_bold_medium)
    draw.text((width - 290, y_pos), "2022 – 2024", fill=text_color, font=font_regular)
    y_pos += 22
    draw.text((70, y_pos), "St. Xavier's High School, Kedargouri, Bhubaneswar, Odisha — Higher Secondary Science Stream (Physics, Chemistry, Mathematics, CS)", fill=text_color, font=font_italic)
    y_pos += 28

    # Secondary School
    draw.text((70, y_pos), "Secondary School Certificate (ICSE Class 10) — Aggregate Score: 86%", fill=text_dark, font=font_bold_medium)
    draw.text((width - 290, y_pos), "Completed 2022", fill=text_color, font=font_regular)
    y_pos += 22
    draw.text((70, y_pos), "Carmel School, Bhadrak, Odisha — Academic Distinction in Mathematics, Science & Computer Applications (86%)", fill=text_color, font=font_italic)
    y_pos += 34

    # 3. Experience & Internships
    draw_section_header("Internships & Industrial Experience (LinkedIn Verified)")
    
    experiences = [
        ("AI Web Development Intern", "InAmigos Foundation (Remote)", "June 2026 – July 2026", 
         "Engineered responsive full-stack modules and integrated intelligent REST AI endpoints with low latency. Verified credential."),
        ("Data Analytics with AI Intern", "IBM SkillsBuild & BharatCares (AICTE)", "Aug 2026 – Sept 2026", 
         "Conducted predictive data analytics, statistical regression models, and automated machine learning dashboards. Credential ID: IBMACBHDAI0164."),
        ("Advanced AI & Machine Learning Specialization", "CTTC Bhubaneswar (MSME Govt. of India)", "2024", 
         "In-depth industrial training on convolutional neural networks (CNNs), deep computer vision, transfer learning, and model deployment."),
        ("Machine Learning Intern", "InternPe", "2024",
         "Developed predictive machine learning algorithms on cricket sports analytics datasets using Scikit-Learn and Random Forest classifiers.")
    ]
    
    for title, org, date, desc in experiences:
        draw.text((70, y_pos), f"{title}  |  {org}", fill=text_dark, font=font_bold_medium)
        draw.text((width - 280, y_pos), date, fill=text_color, font=font_regular)
        y_pos += 22
        draw.text((70, y_pos), f"• {desc}", fill=text_color, font=font_regular)
        y_pos += 26
        
    y_pos += 10

    # 4. Hackathons & Ideathons
    draw_section_header("Competitive Hackathons & Innovation Challenges")
    hackathons = [
        ("SOA Ideathon Hackathon Finalist", "ITER Siksha 'O' Anusandhan University", "2024",
         "Pitched rapid technical AI prototype solution and architectural design to university jury."),
        ("Smart India Hackathon (SIH) Participant", "Ministry of Education Govt. of India", "2024",
         "Tackled national governance problem statements through rapid agile prototyping and team collaboration."),
        ("Google Cloud Hackathon Builder", "Google Cloud GenAI Challenge", "2024",
         "Constructed distributed cloud-native architecture and serverless inference pipeline using Google Cloud.")
    ]
    for title, org, date, desc in hackathons:
        draw.text((70, y_pos), f"{title}  |  {org}", fill=text_dark, font=font_bold_medium)
        draw.text((width - 280, y_pos), date, fill=text_color, font=font_regular)
        y_pos += 21
        draw.text((70, y_pos), f"• {desc}", fill=text_color, font=font_regular)
        y_pos += 25
    y_pos += 10

    # 5. Verified Licenses & Certifications
    draw_section_header("Verified Licenses & Certifications (LinkedIn Synced)")
    certs = [
        ("Advanced AI & Machine Learning Specialization", "CTTC Bhubaneswar (MSME Govt. of India)", "2024"),
        ("Meta Front-End Developer Specialization", "Meta / Coursera Professional Certificate", "2024"),
        ("Google Cloud Computing Foundations & GenAI", "Google Cloud Credentials", "2024"),
        ("Data Analytics with AI Credential", "IBM SkillsBuild & BharatCares (AICTE) — ID: IBMACBHDAI0164", "2026"),
        ("GenAI Powered Data Analytics Job Simulation", "Tata / Forage Virtual Internship", "2025"),
        ("Java & JavaScript: Data Structures Mastery", "LinkedIn Learning Verified Certificates", "2024")
    ]
    for title, org, date in certs:
        draw.text((70, y_pos), f"• {title} — {org}", fill=text_dark, font=font_regular)
        draw.text((width - 200, y_pos), date, fill=text_color, font=font_small)
        y_pos += 22
    y_pos += 12

    # 6. Key Production Projects (from 12 GitHub Repos)
    draw_section_header("Featured Engineering Projects (12 GitHub Repositories)")
    projects = [
        ("AgroFedly: AI Smart Produce Supply Chain", "Python, YOLOv8, Django REST, Docker, PostgreSQL",
         "Integrated YOLOv8 real-time leaf blight disease detection (<25ms) with regional market price volatility forecasting."),
        ("MediStock Pro: Pharmaceutical Inventory & Alerts", "Python, Django REST, JavaScript, Vercel",
         "Hospital medicine shelf-life tracking, FEFO batch expiry alerts, and automated threshold restock dispatch."),
        ("Real Emotion: 60 FPS Micro-Expression Neural Pipeline", "Python, OpenCV, Haar-Cascade, CNN, PyTorch",
         "Real-time webcam facial landmark tracking and 7-emotion softmax classification with live confidence telemetry."),
        ("ZenFlow: Agile Sprint & Cognitive Deep Work Suite", "TypeScript, React, Next.js, Tailwind CSS, Vercel",
         "High-performance Kanban state machine with pomodoro focus telemetry and ambient soundscape synthesis.")
    ]
    for title, tech, desc in projects:
        draw.text((70, y_pos), title, fill=text_dark, font=font_bold_medium)
        draw.text((width - 450, y_pos), f"[{tech}]", fill='#0369a1', font=font_small)
        y_pos += 21
        draw.text((70, y_pos), f"• {desc}", fill=text_color, font=font_regular)
        y_pos += 25
    y_pos += 10

    # 7. Technical Skills & Toolkit
    draw_section_header("Technical Toolkit & Core Competencies")
    skills_map = [
        ("Languages:", "Python (Advanced), Java (Core), JavaScript (ES6+), TypeScript, C++, C, SQL"),
        ("AI / ML & Vision:", "YOLOv8, OpenCV, PyTorch, TensorFlow, Scikit-Learn, Pandas, NumPy, Google Gemini API"),
        ("Web & Backend:", "Django, Django REST Framework, Node.js, Express, React, Next.js, HTML5/CSS3, Tailwind CSS"),
        ("Cloud & Tools:", "Google Cloud Platform (GCP), Docker, Vercel Edge, Git/GitHub, Linux/Bash, SQLite, PostgreSQL")
    ]
    for label, val in skills_map:
        draw.text((70, y_pos), label, fill=text_dark, font=font_bold_medium)
        draw.text((250, y_pos), val, fill=text_color, font=font_regular)
        y_pos += 22

    # Ensure folder structure exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PDF", quality=100)
    print(f"Resume PDF generated at: {output_path}")

def main():
    user = User.objects.filter(username="Chiranjeeb").first()
    if not user:
        print("Superuser 'Chiranjeeb' not found.")
        return
        
    resume_media_path = os.path.join("media", "resume", "chiranjeeb_resume.pdf")
    generate_resume_pdf(resume_media_path)
    
    # Register in Resume model
    Resume.objects.filter(user=user).delete()
    Resume.objects.create(
        user=user,
        title="Chiranjeeb Satapathy - CV",
        file="resume/chiranjeeb_resume.pdf"
    )
    print("Resume registered in Django database successfully.")

if __name__ == '__main__':
    main()
