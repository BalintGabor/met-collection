const loadEvent = async () => {

    // Fetch departments
    const responseDepartments = await fetch("https://collectionapi.metmuseum.org/public/collection/v1/departments");
    const responseDepartmentsJson = await responseDepartments.json();
    const departments = responseDepartmentsJson.departments;

    // Create departments' container and fill up with the fetched departments
    const departmentContainer = document.querySelector("#departments-container");
    for (const department of departments) {
        departmentContainer.insertAdjacentHTML(
            "beforeend",
            `<div class="department-card">
                <button class="department-button" value="${department.departmentId}">
                    <div class="department-image-container">
                        <img src="./images/departments/dept_${department.departmentId}.jpg" alt="department">
                    </div>
                    <h2>${department.displayName}</h2>
                </button>
            </div>`
        )
    }

    // Eventlistener for every department button
    const departmentButtons = document.querySelectorAll(".department-button");
    for (departmentSearch of departmentButtons) {
        ((departmentSearch) => {
            departmentSearch.addEventListener("click", clickFetch);
            function clickFetch() {
                let input = departmentSearch.value;
                chosenDepartment(input);
            }
        })(departmentSearch);
    }

    async function chosenDepartment(departmentId) {

        // Fetch the chosen department's objects
        const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&departmentId=${departmentId}&q=""`);
        const responseJson = await response.json();
        const objects = responseJson.objectIDs;
        console.log(responseJson)
        console.log(objects)

        const objectsPerPage = 10;
        let currentPage = 1;

        // Load the current page's objects
        function showObjects(page) {
            const startIndex = (page - 1) * objectsPerPage;
            const endIndex = startIndex + objectsPerPage;
            const pageObjects = objects.slice(startIndex, endIndex);

            const objectsContainer = document.querySelector("#objects-container");
            objectsContainer.innerHTML = "";

            // Create and fill up html dom for all the selected objects 
            pageObjects.forEach(async (objectId) => {

                // Starting with fetched data
                const responseObject = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`);
                const responseObjectJson = await responseObject.json();

                const div = document.createElement("div");
                div.className = "object-container";

                div.innerHTML = `
                    <div class="object-image-container">
                        <img src="${responseObjectJson.primaryImageSmall}" alt="object">
                    </div>
                    <h3>${responseObjectJson.title}</h3>
                    <h4>${responseObjectJson.region}</h4>
                    <h4>${responseObjectJson.objectDate}</h4>
                `;

                objectsContainer.appendChild(div);
            });

        }

        // Pagination container
        function setupPagination(currentPage) {
            const pagination = document.querySelector("#pagination");
            pagination.innerHTML = "";

            // Even if there were fewer pages before or after the currentPage than the paginationDistance, the same number of pages (2x paginationDistance + currentPage) should appear in the pagination
            const totalPages = Math.ceil(objects.length / objectsPerPage)
            let paginationStart, paginationEnd;
            let paginationDistance = 3;
            if ((currentPage - paginationDistance) < 1) {
                paginationStart = 1;
                paginationEnd = paginationStart + (2 * paginationDistance);
            } else if ((currentPage + paginationDistance) > totalPages) {
                paginationStart = totalPages - (2 * paginationDistance);
                paginationEnd = totalPages;
            } else {
                paginationStart = currentPage - paginationDistance;
                paginationEnd = currentPage + paginationDistance;
            }

            // Fill up the pagination container
            function paginationFunc() {
                for (let i = paginationStart; i <= paginationEnd; i++) {
                    const link = document.createElement("a");
                    link.href = "#";
                    link.innerText = i;
                    link.id = "a" + i;

                    // Put an active class for the currentPage
                    if (i === currentPage) {
                        link.classList.add("active");
                    }

                    // Eventlistener for the pages
                    link.addEventListener("click", (event) => {
                        event.preventDefault();
                        currentPage = i;
                        showObjects(currentPage);

                        const currentActive = pagination.querySelector(".active");
                        currentActive.classList.remove("active");
                        link.classList.add("active");
                        setupPagination(currentPage);
                    });
                    pagination.appendChild(link);
                }
            }
            paginationFunc();

        }
        setupPagination(currentPage);
        showObjects(currentPage);
    }
}

window.addEventListener("load", loadEvent);