const loadEvent = async () => {
    // Separated to 3 main sections: Departments, Objects, Pagination

    // - - - - - - - - - - - - - - - D E P A R T M E N T S - - - - - - - - - - - - - - -
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

    // Departments container hider/unhider
    const hiderButton = document.querySelector("#departments-container-hider");
    const chevronDown = `<img src="../frontend/images/chevrons/chevron_down.svg" alt="chevron_down">`;
    const chevronUp = `<img src="../frontend/images/chevrons/chevron_up.svg" alt="chevron_up"></img>`
    const header = document.getElementById("header");

    function hideDepartments() {
        departmentContainer.classList.add("hidden");
        hiderButton.innerHTML = chevronDown + "<p>show me the departments</p>" + chevronDown;
    }
    hideDepartments()

    hiderButton.addEventListener("click", () => {
        if (departmentContainer.classList == "hidden") {
            departmentContainer.classList.remove("hidden");
            header.style.height = "60vh";
            window.scrollTo(0, 0)
            hiderButton.innerHTML = chevronUp + "<p>hide the departments</p>" + chevronUp;
        } else {
            header.style.height = "90vh";
            hideDepartments();
        }
    });

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

    // - - - - - - - - - - - - - - - O B J E C T S - - - - - - - - - - - - - - -
    async function chosenDepartment(departmentId) {
        hideDepartments();

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
            objectsContainer.style.padding = "40px calc(40px + 0.50vw)";

            // Create and fill up html dom for all the selected objects 
            pageObjects.forEach(async (objectId) => {

                // Starting with fetched data
                const responseObject = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`);
                const responseObjectJson = await responseObject.json();

                const div = document.createElement("div");
                div.className = "object-container";

                // Some of the objects have no images even if there is a filter in the API request -> no image replacement
                let objectSmallImage = "";
                if (responseObjectJson.primaryImageSmall) {
                    objectSmallImage = responseObjectJson.primaryImageSmall;
                } else {
                    objectSmallImage = ("./img/no_object_image.jpg")
                }

                // Where no region is specified, the artist can be found there
                let regionOrArtist = "";
                if (responseObjectJson.region) {
                    regionOrArtist = responseObjectJson.region;
                } else {
                    regionOrArtist = responseObjectJson.artistDisplayName;
                }

                div.innerHTML = `
                    <div class="object-image-container">
                        <img src="${objectSmallImage}" alt="object">
                    </div>
                    <h3>${responseObjectJson.title}</h3>
                    <h4>${regionOrArtist}</h4>
                    <h4>${responseObjectJson.objectDate}</h4>
                `;

                objectsContainer.appendChild(div);

            });
        }

        // - - - - - - - - - - - - - - - P A G I N A T I O N - - - - - - - - - - - - - - -
        // Pagination container
        function setupPagination(currentPage) {
            const pagination = document.querySelector("#pagination");
            pagination.innerHTML = "";
            pagination.style.margin = "20px 0px 40px";

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

            // Load prev and next buttons
            function prevAndNextButtons() {
                pagination.insertAdjacentHTML("afterbegin",
                    `<a id="button-previous" href="#">&lt;&lt;</a>`)
                pagination.insertAdjacentHTML("beforeend",
                    '<a id="button-next" href="#">&gt;&gt;</a>')
            }
            prevAndNextButtons();

            const currentActive = pagination.querySelector(".active");
            const currentActiveId = Number(currentActive.id.slice(1));

            const prevButton = document.querySelector("#button-previous");
            prevButton.addEventListener("click", () => {
                if (currentActiveId > 1) {
                    currentPage--;
                    showObjects(currentPage);

                    let prevCurrentActiveId = ("#a" + (currentActiveId - 1));
                    currentActive.classList.remove("active");
                    pagination.querySelector(prevCurrentActiveId).classList.add("active");

                    setupPagination(currentPage);
                }
            }, { once: true });

            const nextButton = document.querySelector("#button-next");
            nextButton.addEventListener("click", () => {
                if (currentActiveId < totalPages) {
                    currentPage++;
                    showObjects(currentPage);

                    let nextCurrentActiveId = ("#a" + (currentActiveId + 1));
                    currentActive.classList.remove("active");
                    pagination.querySelector(nextCurrentActiveId).classList.add("active");

                    setupPagination(currentPage);
                }
            }, { once: true });
        }
        setupPagination(currentPage);
        showObjects(currentPage);
    }
}

window.addEventListener("load", loadEvent);