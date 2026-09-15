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
from portfolio.models import Profile, Project
from certificates.models import Certificate

def create_placeholder_project_image(title, tech_list, filename):
    """Generates a premium-looking project preview card image."""
    width, height = 800, 500
    img = Image.new('RGB', (width, height), color='#1e293b') # Slate-800
    draw = ImageDraw.Draw(img)

    # Draw code window decoration (header bar)
    draw.rectangle([0, 0, width, 45], fill='#0f172a') # Slate-900 header
    # Window control dots (mac-style)
    draw.ellipse([20, 15, 32, 27], fill='#ef4444') # Red
    draw.ellipse([42, 15, 54, 27], fill='#eab308') # Yellow
    draw.ellipse([64, 15, 76, 27], fill='#22c55e') # Green
    
    # Try to load fonts
    try:
        font_large = ImageFont.truetype("arial.ttf", 36)
        font_medium = ImageFont.truetype("arial.ttf", 22)
        font_small = ImageFont.truetype("arial.ttf", 16)
    except IOError:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Draw project name
    draw.text((50, 120), title, fill='#f8fafc', font=font_large) # White
    
    # Draw coding mockup text
    draw.text((50, 180), "class PortfolioProject {", fill='#6366f1', font=font_medium)
    draw.text((80, 220), f"title = \"{title}\";", fill='#e2e8f0', font=font_medium)
    draw.text((80, 260), f"stack = {str(tech_list)};", fill='#e2e8f0', font=font_medium)
    draw.text((80, 300), "status = \"Production / Live\";", fill='#10b981', font=font_medium)
    draw.text((50, 340), "}", fill='#6366f1', font=font_medium)

    # Draw tech stack badges at the bottom
    x_offset = 50
    for tech in tech_list:
        text_w = draw.textlength(tech, font=font_small) if hasattr(draw, "textlength") else len(tech)*9
        # Draw tag background
        draw.rounded_rectangle([x_offset, 400, x_offset + text_w + 24, 432], radius=6, fill='#334155', outline='#6366f1', width=1)
        # Draw tag text
        draw.text((x_offset + 12, 407), tech, fill='#a855f7', font=font_small)
        x_offset += text_w + 35

    # Ensure output directory exists
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    img.save(filename)
    print(f"Generated project image: {filename}")

