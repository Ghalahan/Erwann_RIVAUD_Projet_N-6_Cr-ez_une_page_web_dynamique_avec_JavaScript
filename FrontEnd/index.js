document.addEventListener('DOMContentLoaded', () => {
    // Sélection des éléments du DOM
    const filterLinksContainer = document.querySelector('.filter-links');
    const MenuLogin = document.querySelector('.login');
    const galleryContainer = document.getElementById('projects-container');
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    const modifybutton = document.querySelector('.openModalBtn');
    var globalWorks = [];
    const modalworks = document.querySelector('.modal-works');
    
    // Sélection des éléments pour les modales
    const addPhotoBtn = document.getElementById('addPhotoBtn');
    const addPhotoModal = document.getElementById('addPhotoModal');
    const closeAddPhotoModalBtn = document.querySelector('.close-add-photo');
    const addPhotoForm = document.getElementById('addPhotoForm');
    const photoCategorySelect = document.getElementById('photoCategory');

    // Vérifier et configurer le menu de connexion/déconnexion
    if (localStorage.getItem('authToken') != null) {
        console.log(localStorage.getItem('authToken'));
        MenuLogin.innerHTML = 'logout';
        MenuLogin.classList.add('logout');
        const MenuLogout = document.querySelector('.logout');
        MenuLogout.href = '';
        filterLinksContainer.innerHTML = '';
        modifybutton.classList.remove('logged-off');

        MenuLogout.addEventListener('click', event => {
            event.stopPropagation();
            localStorage.removeItem('authToken');
            location.reload();
        });
    }

    // Charger les catégories
    fetch('http://localhost:5678/api/categories')
        .then(response => response.json())
        .then(categories => {
            if (localStorage.getItem('authToken') == null) {
                console.log(localStorage.getItem('authToken'));

                // Ajouter le lien "Tous"
                const allLink = document.createElement('a');
                allLink.href = '#';
                allLink.classList.add('filter-link', 'active');
                allLink.textContent = 'Tous';
                allLink.dataset.categoryId = 0;
                allLink.addEventListener('click', event => {
                    event.preventDefault();
                    filterWorksByCategory(0);
                    setActiveFilterLink(allLink);
                });
                filterLinksContainer.appendChild(allLink);

                // Ajouter les autres catégories
                categories.forEach(category => {
                    const link = document.createElement('a');
                    link.classList.add('filter-link');
                    link.textContent = category.name;
                    link.href = '#';
                    link.dataset.categoryId = category.id;
                    link.addEventListener('click', event => {
                        event.preventDefault();
                        filterWorksByCategory(category.id);
                        setActiveFilterLink(link);
                    });
                    filterLinksContainer.appendChild(link);
                });
            }
        });

    // Récupérer et afficher les travaux
    fetch('http://localhost:5678/api/works')
        .then(response => response.json())
        .then(works => {
            globalWorks = works;
            works.forEach(work => {
                const workElement = createWorkElement(work);
                galleryContainer.appendChild(workElement);
            });

            const openModalBtn = document.getElementById('openModalBtn');
            const modal = document.getElementById('modal');
            const closeModalBtn = document.getElementsByClassName('close')[0];

            globalWorks.forEach(work => {
                const workElement = createWorkElement(work, true);
                modalworks.appendChild(workElement);
                console.log(work);
            });

            // Ouvrir la modale au clic sur le bouton "Modifier"
            openModalBtn.addEventListener('click', function() {
                modal.style.display = 'flex';
            });

            // Fermer la modale en cliquant sur le bouton de fermeture
            closeModalBtn.addEventListener('click', function() {
                modal.style.display = 'none';
            });

            // Fermer la modale en cliquant à l'extérieur de celle-ci
            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });

            // Fonction pour afficher la deuxième modale
            addPhotoBtn.addEventListener('click', (event) => {
                event.preventDefault();
                loadCategories(); // Charger les catégories avant d'afficher la modale
                addPhotoModal.style.display = 'flex';
            });

            // Fonction pour fermer la deuxième modale en cliquant sur le bouton de fermeture
            closeAddPhotoModalBtn.addEventListener('click', () => {
                addPhotoModal.style.display = 'none';
            });

            // Fonction pour fermer la modale en cliquant en dehors de celle-ci
            window.addEventListener('click', (event) => {
                if (event.target === addPhotoModal) {
                    addPhotoModal.style.display = 'none';
                }
            });



            // Fonction pour téléverser une photo
             addPhotoForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const formData = new FormData(addPhotoForm);

                fetch('http://localhost:5678/api/works', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Photo ajoutée:', data);
                    addPhotoForm.reset();
                    addPhotoModal.style.display = 'none'; // Masquer la modale après ajout

                    // Ajouter le nouvel élément dans le DOM
                    const newWorkElement = createWorkElement(data);
                    galleryContainer.appendChild(newWorkElement);
                    
                    // Ajouter le nouvel élément dans la modale
                    const newWorkElementModal = createWorkElement(data, true);
                    modalworks.appendChild(newWorkElementModal);

                    // Mettre à jour le tableau globalWorks
                    globalWorks.push(data);
                })
                .catch((error) => {
                    console.error('Erreur:', error);
                });
            });



            // Fonction pour charger les catégories dans le formulaire
            function loadCategories() {
                fetch('http://localhost:5678/api/categories')
                    .then(response => response.json())
                    .then(categories => {
                        photoCategorySelect.innerHTML = '<option value="" disabled selected>Choisissez une catégorie</option>';
                        categories.forEach(category => {
                            const option = document.createElement('option');
                            option.value = category.id;
                            option.textContent = category.name;
                            photoCategorySelect.appendChild(option);
                        });
                    })
                    .catch((error) => {
                        console.error('Erreur:', error);
                    });
            }
        });

    // Fonction pour créer un élément de travail
    function createWorkElement(work, isModal = false) {
        const workElement = document.createElement('div');
        workElement.classList.add('work-item');
        workElement.setAttribute('data-id', work.id); // Ajout de l'attribut data-id

        const image = document.createElement('img');
        image.src = work.imageUrl;
        image.alt = work.title;

        const title = document.createElement('h3');
        title.textContent = work.title;

        workElement.appendChild(image);
        workElement.appendChild(title);

        // Ajouter un bouton de suppression si dans la modal
        if (isModal) {
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', () => {
                // Afficher la boîte de dialogue de confirmation
                const confirmation = window.confirm("Voulez-vous supprimer l'élément?");
        
                // Si l'utilisateur confirme, supprimer l'élément
                if (confirmation) {
                    deleteWork(work.id, workElement);
                }
            });

            // Création de l'élément icône
            const icon = document.createElement('i');
            icon.classList.add('fa-solid', 'fa-trash-can');

            // Ajout de l'icône au bouton
            deleteButton.appendChild(icon);

            workElement.appendChild(deleteButton);
        }

        return workElement;
    }

    // Fonction pour filtrer les travaux par catégorie
    function filterWorksByCategory(categoryId) {
        galleryContainer.innerHTML = '';
        globalWorks.forEach(work => {
            if (work.categoryId == categoryId || categoryId == 0) {
                const workElement = createWorkElement(work);
                galleryContainer.appendChild(workElement);
            }
        });
    }

    // Définir le lien de filtre actif
    function setActiveFilterLink(selectedLink) {
        const allLinks = document.querySelectorAll('.filter-link');
        allLinks.forEach(link => link.classList.remove('active'));
        selectedLink.classList.add('active');
    }

    // Gestion du formulaire de connexion
    if (loginForm && loginMessage) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const data = { email, password };

            fetch('http://localhost:5678/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Réponse réseau incorrecte: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (data.userId && data.token) {
                    // Vérifier si les identifiants correspondent
                    console.log('Connexion réussie:', data);
                    loginMessage.textContent = 'Connexion réussie !';
                    loginMessage.style.color = 'green';

                    // Stocker le token dans localStorage
                    localStorage.setItem('authToken', data.token);

                    // Rediriger vers la page d'accueil
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000); // 2 secondes
                } else {
                    console.log('Échec de la connexion :', data);
                    loginMessage.textContent = 'Échec de la connexion : ' + (data.message || 'Erreur inconnue');
                    loginMessage.style.color = 'red';
                }
            })
            .catch((error) => {
                console.error('Erreur :', error);
                loginMessage.textContent = 'Erreur de connexion';
                loginMessage.style.color = 'red';
            });
        });
    }

    // Fonction pour récupérer les travaux avec authentification
    function fetchWorksAuthenticated() {
        const token = localStorage.getItem('authToken');

        if (!token) {
            console.error('No authentication token found.');
            return;
        }

        fetch('http://localhost:5678/api/works', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Works:', data);
            // Process the data as needed
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    // Appel de la fonction pour récupérer les travaux avec authentification (si nécessaire)
    fetchWorksAuthenticated();

    // Fonction pour supprimer un élément
    function deleteWork(workId, workElement) {
        const token = localStorage.getItem('authToken');

        if (!token) {
            console.error('No authentication token found.');
            return;
        }

        fetch(`http://localhost:5678/api/works/${workId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            // Supprimer l'élément du DOM après la suppression réussie
            workElement.remove();
            // Mettre à jour le tableau globalWorks
            globalWorks = globalWorks.filter(work => work.id !== workId);

            // Supprimer l'élément du DOM sur la page d'accueil
            const homeWorkElement = document.querySelector(`.work-item[data-id='${workId}']`);
            if (homeWorkElement) {
                homeWorkElement.remove();
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

        // Prévisualiser l'image avant téléversement
        document.getElementById('file-upload').addEventListener('change', function(event) {
            const file = event.target.files[0];
            const preview = document.getElementById('img-preview');
            const icon = document.getElementById('img-icon');
            const btnUploadContainer = document.getElementById('btn-upload-container');
            const uploadText = document.querySelector('.upload-text'); // Sélectionner le texte de téléchargement
            
            if (file) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block'; // Afficher l'aperçu de l'image
                    icon.style.display = 'none'; // Cacher l'icône
                    uploadText.style.display = 'none'; // Cacher le texte de téléchargement
                    
                    // Remplacer le conteneur du bouton de téléchargement par l'aperçu de l'image
                    btnUploadContainer.style.display = 'none'; // Cacher le conteneur du bouton
                }
                
                reader.readAsDataURL(file);
            } else {
                // Réinitialiser les éléments si aucun fichier n'est sélectionné
                preview.src = '#';
                preview.style.display = 'none';
                icon.style.display = 'block';
                uploadText.style.display = 'block'; // Réafficher le texte de téléchargement
                btnUploadContainer.style.display = 'block'; // Réafficher le conteneur du bouton
            }
        });
    

    });
