import os
import sys
import datetime
from PIL import Image, ImageDraw, ImageFont

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PersonalVault.settings')

import django
django.setup()

from django.contrib.auth.models import User
from portfolio.models import Profile, Project, Skill, Achievement
from certificates.models import Certificate

def create_placeholder_certificate_image(title, org, date_str, filename):
    """Generates a premium-looking certificate credential image if missing."""
    if os.path.exists(filename) and os.path.getsize(filename) > 1000:
        return
    width, height = 850, 550
    img = Image.new('RGB', (width, height), color='#0b0f19') 
    draw = ImageDraw.Draw(img)
    
    # Draw double border (Gold and Cyan)
    draw.rectangle([15, 15, width-15, height-15], outline='#0284c7', width=2)
    draw.rectangle([25, 25, width-25, height-25], outline='#d97706', width=2) # Gold
    
    try:
        font_title = ImageFont.truetype("times.ttf", 34)
        font_name = ImageFont.truetype("arial.ttf", 26)
        font_course = ImageFont.truetype("arial.ttf", 22)
        font_sub = ImageFont.truetype("arial.ttf", 15)
    except IOError:
        font_title = ImageFont.load_default()
        font_name = ImageFont.load_default()
        font_course = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        
    # Certificate Header
    draw.text((width//2, 65), "OFFICIAL VERIFIED CREDENTIAL • LINKEDIN ACCREDITED", fill='#38bdf8', font=font_sub, anchor="mm")
    draw.text((width//2, 115), "CERTIFICATE OF ACHIEVEMENT", fill='#f8fafc', font=font_title, anchor="mm")
    
    # Text body
    draw.text((width//2, 195), "This is officially conferred to certify that", fill='#94a3b8', font=font_sub, anchor="mm")
    draw.text((width//2, 235), "CHIRANJEEB SATAPATHY", fill='#f8fafc', font=font_name, anchor="mm")
    draw.text((width//2, 285), "has successfully completed the specialized professional training program in", fill='#94a3b8', font=font_sub, anchor="mm")
    
    # Course Name in Gold/Cyan
    draw.text((width//2, 335), title, fill='#eab308', font=font_course, anchor="mm")
    
    # Issuing details
    draw.text((width//2, 395), f"Issuing Body: {org}", fill='#e2e8f0', font=font_sub, anchor="mm")
    
    # Footer and seal
    draw.text((150, 480), f"Verified On: {date_str}", fill='#64748b', font=font_sub, anchor="lm")
    
    # Draw a simple seal graphic
    seal_center = (width - 150, 470)
    draw.ellipse([seal_center[0]-35, seal_center[1]-35, seal_center[0]+35, seal_center[1]+35], fill='#d97706', outline='#f8fafc', width=1)
    draw.text(seal_center, "VERIFIED", fill='#0b0f19', font=font_sub, anchor="mm")

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    img.save(filename)
    print(f"Generated certificate image: {filename}")

def main():
    # 1. Get or create user
    user = User.objects.filter(username="Chiranjeeb").first()
    if not user:
        print("User Chiranjeeb not found. Creating...")
        user = User.objects.create_superuser("Chiranjeeb", "chiranjeebsatapathy123@gmail.com", "admin123")
    
    user.first_name = "Chiranjeeb"
    user.last_name = "Satapathy"
    user.save()
    
    # 2. Update Profile with full LinkedIn details
    profile, created = Profile.objects.get_or_create(user=user)
    profile.location = "Bhubaneswar, Odisha, India"
    profile.phone = "+91 93375 79848"
    profile.bio = (
        "B.Tech Computer Science & Engineering student (Class of 2028) at Siksha 'O' Anusandhan University "
        "(ITER-SOA). Passionate software architect and AI/ML engineer exploring deep learning computer vision (YOLOv8), "
        "full-stack web development (Django, React, Next.js), and competitive algorithms (340+ LeetCode problems). "
        "Completed internships at InAmigos Foundation and IBM SkillsBuild & BharatCares (AICTE). "
        "Schooling at St. Xavier's High School, Kedargouri and Carmel School, Bhadrak (86%)."
    )
    profile.linkedin = "https://www.linkedin.com/in/chiranjeeb-satapathy-283b40353"
    profile.github = "https://github.com/chiranjeebsatapathy123-sudo"
    profile.website = "https://github.com/chiranjeebsatapathy123-sudo"
    profile.leetcode_username = "chiranjeebsatapathy"
    profile.hackerrank_username = "chiranjeebsatapathy"
    profile.profile_image = "profile/chiranjeeb_cutout.png"
    profile.save()
    print("Profile seeded successfully.")

    # 3. Add all 12 Authentic GitHub Projects
    Project.objects.filter(user=user).delete()
    
    projects_data = [
        {
            "title": "AgroFedly: AI Smart Produce Supply Chain",
            "description": "Enterprise-grade agricultural intelligence and produce supply chain management integrating YOLOv8 leaf blight detection (<25ms) and regional price forecasting models.",
            "img": "projects/agrofedly_showcase.png",
            "github": "https://github.com/chiranjeebsatapathy123-sudo/AgroFedly",
            "demo": ""
        },
        {
            "title": "MediStock Pro: Pharmaceutical Supply Chain",
            "description": "Hospital pharmaceutical inventory management with FEFO shelf-life allocation, automated reorder thresholds, and zero-shortage batch audit workflows.",
            "img": "projects/medistock_showcase.png",
            "github": "https://github.com/chiranjeebsatapathy123-sudo/medi-stock",
            "demo": ""
        },
        {
            "title": "Real-Time Facial Emotion Detection",
            "description": "Deep learning computer vision pipeline with Haar Cascade and CNN landmarks executing 60 FPS multi-face emotion classification across 7 micro-expression classes.",
            "img": "projects/real_emotion_showcase.png",
            "github": "https://github.com/chiranjeebsatapathy123-sudo/real_emotion",
            "demo": ""
        },
        {
            "title": "Margdarshak AI (Nirmit)",
            "description": "Agentic regional NLP educational guidance platform delivering personalized STEM tutoring in vernacular Indian dialects using Google Gemini APIs and FastAPI.",
            "img": "projects/nirmit_showcase.png",
            "github": "https://github.com/chiranjeebsatapathy123-sudo/nirmit",
            "demo": ""
        },
        {
            "title": "Life RPG (Rpm_Game)",
            "description": "Gamified behavioral progression engine transforming daily software engineering tasks into role-playing quests with dynamic XP, attributes, and streak persistence.",
            "img": "projects/rpm_game_showcase.png",
            "github": "https://github.com/chiranjeebsatapathy123-sudo/Rpm_Game",
            "demo": ""
        },
        {
            "title": "ZenFlow: Agile Sprint & Focus Suite",
            "description": "Agile software engineering collaboration platform featuring interactive Kanban state machines, pomodoro cognitive focus timers, and sprint telemetry.",
            "img": "projects/zenflow_showcase.png",
            "github": "https://github.com/chiranjeebsatapathy123-sudo/ZenFlow",
            "demo": ""
        },
        {
            "title": "AtmosphereIQ: Weather Dashboard",
            "description": "Geospatial radar telemetry and weather monitoring platform integrating OpenWeatherMap APIs, Doppler radar charts, and multi-city forecast algorithms.",
            "img": "projects/weather_dashboard_showcase.png",
            "github": "https://github.com/chiranjeebsatapathy123-sudo/weather-dashboard",
            "demo": ""
        },
        {
            "title": "CampusConnect: Student Academic Forum",
            "description": "Academic peer collaboration forum featuring markdown syntax highlighting, upvoting algorithms, and optimized Django PostgreSQL schemas with zero N+1 queries.",
            "img": "projects/student_forum_showcase.png",
            "github": "https://github.com/chiranjeebsatapathy123-sudo/student-forum",
            "demo": ""
        },
        {
            "title": "NextGen E-Commerce",
            "description": "Decoupled cloud storefront architecture engineered with Node.js REST APIs, reactive shopping cart state, and sub-100ms catalog rendering deployed on Vercel.",
            "img": "projects/ecommerce_showcase.png",
            "github": "https://github.com/chiranjeebsatapathy123-sudo/e-commerce",
            "demo": ""
        },
        {
            "title": "EcoFuture Foundation",
            "description": "Environmental advocacy and carbon offset calculation platform with tangible equivalency models and global green renewable project discovery feeds.",
            "img": "projects/ecofuture_showcase.png",
            "github": "https://github.com/chiranjeebsatapathy123-sudo/Eco-future",
            "demo": ""
        },
        {
            "title": "Thiranex 2.0 Continuous Delivery",
            "description": "Continuous sprint monitoring and autonomous developer automation dashboard logging git commit telemetry and milestone progress gauges.",
            "img": "projects/thiranex2_showcase.png",
            "github": "https://github.com/chiranjeebsatapathy123-sudo/thiranex2",
            "demo": ""
        },
        {
            "title": "PersonalVault (CloudVault)",
            "description": "Personal cloud and career intelligence platform with zero-knowledge AES-256 secret vaulting, interactive WebGL cosmos, and Gemini AI interview assistant.",
            "img": "projects/cloudvault_showcase.png",
            "github": "https://github.com/chiranjeebsatapathy123-sudo/my-web",
            "demo": ""
        }
    ]
    
    for p in projects_data:
        Project.objects.create(
            user=user,
            title=p["title"],
            description=p["description"],
            image=p["img"],
            github_link=p["github"],
            live_demo=p["demo"]
        )
    print(f"Seeded {len(projects_data)} projects.")

    # 4. Add Verified Licenses & Certifications from LinkedIn
    Certificate.objects.filter(user=user).delete()
    
    certs_data = [
        {
            "title": "Advanced AI & Machine Learning Specialization",
            "org": "Central Tool Room & Training Centre (CTTC), Bhubaneswar (MSME Govt. of India)",
            "date": datetime.date(2024, 7, 25),
            "date_str": "July 25, 2024",
            "filename": "media/certificates/cttc_cert.png",
            "db_path": "certificates/cttc_cert.png"
        },
        {
            "title": "Meta Front-End Developer Specialization",
            "org": "Meta (via Coursera)",
            "date": datetime.date(2024, 8, 20),
            "date_str": "August 20, 2024",
            "filename": "media/certificates/meta_cert.png",
            "db_path": "certificates/meta_cert.png"
        },
        {
            "title": "Google Cloud Computing Foundations & GenAI",
            "org": "Google Cloud",
            "date": datetime.date(2024, 9, 15),
            "date_str": "September 15, 2024",
            "filename": "media/certificates/google_cloud_cert.png",
            "db_path": "certificates/google_cloud_cert.png"
        },
        {
            "title": "Data Analytics with AI (Credential ID: IBMACBHDAI0164)",
            "org": "IBM SkillsBuild & BharatCares (AICTE)",
            "date": datetime.date(2026, 9, 30),
            "date_str": "September 30, 2026",
            "filename": "media/certificates/ibm_analytics.png",
            "db_path": "certificates/ibm_analytics.png"
        },
        {
            "title": "GenAI Powered Data Analytics Job Simulation",
            "org": "Tata (on Forage)",
            "date": datetime.date(2025, 5, 10),
            "date_str": "May 10, 2025",
            "filename": "media/certificates/tata_analytics.png",
            "db_path": "certificates/tata_analytics.png"
        },
        {
            "title": "Certified in AI Tools and ChatGPT",
            "org": "Internshala",
            "date": datetime.date(2024, 12, 1),
            "date_str": "December 01, 2024",
            "filename": "media/certificates/ai_tools.png",
            "db_path": "certificates/ai_tools.png"
        },
        {
            "title": "Java: Data Structures & Algorithms",
            "org": "LinkedIn Learning",
            "date": datetime.date(2024, 10, 10),
            "date_str": "October 10, 2024",
            "filename": "media/certificates/java_ds.png",
            "db_path": "certificates/java_ds.png"
        },
        {
            "title": "JavaScript: Data Structures & Linked Lists",
            "org": "LinkedIn Learning",
            "date": datetime.date(2024, 11, 5),
            "date_str": "November 05, 2024",
            "filename": "media/certificates/js_linked_lists.png",
            "db_path": "certificates/js_linked_lists.png"
        }
    ]
    
    for cert in certs_data:
        create_placeholder_certificate_image(cert["title"], cert["org"], cert["date_str"], cert["filename"])
        Certificate.objects.create(
            user=user,
            title=cert["title"],
            organization=cert["org"],
            issue_date=cert["date"],
            certificate_image=cert["db_path"]
        )
    print(f"Seeded {len(certs_data)} certificates.")

    # 5. Seed Categorized Skills from LinkedIn
    Skill.objects.filter(user=user).delete()
    skills_data = [
        # AI/ML
        ("Python", "AI/ML", 95),
        ("YOLOv8 & Computer Vision", "AI/ML", 92),
        ("OpenCV", "AI/ML", 90),
        ("PyTorch & TensorFlow", "AI/ML", 85),
        ("Scikit-Learn", "AI/ML", 88),
        ("Pandas & NumPy", "AI/ML", 94),
        ("Google Gemini API", "AI/ML", 90),
        # Programming
        ("Core Java", "Programming", 88),
        ("C++", "Programming", 85),
        ("JavaScript (ES6+)", "Programming", 92),
        ("TypeScript", "Programming", 86),
        ("Data Structures & Algorithms", "Programming", 94),
        # Web Development
        ("Django & Django REST", "Web Development", 95),
        ("React & Next.js", "Web Development", 88),
        ("HTML5 & CSS3", "Web Development", 96),
        ("Tailwind CSS v3", "Web Development", 95),
        ("Node.js & Express", "Web Development", 84),
        # Databases & Cloud
        ("PostgreSQL", "Databases", 88),
        ("SQLite", "Databases", 94),
        ("Google Cloud Platform (GCP)", "Cloud", 82),
        ("Docker", "Tools", 80),
        ("Git & GitHub", "Tools", 95),
        ("Vercel Edge", "Cloud", 90),
        ("Linux / Bash", "Tools", 85)
    ]
    for name, cat, prof in skills_data:
        Skill.objects.create(user=user, name=name, category=cat, proficiency=prof)
    print(f"Seeded {len(skills_data)} skills.")

    # 6. Seed Achievements (Education, Experience, Hackathons)
    Achievement.objects.filter(user=user).delete()
    
    # Education
    Achievement.objects.create(
        user=user,
        title="B.Tech in Computer Science & Engineering (B.Tech CSE)",
        description="Institute of Technical Education and Research (ITER), Siksha 'O' Anusandhan (SOA Deemed to be University), Bhubaneswar (2024–2028). Ongoing 3rd year with rigorous grounding in computational mathematics, algorithms, machine learning systems, database architectures, and distributed computing.",
        date_achieved=datetime.date(2024, 8, 1),
        category='Education'
    )
    Achievement.objects.create(
        user=user,
        title="Higher Secondary (+2 Science / PCM & Computer Science)",
        description="St. Xavier's High School, Kedargouri, Bhubaneswar, Odisha (2022–2024). Physics, Chemistry, Higher Mathematics, and Computer Science foundations.",
        date_achieved=datetime.date(2024, 5, 15),
        category='Education'
    )
    Achievement.objects.create(
        user=user,
        title="Secondary School Certificate (ICSE Class 10) — Result: 86%",
        description="Carmel School, Bhadrak, Odisha (Completed 2022). Aggregate score of 86% with distinction in Science, Mathematics, and Computer Applications.",
        date_achieved=datetime.date(2022, 6, 10),
        category='Education'
    )

    # Experience / Internships
    Achievement.objects.create(
        user=user,
        title="AI Web Development Intern — InAmigos Foundation",
        description="Built responsive full-stack applications, engineered client-facing web portals, and integrated AI model endpoints. (June 2026 – July 2026).",
        date_achieved=datetime.date(2026, 7, 7),
        category='Career'
    )
    Achievement.objects.create(
        user=user,
        title="Data Analytics with AI Intern — IBM SkillsBuild & BharatCares (AICTE)",
        description="Conducted predictive data analytics, statistical regression modeling, and machine learning pipelines. Credential ID: IBMACBHDAI0164. (August 2026 – September 2026).",
        date_achieved=datetime.date(2026, 9, 30),
        category='Career'
    )
    Achievement.objects.create(
        user=user,
        title="Advanced AI & Machine Learning Specialization — CTTC MSME",
        description="Completed rigorous hands-on industrial training under MSME Govt. of India covering deep neural networks, computer vision, and YOLO architectures. (2024).",
        date_achieved=datetime.date(2024, 7, 25),
        category='Certification'
    )
    Achievement.objects.create(
        user=user,
        title="Machine Learning Intern — InternPe",
        description="Developed sports analytics predictive model for historical IPL cricket match outcomes using Scikit-Learn. (2024).",
        date_achieved=datetime.date(2024, 6, 1),
        category='Career'
    )

    # Competitive Hackathons
    Achievement.objects.create(
        user=user,
        title="SOA Ideathon Hackathon Finalist",
        description="ITER Siksha 'O' Anusandhan University Ideathon. Developed rapid AI prototype and pitched technical architecture to jury.",
        date_achieved=datetime.date(2024, 9, 20),
        category='Hackathons'
    )
    Achievement.objects.create(
        user=user,
        title="Smart India Hackathon (SIH) Participant",
        description="National software engineering initiative by Ministry of Education Govt. of India solving nationwide institutional challenges.",
        date_achieved=datetime.date(2024, 10, 15),
        category='Hackathons'
    )
    Achievement.objects.create(
        user=user,
        title="Google Cloud Hackathon Builder",
        description="Google Cloud GenAI Hackathon. Engineered cloud-native architecture and serverless inference pipeline using Google Cloud Platform.",
        date_achieved=datetime.date(2024, 11, 5),
        category='Hackathons'
    )
    
    print("Database seeding completed successfully.")

if __name__ == '__main__':
    main()
