const loadEvent = async () => {

    // Fetch departments
    const responseDepartments = await fetch("https://collectionapi.metmuseum.org/public/collection/v1/departments");
    const responseDepartmentsJson = await responseDepartments.json();
    const departments = responseDepartmentsJson.departments;
    console.log(departments);

    // Create departments' container and fill up with the fetched departments
    const departmentContainer = document.querySelector("#departments-container");
    for (const department of departments) {
        departmentContainer.insertAdjacentHTML(
            "beforeend",
            `<div class="department-card">
                <button class="department-button" value="${department.departmentId}">
                    <div class="department-image-container">
                        <img src="./img/departments/dept_${department.departmentId}.jpg" alt="department">
                    </div>
                    <h2>${department.displayName}</h2>
                </button>
            </div>`
        )
    }
}

window.addEventListener("load", loadEvent);