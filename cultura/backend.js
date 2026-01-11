class Person {
    constructor(id, logo, name, email, password, filters, isGuest) {
        this.id = id;
        this.logo = logo;
        this.name = name;
        this.email = email;
        this.password = password;
        this.filters = filters;
        this.isGuest = isGuest;
    }
    initGuest() {
        return new Person("idInt", "rand image", "Guest + idInt", null, null, [], true);
    }
}

class Organization {
    constructor(id, logo, name, description, email, password, tags, events) {
        this.id = id;
        this.logo = logo;
        this.name = name;
        this.description = description;
        this.email = email;
        this.password = password;
        this.tags = tags;
        this.events = events;
    }
}

class Event {
    constructor(id, logo, title, description, tags, date, org, link) {
        this.id = id;
        this.logo = logo;
        this.title = title;
        this.description = description;
        this.tags = tags;
        this.date = date;
        this.org = org;
        this.link = link;
    }
    initEvent(org) {
        return new Event("idInt", "rand image", "title", "description", [], null, org, "")
    }
}

// test
const person1 = new Person(1321, "image", "James", "james@gmail.com", "1234", ["boxing", "cardio", "apples"], false);
const person2 = initGuest();
const org1 = new Organization(2523, "image", "OgreOrg", "Ogre Ogre-Ogre", "ogre@gmail.com", "1234", ["ogre", "cardio", "food"], [event1, event2]);
const event1 = new Event(8567, "image", "Ogre Party", "Ogreeeee Partyyyyy", ["party", "ogre", "exercise"], "1-2-2020", org1, "www.ogreparty.com");
const event2 = new Event(3475, "image", "Ogre Solo", "All Ogre Sings Solo", ["singing", "ogre", "solo"], "2-3-2021", org1, "www.ogresolo.com");

// front page
// Get the button element by its ID
const fpEventButton = document.getElementById("myButton1");
const fpOrgButton = document.getElementById("myButton2");
const fpAboutButton = document.getElementById("myButton3");
const fpProfileButton = document.getElementById("myButton4");

// each button directs users to different pages
fpEventButton.addEventListener("click", function() {
    checkInitialLogin();
    window.location.href = "event_page.html"; // Navigate to the desired page
});
fpOrgButton.addEventListener("click", function() {
    checkInitialLogin();
    window.location.href = "org_page.html";
});
fpAboutButton.addEventListener("click", function() {
    window.location.href = "about_page.html";
});
fpProfileButton.addEventListener("click", function() {
    const userType = checkInitialLogin();
    if (userType == "person")
        window.location.href = "person_profile_page.html";
    else if (userType == "organization")
        window.location.href = "organization_profile_page.html";
});

// makes sure initial filter/tag is set up
function checkInitialLogin() {
    const userType = document.getElementById("demo").innerHTML; // get current user type
    const user = document.getElementById("demo").innerHTML; // get current user

    if (userType == "person") // set up user's filter / organization's tag
        checkInitialPerson(user);
    else if (userType == "organization")
        checkInitialOrg(user);
    return userType;
}

// authentication page
// mukit solos the world

// filter set up page
// (if reuse this function, could add different button id as parameter)
function filterSetUp(person) {
    const inputElement = document.getElementById("myInput"); // Get the input element
    const finishButton = document.getElementById("myButton");

    // check input element
    inputElement.addEventListener("click", function(e) {
    if (e.key === "Enter") { // Check if the key pressed is the 'Enter' key
        // e.preventDefault(); // Prevent the default form submission behavior (if inside a form)
        
        const value = inputField.value; // Get the value entered by the user
        if (/[a-zA-Z]/.test(value)) { // checks if input has alphabets
            person.tags.push(value) // update user tags
            document.getElementById('outputText').innerText = value; // display value on the page
        }
    }
    });

    // finish button exits filter page
    finishButton.addEventListener("click", function() {
        window.location.href = "event_page.html";
    });
}

// tag set up page
function tagSetUp(user, returnPage) { // user could be organization/event
    const inputElement = document.getElementById("myInput"); // Get the input element
    const finishButton = document.getElementById("myButton");

    // check input element
    inputElement.addEventListener("click", function(e) {
    if (e.key === "Enter") { // Check if the key pressed is the 'Enter' key
        e.preventDefault(); // Prevent the default form submission behavior (if inside a form)
        
        const value = inputField.value; // Get the value entered by the user
        user.tags.push(value) // update user tags
        document.getElementById('outputText').innerText = value; // display value on the page
    }
    });

    // finish button exits tag page
    finishButton.addEventListener("click", function() {
        window.location.href = returnPage; // ex. "event_page.html"
    });
}

