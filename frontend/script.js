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
          console.log(pageObjects)
    
        
        }
        showObjects(currentPage);
    }
}

window.addEventListener("load", loadEvent);