import os

def replace_in_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        changes = 0
        replacements = {
            'yourusername': 'kidwaiabdulhadi',
            'Your Name': 'Abdul Hadi Kidwai',
            'your@email.com': 'a.hadikidwai@gmail.com',
            'security@urbanpulse.ai': 'a.hadikidwai@gmail.com',
            'linkedin.com/in/yourprofile': 'linkedin.com/in/abdul-hadi-kidwai-51231032a'
        }
        
        for k, v in replacements.items():
            if k in content:
                content = content.replace(k, v)
                changes += 1
                
        if changes > 0:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated placeholders in {path}")
            
    except Exception as e:
        print(f"Failed {path}: {e}")

for root, dirs, files in os.walk('.'):
    if '.git' in root or 'node_modules' in root or 'venv' in root:
        continue
    for f in files:
        if f.endswith('.md') or f.endswith('.yml'):
            replace_in_file(os.path.join(root, f))