// mandatory filter set up for first time person / guest
function checkInitialPerson(person) {
    if (person.filters.length === 0) {
        filterSetUp(person);
    }
}

// mandatory tag set up for first time organization
function checkInitialOrg(org) {
    if (org.tags.length === 0) {
        tagSetUp(org, "event_page.html");
    }
}

// event search page
function eventPage() {
    const userType = document.getElementById("demo").innerHTML; // get current user type
    const user = document.getElementById("demo").innerHTML; // get current user

    let eventList = getEventList(userType, user); // get list of relevant events

    for (let i = 0; i < eventList.length; i++) { // make all events go to event profile
        eventList[i] = document.getElementById("myInput" + i);
        eventList[i].addEventListener("click", function() {
            eventProfile(eventList[i], user);
        });
    }
}

// get all relevant events
function getEventList(userType, user) {
    const preference = userType == "person" ? user.filters : user.tags;
    return []; // get from ai + sql (unfinished)
}

// organization search page
function orgPage() {
    const userType = document.getElementById("demo").innerHTML; // get current user type
    const user = document.getElementById("demo").innerHTML; // get current user

    let orgList = getOrgList(userType, user); // get list of relevant organization

    // this for loop is very likely wrong
    for (const org in orgList) { // make all events interactable buttons
        const orgButton = document.getElementById("myInput" + org); // get each org button
        orgButton.addEventListener("click", function() {
            window.location.href = "organization_profile_page.html";
        });
    }
}

// get all relevant organization
function getOrgList(userType, user) {
    const preference = userType == "person" ? user.filters : user.tags;
    return []; // get from ai + sql (unfinished)
}

// user profile
function userProfile(person) {
    if (person.isGuest == true) { // no profile for guest
        alert("please sign in first");
        return;
    }

    // make each editable feature a button
    const logoButton = document.getElementById("myButton");
    const nameButton = document.getElementById("myButton");
    const emailButton = document.getElementById("myButton");
    const passwordButton = document.getElementById("myButton");
    const filtersButton = document.getElementById("myButton");

    // make buttons interactable
    logoButton.addEventListener("click", function() {
        editFeature("logo", person);
    });
    nameButton.addEventListener("click", function() {
        editFeature("name", person);
    });
    emailButton.addEventListener("click", function() {
        editFeature("email", person);
    });
    passwordButton.addEventListener("click", function() {
        editFeature("password", person);
    });
    filtersButton.addEventListener("click", function() {
        filterSetUp(person);
    });
}

// org profile
function orgProfile(profileOrg, user) {
    if (profileOrg.id == user.id) { // only organizations can edit themselves
        // make each editable feature a button
        const logoButton = document.getElementById("myButton");
        const nameButton = document.getElementById("myButton")
        const descriptionButton = document.getElementById("myButton");
        const emailButton = document.getElementById("myButton");
        const passwordButton = document.getElementById("myButton");
        const tagsButton = document.getElementById("myButton");
        let eventButtonArray = [];
        for (let i = 0; i < user.events.length; i++) { // make all events interactable buttons
            eventButtonArray[i] = document.getElementById("myInput" + i);
        }
        const addEventButton = document.getElementById("myButton");

        // make buttons interactable
        logoButton.addEventListener("click", function() {
            editFeature("logo", user);
        });
        nameButton.addEventListener("click", function() {
            editFeature("name", user);
        });
        descriptionButton.addEventListener("click", function() {
            editFeature("description", user);
        });
        emailButton.addEventListener("click", function() {
            editFeature("email", user);
        });
        passwordButton.addEventListener("click", function() {
            editFeature("password", user);
        });
        tagsButton.addEventListener("click", function() {
            tagSetUp(user, "organization_profile_page.html");
        });
        for (let i = 0; i < user.events.length; i++) { // event buttons go to event profile
            eventButtonArray[i].addEventListener("click", function() {
                eventProfile(user.events[i], user);
            });
        }
        addEventButton.addEventListener("click", function() { // add event
            addEvent(user);
        });
    }
}

// organization add events
function addEvent(org) {
    let event = initEvent();
    org.events.push(event);
    tagSetUp(event, "organization_profile_page.html");
}

