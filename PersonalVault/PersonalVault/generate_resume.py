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
    # A4 size at 150 DPI: 1240 x 1754
    width, height = 1240, 1754
    img = Image.new('RGB', (width, height), color='#ffffff')
    draw = ImageDraw.Draw(img)
    
    # Define color scheme
    primary_color = '#0f172a' # Dark Slate
    accent_color = '#4f46e5'  # Indigo
    text_color = '#334155'    # Slate-700
    light_bg = '#f8fafc'      # Slate-50
    line_color = '#e2e8f0'    # Slate-200
    
    # Load fonts
    try:
        font_bold_huge = ImageFont.truetype("arial.ttf", 48)
        font_bold_large = ImageFont.truetype("arial.ttf", 26)
        font_bold_medium = ImageFont.truetype("arial.ttf", 20)
        font_regular = ImageFont.truetype("arial.ttf", 18)
        font_italic = ImageFont.truetype("arial.ttf", 16)
    except IOError:
        font_bold_huge = ImageFont.load_default()
        font_bold_large = ImageFont.load_default()
        font_bold_medium = ImageFont.load_default()
        font_regular = ImageFont.load_default()
        font_italic = ImageFont.load_default()

    # Draw header background
    draw.rectangle([0, 0, width, 270], fill=primary_color)
    
    # Name and Title
    draw.text((80, 45), "CHIRANJEEB SATAPATHY", fill='#ffffff', font=font_bold_huge)
    draw.text((80, 110), "Computer Science Engineer | Exploring AI/ML & Software Development", fill='#94a3b8', font=font_bold_large)
    
    # Contact Info
    draw.text((80, 175), "Email: chiranjeebsatapathy123@gmail.com", fill='#e2e8f0', font=font_regular)
    draw.text((550, 175), "Location: Bhubaneswar, India", fill='#e2e8f0', font=font_regular)
    draw.text((80, 215), "LinkedIn: linkedin.com/in/chiranjeeb-satapathy-283b40353", fill='#e2e8f0', font=font_regular)
    draw.text((550, 215), "GitHub: github.com/chiranjeebsatapathy123-sudo", fill='#e2e8f0', font=font_regular)

    # Paste User Photo at Top-Right
    try:
        photo_path = os.path.join("media", "profile", "chiranjeeb_photo.jpg")
        if os.path.exists(photo_path):
            photo = Image.open(photo_path).convert("RGBA")
            photo = photo.resize((160, 160), Image.Resampling.LANCZOS)
            # Create rounded circle mask
            mask = Image.new('L', (160, 160), 0)
            mask_draw = ImageDraw.Draw(mask)
            mask_draw.ellipse((0, 0, 160, 160), fill=255)
            # Paste photo
            img.paste(photo, (1000, 45), mask)
    except Exception as e:
        print(f"Error drawing profile photo: {e}")

    y_pos = 320
    
    def draw_section_header(title):
        nonlocal y_pos
        draw.text((80, y_pos), title.upper(), fill=accent_color, font=font_bold_large)
        draw.line([80, y_pos + 35, width - 80, y_pos + 35], fill=accent_color, width=2)
        y_pos += 60

    # 1. Summary
    draw_section_header("Professional Summary")
    summary_text = (
        "B.Tech Computer Science Engineering student with hands-on experience in Artificial Intelligence,\n"
        "Machine Learning, and Full-Stack Web Development. Skilled in building responsive web applications,\n"
        "developing machine learning models, and solving real-world problems using Python and modern web\n"
        "technologies. Passionate about AI, software engineering, and continuous learning. Seeking internship\n"
        "opportunities in AI Engineering, Machine Learning, or Full-Stack Development."
    )
    # Simple line-wrapping for summary
    draw.text((80, y_pos), summary_text, fill=text_color, font=font_regular)
    y_pos += 80

    # 2. Education
    draw_section_header("Education")
    draw.text((80, y_pos), "B.Tech in Computer Science Engineering (AI & ML Focus)", fill=primary_color, font=font_bold_medium)
    draw.text((width - 250, y_pos), "2024 - 2028 (Expected)", fill=text_color, font=font_regular)
    y_pos += 25
    draw.text((80, y_pos), "Siksha 'O' Anusandhan University (ITER-SOA), Bhubaneswar", fill=text_color, font=font_italic)
    y_pos += 30
    draw.text((80, y_pos), "Relevant Coursework: Data Structures & Algorithms, Database Management, Computer Vision, OOP", fill=text_color, font=font_regular)
    y_pos += 60

    # 3. Experience
    draw_section_header("Internships & Professional Experience")
    
    experiences = [
        ("AI/ML Intern", "CTTC", "Date - Date", 
         "Worked on Artificial Intelligence and Machine Learning models."),
        ("Web Development Intern", "Thiranex", "Date - Date", 
         "Developed and maintained web applications and responsive user interfaces.")
    ]
    
    for title, org, date, desc in experiences:
        draw.text((80, y_pos), f"{title} - {org}", fill=primary_color, font=font_bold_medium)
        draw.text((width - 250, y_pos), date, fill=text_color, font=font_regular)
        y_pos += 25
        draw.text((80, y_pos), f"- {desc}", fill=text_color, font=font_regular)
        y_pos += 35
        
    y_pos += 20

    # 4. Key Projects
    draw_section_header("Academic & Personal Projects")
    
    # Project 1
    draw.text((80, y_pos), "AI-Powered Football VAR System (Computer Vision)", fill=primary_color, font=font_bold_medium)
    y_pos += 25
    draw.text((80, y_pos), "- Utilized YOLOv8 and OpenCV to identify players and the ball to calculate offside boundaries dynamically.", fill=text_color, font=font_regular)
    y_pos += 35
    
    # Project 2
    draw.text((80, y_pos), "IPL Match Prediction System (Machine Learning)", fill=primary_color, font=font_bold_medium)
    y_pos += 25
    draw.text((80, y_pos), "- Trained Scikit-Learn models on historical cricket stats to forecast match outcome probabilities with high accuracy.", fill=text_color, font=font_regular)
    y_pos += 45

    # 5. Skills
    draw_section_header("Technical Skills")
    draw.text((80, y_pos), "Languages: Python, SQL, C++, Java, JavaScript, HTML5/CSS3", fill=text_color, font=font_regular)
    y_pos += 30
    draw.text((80, y_pos), "Frameworks & Libraries: Django Web Framework, Django ORM, OpenCV, YOLOv8, Scikit-Learn, Pandas, Flask", fill=text_color, font=font_regular)
    
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
