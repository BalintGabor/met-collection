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
                console.log(input)
            }
        })(departmentSearch);
    }
}

window.addEventListener("load", loadEvent);