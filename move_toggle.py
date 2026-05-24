import os
import re

dir_path = 'c:/Users/della/Documents/claud-code-mastry/curser training be10x'
html_files = ['index.html', 'about.html', 'projects.html', 'contact.html']

for f in html_files:
    path = os.path.join(dir_path, f)
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    toggle_pattern = re.compile(r'\s*<button class="theme-toggle".*?</button>', re.DOTALL)
    
    match = toggle_pattern.search(content)
    if match:
        toggle_html = match.group(0).strip()
        content = content.replace(match.group(0), '')
        
        contact_pattern = re.compile(r'(<li><a href="contact\.html"[^>]*>Contact</a></li>)')
        new_toggle_html = '\n        <li>\n          ' + toggle_html + '\n        </li>'
        content = contact_pattern.sub(r'\g<1>' + new_toggle_html, content)
        
        with open(path, 'w', encoding='utf-8') as file:
            file.write(content)
        print('Updated', f)