def create_placeholder_certificate_image(title, org, date_str, filename):
    """Generates a premium-looking certificate credential image."""
    width, height = 850, 550
    # Create canvas with rich blue/black background
    img = Image.new('RGB', (width, height), color='#0b0f19') 
    draw = ImageDraw.Draw(img)
    
    # Draw double border (Gold and Indigo)
    draw.rectangle([15, 15, width-15, height-15], outline='#6366f1', width=2)
    draw.rectangle([25, 25, width-25, height-25], outline='#d97706', width=2) # Gold
    
    # Try to load fonts
    try:
        font_title = ImageFont.truetype("times.ttf", 36) # Serif for certificate header
        font_name = ImageFont.truetype("arial.ttf", 28)
        font_course = ImageFont.truetype("arial.ttf", 24)
        font_sub = ImageFont.truetype("arial.ttf", 16)
    except IOError:
        font_title = ImageFont.load_default()
        font_name = ImageFont.load_default()
        font_course = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        
    # Certificate Header
    draw.text((width//2, 70), "VERIFIED CREDENTIAL", fill='#d97706', font=font_sub, anchor="mm")
    draw.text((width//2, 120), "CERTIFICATE OF COMPLETION", fill='#f8fafc', font=font_title, anchor="mm")
    
    # Text body
    draw.text((width//2, 200), "This is to certify that", fill='#94a3b8', font=font_sub, anchor="mm")
    draw.text((width//2, 240), "Chiranjeeb Satapathy", fill='#f8fafc', font=font_name, anchor="mm")
    draw.text((width//2, 290), "has successfully completed the online training program", fill='#94a3b8', font=font_sub, anchor="mm")
    
    # Course Name in Gold/White
    draw.text((width//2, 340), title, fill='#eab308', font=font_course, anchor="mm")
    
    # Issuing details
    draw.text((width//2, 400), f"Offered by: {org}", fill='#e2e8f0', font=font_sub, anchor="mm")
    
    # Footer and seal
    draw.text((150, 480), f"Issued on: {date_str}", fill='#64748b', font=font_sub, anchor="lm")
    
    # Draw a simple seal graphic
    seal_center = (width - 150, 470)
    draw.ellipse([seal_center[0]-35, seal_center[1]-35, seal_center[0]+35, seal_center[1]+35], fill='#d97706', outline='#f8fafc', width=1)
    draw.text(seal_center, "VERIFIED", fill='#0b0f19', font=font_sub, anchor="mm")

    # Ensure output directory exists
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
    
    # 2. Update Profile
    profile, created = Profile.objects.get_or_create(user=user)
    profile.location = "Bhubaneswar, Odisha, India"
    profile.phone = "+91 7978250000"
    profile.bio = (
        "B.Tech Computer Science Engineering student (Class of 2028) at Siksha 'O' Anusandhan University "
        "(ITER-SOA) with a passion for Artificial Intelligence, Machine Learning, Web Development, "
        "and Computer Vision. Actively exploring software engineering patterns and algorithmic problem-solving."
    )
    profile.linkedin = "https://www.linkedin.com/in/chiranjeeb-satapathy-283b40353"
    profile.github = "https://github.com/chiranjeeb-satapathy"
    profile.website = "https://github.com/chiranjeeb-satapathy"
    
    # Ensure profile image exists
    media_profile_dir = os.path.join("media", "profile")
    os.makedirs(media_profile_dir, exist_ok=True)
    avatar_path = os.path.join(media_profile_dir, "ai_avatar.png")
    
    # If ai_avatar.png doesn't exist, draw a beautiful initials circle
    if not os.path.exists(avatar_path):
        avatar = Image.new('RGB', (300, 300), color='#6366f1')
        draw = ImageDraw.Draw(avatar)
        try:
            font = ImageFont.truetype("arial.ttf", 100)
        except IOError:
            font = ImageFont.load_default()
        draw.text((150, 150), "CS", fill='#ffffff', font=font, anchor="mm")
        avatar.save(avatar_path)
    
    profile.profile_image = "profile/ai_avatar.png"
    profile.save()
    print("Profile seeded successfully.")

    # 3. Add Projects
    Project.objects.filter(user=user).delete() # Clear existing projects to avoid duplicates
    
    projects_data = [
        {
            "title": "AI-Powered Football VAR System",
            "description": (
                "A computer vision and deep learning project designed to automate referee decisions in football (soccer). "
                "Utilizes YOLOv8 for player and ball detection, OpenCV for coordinate tracking, pitch line registration, and "
                "offside line generation. Built with Python to process match video feeds in real-time."
            ),
            "tech": ["Python", "YOLOv8", "OpenCV", "Deep Learning"],
            "img_filename": "media/projects/var_football.png",
            "db_img_path": "projects/var_football.png",
            "github": "https://github.com/chiranjeeb-satapathy/football-var",
            "demo": ""
        },
        {
            "title": "IPL Prediction Project",
            "description": (
                "An AI/ML machine learning predictive model developed during an internship at InternPe. "
                "Cleans and aggregates historical Indian Premier League (IPL) cricket match and player datasets. "
                "Implements Random Forest and Logistic Regression models in Scikit-Learn to accurately forecast "
                "match-winner probabilities based on venue, toss winner, current run rate, and squad strengths."
            ),
            "tech": ["Python", "Scikit-Learn", "Pandas", "NumPy"],
            "img_filename": "media/projects/ipl_prediction.png",
            "db_img_path": "projects/ipl_prediction.png",
            "github": "https://github.com/chiranjeeb-satapathy/ipl-prediction",
            "demo": ""
        }
    ]
    
    for proj in projects_data:
        create_placeholder_project_image(proj["title"], proj["tech"], proj["img_filename"])
        Project.objects.create(
            user=user,
            title=proj["title"],
            description=proj["description"],
            image=proj["db_img_path"],
            github_link=proj["github"],
            live_demo=proj["demo"]
        )
    print("Projects seeded successfully.")

    # 4. Add Certificates
    Certificate.objects.filter(user=user).delete() # Clear existing
    
    certs_data = [
        {
            "title": "Google Cloud Certified - Generative AI Leader",
            "org": "Google Cloud",
            "date": datetime.date(2025, 4, 15),
            "date_str": "April 15, 2025",
            "img_filename": "media/certificates/gcp_ai.png",
            "db_img_path": "certificates/gcp_ai.png"
        },
        {
            "title": "Meta Full Stack Course",
            "org": "Meta",
            "date": datetime.date(2025, 6, 20),
            "date_str": "June 20, 2025",
            "img_filename": "media/certificates/meta_fs.png",
            "db_img_path": "certificates/meta_fs.png"
        },
        {
            "title": "GenAI Powered Data Analytics Job Simulation",
            "org": "Tata (on Forage)",
            "date": datetime.date(2025, 5, 10),
            "date_str": "May 10, 2025",
            "img_filename": "media/certificates/tata_analytics.png",
            "db_img_path": "certificates/tata_analytics.png"
        },
        {
            "title": "Certified in AI Tools and ChatGPT",
            "org": "Internshala",
            "date": datetime.date(2024, 12, 1),
            "date_str": "December 01, 2024",
            "img_filename": "media/certificates/ai_tools.png",
            "db_img_path": "certificates/ai_tools.png"
        },
        {
            "title": "HTML Tutorial for Beginners",
            "org": "Apna College",
            "date": datetime.date(2024, 8, 15),
            "date_str": "August 15, 2024",
            "img_filename": "media/certificates/html_apna.png",
            "db_img_path": "certificates/html_apna.png"
        },
        {
            "title": "Java: Data Structures",
            "org": "LinkedIn Learning",
            "date": datetime.date(2024, 10, 10),
            "date_str": "October 10, 2024",
            "img_filename": "media/certificates/java_ds.png",
            "db_img_path": "certificates/java_ds.png"
        },
        {
            "title": "JavaScript: Data Structures/Linked Lists",
            "org": "LinkedIn Learning",
            "date": datetime.date(2024, 11, 5),
            "date_str": "November 05, 2024",
            "img_filename": "media/certificates/js_linked_lists.png",
            "db_img_path": "certificates/js_linked_lists.png"
        }
    ]
    
    for cert in certs_data:
        create_placeholder_certificate_image(cert["title"], cert["org"], cert["date_str"], cert["img_filename"])
        Certificate.objects.create(
            user=user,
            title=cert["title"],
            organization=cert["org"],
            issue_date=cert["date"],
            certificate_image=cert["db_img_path"]
        )
    print("Certificates seeded successfully.")

if __name__ == '__main__':
    main()
