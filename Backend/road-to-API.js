async function fetchProjects() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
    }
}

async function fetchCategories() {
    try {
        const response = await fetch('http://localhost:5678/api/categories');
    }
}

function displayProjects(projects) {
    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.innerHTML = '';

    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'project';
        projectElement.innerText = project.name;
        projectsContainer.appendChild(projectElement);
    });
}