// event profile
function eventProfile(event, user) {
    if (event.org.id == user.id) { // only organizations can edit their events
        // make each editable feature a button
        const logoButton = document.getElementById("myButton");
        const nameButton = document.getElementById("myButton")
        const descriptionButton = document.getElementById("myButton");
        const tagsButton = document.getElementById("myButton");
        const dateButton = document.getElementById("myButton");
        const linkButton = document.getElementById("myButton");

        // make buttons interactable
        logoButton.addEventListener("click", function() {
            editFeature("logo", event);
        });
        nameButton.addEventListener("click", function() {
            editFeature("name", event);
        });
        descriptionButton.addEventListener("click", function() {
            editFeature("description", event);
        });
        tagsButton.addEventListener("click", function() {
            tagSetUp(event, "event_profile_page.html");
        });
        dateButton.addEventListener("click", function() {
            editFeature("date", event);
        });
        linkButton.addEventListener("click", function() {
            editFeature("link", event);
        });
    }
}


// edit profile features (idk if dynamic programming is supported)
function editFeature(featureStr, user) {
    let inputElement; // initialize

    // (there's probably a way to simplify this)
    switch (featureStr) { // match feature to be changed
        case "logo":
            inputElement = document.getElementById("myInput"); // Get the input element

            // check input element
            inputElement.addEventListener("click", function(e) {
            if (e.key === "Enter") { // Check if the key pressed is the 'Enter' key
                // e.preventDefault(); // Prevent the default form submission behavior (if inside a form)
                
                user.logo = inputField.value // update user feature with value entered by the user
                document.getElementById('outputText').innerText = user.logo; // display value on the page
            }
            });
            break;
        case "name":
            inputElement = document.getElementById("myInput"); // Get the input element

            // check input element
            inputElement.addEventListener("click", function(e) {
            if (e.key === "Enter") { // Check if the key pressed is the 'Enter' key
                // e.preventDefault(); // Prevent the default form submission behavior (if inside a form)
                
                user.name = inputField.value // update user feature with value entered by the user
                document.getElementById('outputText').innerText = user.name; // display value on the page
            }
            });
            break;
        case "description":
            inputElement = document.getElementById("myInput"); // Get the input element

            // check input element
            inputElement.addEventListener("click", function(e) {
            if (e.key === "Enter") { // Check if the key pressed is the 'Enter' key
                // e.preventDefault(); // Prevent the default form submission behavior (if inside a form)
                
                user.description = inputField.value // update user feature with value entered by the user
                document.getElementById('outputText').innerText = user.description; // display value on the page
            }
            });
            break;
        case "email":
            inputElement = document.getElementById("myInput"); // Get the input element

            // check input element
            inputElement.addEventListener("click", function(e) {
            if (e.key === "Enter") { // Check if the key pressed is the 'Enter' key
                // e.preventDefault(); // Prevent the default form submission behavior (if inside a form)
                
                user.email = inputField.value // update user feature with value entered by the user
                document.getElementById('outputText').innerText = user.email; // display value on the page
            }
            });
            break;
        case "password":
            inputElement = document.getElementById("myInput"); // Get the input element

            // check input element
            inputElement.addEventListener("click", function(e) {
            if (e.key === "Enter") { // Check if the key pressed is the 'Enter' key
                // e.preventDefault(); // Prevent the default form submission behavior (if inside a form)
                let oldPassword = document.getElementById("myInput"); // Get old password user typed in

                if (oldPassword == user.password) { // check if user typed correct password
                    user.password = inputField.value // update user feature with value entered by the user
                    document.getElementById('outputText').innerText = user.password; // display value on the page
                }
            }
            });
            break;
        case "date":
            inputElement = document.getElementById("myInput"); // Get the input element

            // check input element
            inputElement.addEventListener("click", function(e) {
            if (e.key === "Enter") { // Check if the key pressed is the 'Enter' key
                // e.preventDefault(); // Prevent the default form submission behavior (if inside a form)
                
                user.date = inputField.value // update user feature with value entered by the user
                document.getElementById('outputText').innerText = user.date; // display value on the page
            }
            });
            break;
        case "link":
            inputElement = document.getElementById("myInput"); // Get the input element

            // check input element
            inputElement.addEventListener("click", function(e) {
            if (e.key === "Enter") { // Check if the key pressed is the 'Enter' key
                // e.preventDefault(); // Prevent the default form submission behavior (if inside a form)
                
                user.link = inputField.value // update user feature with value entered by the user
                document.getElementById('outputText').innerText = user.email; // display value on the page
            }
            });
            break;
        default: // Handles unexpected values
            alert("error feature type");
    }
}
