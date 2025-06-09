//let currentProjectPath = null;
//
//function showLoading() {
//    document.getElementById('loading').style.display = 'flex';
//}
//
//function hideLoading() {
//    document.getElementById('loading').style.display = 'none';
//}
//
//function showMessage(message, type = 'success') {
//    const messageDiv = document.getElementById('message');
//    messageDiv.textContent = message;
//    messageDiv.className = `message ${type}`;
//    messageDiv.style.display = 'block';
//
//    setTimeout(() => {
//        messageDiv.style.display = 'none';
//    }, 5000);
//}
//
//function parseStructure(text) {
//    const lines = text.split('\n');
//    const structure = [];
//    const stack = [{ children: structure, level: -1 }];
//
//    for (let i = 0; i < lines.length; i++) {
//        const line = lines[i];
//        if (!line.trim()) continue;
//
//        let level = 0;
//        let name = '';
//
//        // Handle tree-style format
//        if (line.includes('├──') || line.includes('└──')) {
//            // Count the level by counting tree drawing characters before the item
//            const beforeItem = line.split(/[├└]──/)[0];
//            level = (beforeItem.match(/[│\s]/g) || []).length / 4;
//            name = line.split(/[├└]──\s*/)[1] || '';
//        } else if (line.match(/^[│\s]*[^├└─]/)) {
//            // Handle lines that might be indented without tree chars
//            const match = line.match(/^([│\s]*)/);
//            if (match) {
//                level = match[1].length / 4;
//                name = line.replace(/^[│\s]*/, '').trim();
//            }
//        } else {
//            // Handle simple indentation
//            level = (line.length - line.trimStart().length) / 4;
//            name = line.trim();
//        }
//
//        // Clean up the name
//        name = name.replace(/^[├└─│\s]*/, '').trim();
//
//        if (!name || name.includes('(generated folders will be created here)')) continue;
//
//        // Determine if it's a folder
//        const isFolder = name.endsWith('/') ||
//                        (name.includes('/') && !name.includes('.')) ||
//                        (!name.includes('.') && (
//                            i + 1 < lines.length &&
//                            (lines[i + 1].includes('├──') || lines[i + 1].includes('└──') || lines[i + 1].includes('│'))
//                        ));
//
//        const item = {
//            name: isFolder ? name.replace(/\/$/, '') : name,
//            type: isFolder ? 'folder' : 'file'
//        };
//
//        if (isFolder) {
//            item.children = [];
//        }
//
//        // Find the correct parent
//        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
//            stack.pop();
//        }
//
//        if (stack.length === 0) {
//            stack.push({ children: structure, level: -1 });
//        }
//
//        const parent = stack[stack.length - 1];
//        parent.children.push(item);
//
//        if (isFolder) {
//            stack.push({ children: item.children, level: level });
//        }
//    }
//
//    return structure;
//}
//
//function generateStructurePreview(structure, level = 0) {
//    let preview = '';
//    const indent = '  '.repeat(level);
//
//    for (const item of structure) {
//        if (item.type === 'folder') {
//            preview += `${indent}📁 ${item.name}/\n`;
//            if (item.children && item.children.length > 0) {
//                preview += generateStructurePreview(item.children, level + 1);
//            }
//        } else {
//            const icon = getFileIcon(item.name);
//            preview += `${indent}${icon} ${item.name}\n`;
//        }
//    }
//
//    return preview;
//}
//
//function getFileIcon(filename) {
//    const ext = filename.split('.').pop().toLowerCase();
//    const icons = {
//        'py': '🐍',
//        'js': '🟨',
//        'html': '🌐',
//        'css': '🎨',
//        'md': '📝',
//        'txt': '📄',
//        'json': '🔧',
//        'xml': '📋',
//        'sql': '🗄️',
//        'java': '☕',
//        'cpp': '⚙️',
//        'c': '⚙️',
//        'php': '🐘',
//        'rb': '💎',
//        'go': '🐹',
//        'rs': '🦀',
//        'ts': '🔷',
//        'vue': '💚',
//        'react': '⚛️'
//    };
//
//    return icons[ext] || '📄';
//}
//
//async function generateStructure() {
//    const projectName = document.getElementById('projectName').value.trim();
//    const structureText = document.getElementById('structureInput').value.trim();
//
//    if (!projectName) {
//        showMessage('Please enter a project name', 'error');
//        return;
//    }
//
//    if (!structureText) {
//        showMessage('Please enter the project structure', 'error');
//        return;
//    }
//
//    try {
//        showLoading();
//
//        const structure = parseStructure(structureText);
//
//        const response = await fetch('/generate_structure', {
//            method: 'POST',
//            headers: {
//                'Content-Type': 'application/json',
//            },
//            body: JSON.stringify({
//                project_name: projectName,
//                structure: structure
//            })
//        });
//
//        const result = await response.json();
//
//        if (result.success) {
//            currentProjectPath = result.project_path;
//
//            // Show preview
//            const preview = generateStructurePreview(structure);
//            document.getElementById('structurePreview').textContent = preview;
//            document.getElementById('result').style.display = 'block';
//
//            // Enable download button
//            document.getElementById('downloadBtn').disabled = false;
//
//            showMessage(result.message, 'success');
//        } else {
//            showMessage(result.error || 'An error occurred', 'error');
//        }
//
//    } catch (error) {
//        console.error('Error:', error);
//        showMessage('Failed to generate structure. Please try again.', 'error');
//    } finally {
//        hideLoading();
//    }
//}
//
//async function downloadProject() {
//    if (!currentProjectPath) {
//        showMessage('No project to download', 'error');
//        return;
//    }
//
//    try {
//        showLoading();
//
//        const response = await fetch('/download_project', {
//            method: 'POST',
//            headers: {
//                'Content-Type': 'application/json',
//            },
//            body: JSON.stringify({
//                project_path: currentProjectPath
//            })
//        });
//
//        if (response.ok) {
//            const blob = await response.blob();
//            const url = window.URL.createObjectURL(blob);
//            const a = document.createElement('a');
//            a.style.display = 'none';
//            a.href = url;
//            a.download = `${currentProjectPath.split('/').pop()}.zip`;
//            document.body.appendChild(a);
//            a.click();
//            window.URL.revokeObjectURL(url);
//            document.body.removeChild(a);
//
//            showMessage('Project downloaded successfully!', 'success');
//        } else {
//            const result = await response.json();
//            showMessage(result.error || 'Download failed', 'error');
//        }
//
//    } catch (error) {
//        console.error('Error:', error);
//        showMessage('Failed to download project. Please try again.', 'error');
//    } finally {
//        hideLoading();
//    }
//}
//
//function clearAll() {
//    document.getElementById('projectName').value = 'my_project';
//    document.getElementById('structureInput').value = `project-structure-generator/
//├── app.py
//├── templates/
//│   └── index.html
//├── static/
//│   ├── style.css
//│   └── script.js
//├── generated_projects/
//│   └── (generated folders will be created here)
//└── requirements.txt`;
//
//    document.getElementById('result').style.display = 'none';
//    document.getElementById('downloadBtn').disabled = true;
//    document.getElementById('message').style.display = 'none';
//
//    currentProjectPath = null;
//}
//
//// Initialize the page
//document.addEventListener('DOMContentLoaded', function() {
//    // Set default structure with tree format
//    document.getElementById('structureInput').value = `project-structure-generator/
//├── app.py
//├── templates/
//│   └── index.html
//├── static/
//│   ├── style.css
//│   └── script.js
//├── generated_projects/
//│   └── (generated folders will be created here)
//└── requirements.txt`;
//
//    // Add enter key support for project name
//    document.getElementById('projectName').addEventListener('keypress', function(e) {
//        if (e.key === 'Enter') {
//            generateStructure();
//        }
//    });
//});