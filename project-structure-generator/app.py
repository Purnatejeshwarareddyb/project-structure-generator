from flask import Flask, render_template, request, jsonify, send_file
import os
import zipfile
import shutil
from datetime import datetime
import tempfile

app = Flask(__name__)

# Create necessary directories
os.makedirs('generated_projects', exist_ok=True)
os.makedirs('templates', exist_ok=True)
os.makedirs('static', exist_ok=True)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/generate_structure', methods=['POST'])
def generate_structure():
    try:
        data = request.get_json()
        project_name = data.get('project_name', 'my_project')
        structure = data.get('structure', [])

        if not structure:
            return jsonify({'error': 'No structure provided'}), 400

        # Create project directory
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        project_dir = os.path.join('generated_projects', f"{project_name}_{timestamp}")
        os.makedirs(project_dir, exist_ok=True)

        # Generate the structure
        create_structure(project_dir, structure)

        return jsonify({
            'success': True,
            'message': 'Project structure generated successfully!',
            'project_path': project_dir
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/download_project', methods=['POST'])
def download_project():
    try:
        data = request.get_json()
        project_path = data.get('project_path')

        if not project_path or not os.path.exists(project_path):
            return jsonify({'error': 'Project not found'}), 404

        # Create a temporary zip file
        temp_dir = tempfile.mkdtemp()
        zip_path = os.path.join(temp_dir, f"{os.path.basename(project_path)}.zip")

        # Create zip file
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(project_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, project_path)
                    zipf.write(file_path, arcname)

        return send_file(zip_path, as_attachment=True,
                         download_name=f"{os.path.basename(project_path)}.zip")

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def create_structure(base_path, structure):
    """Recursively create the project structure"""
    for item in structure:
        item_path = os.path.join(base_path, item['name'])

        if item['type'] == 'folder':
            os.makedirs(item_path, exist_ok=True)
            if 'children' in item and item['children']:
                create_structure(item_path, item['children'])
        elif item['type'] == 'file':
            # Create the file
            with open(item_path, 'w') as f:
                # Add some basic content based on file extension
                content = get_default_content(item['name'])
                f.write(content)


def get_default_content(filename):
    """Get default content based on file extension"""
    ext = os.path.splitext(filename)[1].lower()

    templates = {
        '.py': '# Python file\n# TODO: Add your code here\n',
        '.js': '// JavaScript file\n// TODO: Add your code here\n',
        '.html': '<!DOCTYPE html>\n<html>\n<head>\n    <title>Title</title>\n</head>\n<body>\n    <!-- TODO: Add your content here -->\n</body>\n</html>\n',
        '.css': '/* CSS file */\n/* TODO: Add your styles here */\n',
        '.md': '# README\n\nTODO: Add project description\n',
        '.txt': 'Text file\nTODO: Add your content here\n',
        '.json': '{\n    "TODO": "Add your JSON content here"\n}\n',
        '.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<!-- TODO: Add your XML content here -->\n',
        '.sql': '-- SQL file\n-- TODO: Add your queries here\n',
        '.java': '// Java file\n// TODO: Add your code here\n',
        '.cpp': '// C++ file\n// TODO: Add your code here\n',
        '.c': '// C file\n// TODO: Add your code here\n'
    }

    return templates.get(ext, '// TODO: Add your content here\n')


if __name__ == '__main__':
    app.run(debug=True, port=5000)