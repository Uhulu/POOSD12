const urlBase = 'http://poosd12.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

const ids = [] //storing ids in this array from contacts function

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	var hash = md5( password );

	// if (!validLoginForm(login, password)) {
    //     document.getElementById("loginResult").innerHTML = "invalid username or password";
    //     return;
    // }
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
	//let tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "contacts.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function doSignup() {
    firstName = document.getElementById("firstName").value;
    lastName = document.getElementById("lastName").value;

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (!validSignUpForm(firstName, lastName, username, password)) {
        document.getElementById("signupResult").innerHTML = "Invalid password: must include at least 1 uppercase letter, number, and special character.";
        return;
    }

    //var hash = md5(password);

    document.getElementById("signupResult").innerHTML = "";

    let tmp = {
        firstName: firstName,
        lastName: lastName,
        login: username,
        password: password
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Register.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {

            if (this.readyState != 4) {
                return;
            }

            if (this.status == 409) {
                document.getElementById("signupResult").innerHTML = "User already exists";
                return;
            }

            if (this.status == 200) {

                let jsonObject = JSON.parse(xhr.responseText);
                userId = jsonObject.id;
                document.getElementById("signupResult").innerHTML = "User added";
                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;
                saveCookie();
				window.location.href = "index.html";
            }
        };

        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("signupResult").innerHTML = err.message;
    }
}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
 	if( userId < 0 )
 	{
 		window.location.href = "index.html";
 	}
 	else
 	{
		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function addContact() {

    let firstname = document.getElementById("contactTextFirst").value;
    let lastname = document.getElementById("contactTextLast").value;
    let phonenumber = document.getElementById("contactTextNumber").value;
    let emailaddress = document.getElementById("contactTextEmail").value;

    //check for shitty data
    if (!validContact(firstname, lastname, phonenumber, emailaddress )) {
    document.getElementById("contactAddResult").innerHTML = "invalid Contact Data";
    return;
   }   

    let tmp = {
        firstName: firstname,
        lastName: lastname,
        phoneNumber: phonenumber,
        emailAddress: emailaddress,
        userId: userId
    };


    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/AddContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log("Contact has been added");

                document.getElementById("contactAddResult").innerHTML = "Contact was Added"
                //document.getElementById("contactAddResult").reset(); //Empties all the fields 

                // Clear the fields after adding
                document.getElementById("contactTextFirst").value = "";
                document.getElementById("contactTextLast").value = "";
                document.getElementById("contactTextNumber").value = "";
                document.getElementById("contactTextEmail").value = "";

                //need to implement a refresh function after adding 
                loadContacts();//this should refresh the list after adding 

                
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.log(err.message);
    }
}

function scrollToBottom() {
    var contactList = document.getElementById('contactList');
    contactList.scrollTop = contactList.scrollHeight;
}

function scrollPageToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth' // Optional: adds a smooth scrolling effect
    });
}

function searchContacts() {
    const searchInput = document.getElementById("searchText"); // Input box for search
    const searchTerms = searchInput.value.toUpperCase().split(' '); // Get search query and split into words
    const contactsTable = document.getElementById("contacts"); // Table containing contact data
    const tableRows = contactsTable.getElementsByTagName("tr"); // Get all rows in the table
    const contactListElement = document.getElementById("contactList"); // The <p> element to display results


    // Clear previous search results
    contactListElement.innerHTML = "";

    // Check if search input is empty
    if (searchInput.value.trim() === "") {
        // Display "No contacts found" message
        contactListElement.innerHTML = "No contacts found.";
        return; // Exit the function early
    }

    // Loop through all the rows in the table
    for (let i = 0; i < tableRows.length; i++) {
        const firstNameCell = tableRows[i].getElementsByTagName("td")[0]; // First name column
        const lastNameCell = tableRows[i].getElementsByTagName("td")[1]; // Last name column
        const emailCell = tableRows[i].getElementsByTagName("td")[2]; // Email column
        const phoneCell = tableRows[i].getElementsByTagName("td")[3]; // Phone number column
        if (firstNameCell && lastNameCell) {
            const firstNameText = firstNameCell.textContent || firstNameCell.innerText; // First name text
            const lastNameText = lastNameCell.textContent || lastNameCell.innerText; // Last name text
            const emailText = emailCell.textContent || emailCell.innerText; // Email text
            const phoneText = phoneCell.textContent || phoneCell.innerText; // Phone text

            // Check if any part of the search matches the first name or last name
            let matchFound = false;
            for (let term of searchTerms) {
                if (firstNameText.toUpperCase().indexOf(term) > -1 || lastNameText.toUpperCase().indexOf(term) > -1) {
                    matchFound = true;
                    break; // Exit loop if a match is found
                }
            }

            // If a match is found, add the contact to the <p> element
            if (matchFound) {
                const contactInfo = `First Name: ${firstNameText}, Last Name: ${lastNameText}, Email: ${emailText}, Phone: ${phoneText}`;
                const contactEntry = document.createElement("p");
                contactEntry.textContent = contactInfo;
                contactListElement.appendChild(contactEntry);
            
            }
        }
    }

    // If no results found, display a message
    if (contactListElement.innerHTML === "") {
        contactListElement.innerHTML = "No contacts found.";
    }
    scrollPageToBottom();
}






function loadContacts() {
    let tmp = {
        search: "",
        userId: userId //cookieeee
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/SearchContacts.' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    //API check and call
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                if (jsonObject.error) {
                    console.log(jsonObject.error);
                    return;
                }
                //Generate rows of info from users contacts
                let text = "<table border='1'>"
                for (let i = 0; i < jsonObject.results.length; i++) {
                    ids[i] = jsonObject.results[i].ID
                    text += "<tr id='row" + i + "'>"
                    text += "<td id='first_Name" + i + "'><span>" + jsonObject.results[i].FirstName + "</span></td>";
                    text += "<td id='last_Name" + i + "'><span>" + jsonObject.results[i].LastName + "</span></td>";
                    text += "<td id='email" + i + "'><span>" + jsonObject.results[i].EmailAddress + "</span></td>";
                    text += "<td id='phone" + i + "'><span>" + jsonObject.results[i].PhoneNumber + "</span></td>";
                    //delete and edit buttons for the form
                    text += "<td>" +
                        "<button type='button' id='edit_button" + i + "' class='w3-button w3-circle w3-lime' onclick='edit_row(" + i + ")'>" + "<span class='glyphicon glyphicon-edit'></span> Edit</button>" +
                        "<button type='button' id='save_button" + i + "' value='Save' class='w3-button w3-circle w3-lime' onclick='save_contact(" + i + ")' style='display: none'>" + "<span class='glyphicon glyphicon-saved'></span> Save</button>" +
                        "<button type='button' onclick='delete_contact(" + i + ")' class='w3-button w3-circle w3-amber'>" + "<span class='glyphicon glyphicon-trash'></span> Delete</button>" + "</td>";
                    text += "<tr/>"
                }
                text += "</table>"
                document.getElementById("tbody").innerHTML = text;
                scrollPageToBottom();
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.log(err.message);
    }
}

function validLoginForm(logName, logPass) {

    var logNameErr = logPassErr = true;

    if (logName == "") {
        console.log("USERNAME IS BLANK");
    }
    else {
        var regex = /(?=.*[a-zA-Z])[a-zA-Z0-9-_]{3,18}$/;

        if (regex.test(logName) == false) {
            console.log("USERNAME IS NOT VALID");
        }

        else {

            console.log("USERNAME IS VALID");
            logNameErr = false;
        }
    }

    if (logPass == "") {
        console.log("PASSWORD IS BLANK");
        logPassErr = true;
    }
    else {
        var regex = /(?=.*\d)(?=.*[A-Za-z])(?=.*[!@#$%^&*]).{8,32}/;

        if (regex.test(logPass) == false) {
            console.log("PASSWORD IS NOT VALID");
        }

        else {

            console.log("PASSWORD IS VALID");
            logPassErr = false;
        }
    }

    if ((logNameErr || logPassErr) == true) {
        return false;
    }
    return true;

}

function validContact(first,last,phone,email){
    var firstError = lastError = phoneError = emailError = true;

    if(first == ""){
        console.log("First Name Blank");
    }
    else {
        console.log("Valid First Name");
        firstError = false; //Valid entry sets it to false
    }

    if(last == ""){
        console.log("Last Name Blank");
    }
    else {
        console.log("Valid Last Name");
        lastError = false; //Valid entry sets it to false
    }
    
    if (phone == "") {
        console.log("PHONE IS BLANK");
    }
    else {
        var regex = /^(\(?\d{3}\)?[-\s\.]?)\d{3}[-\s\.]?\d{4}$/;


        if (regex.test(phone) == false) {
            console.log("PHONE IS NOT VALID");
        }

        else {

            console.log("PHONE IS VALID");
            phoneError = false; //Valid entry sets it to false
        }
    }

    if (email == "") {
        console.log("EMAIL IS BLANK");
    }
    else {
        var regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/; //confusing ass regex line

        if (regex.test(email) == false) {
            console.log("EMAIL IS NOT VALID");
        }

        else {

            console.log("EMAIL IS VALID");
            emailError = false;
        }
    }

    if((firstError ||lastError || phoneError || emailError) == true){
        return false;
    } 

    return true;
       

}

function delete_contact(x) {
    var namef_val = document.getElementById("first_Name" + x).innerText;
    var namel_val = document.getElementById("last_Name" + x).innerText;
    nameOne = namef_val.substring(0, namef_val.length);
    nameTwo = namel_val.substring(0, namel_val.length);
    let check = confirm('Confirm deletion of contact: ' + nameOne + ' ' + nameTwo);
    if (check === true) {
        document.getElementById("row" + x + "").outerHTML = "";
        let tmp = {
            firstName: nameOne,
            lastName: nameTwo,
            userId: userId
        };

        let jsonPayload = JSON.stringify(tmp);


        

        let url = urlBase + '/DeleteContacts.' + extension;

        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
        try {
            xhr.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {

                    console.log("Contact has been deleted");
                    loadContacts();
                }
            };
            xhr.send(jsonPayload);
        } catch (err) {
            console.log(err.message);
        }

    };

}

function save_contact(x) {
    var namef_val = document.getElementById("namef_text" + x).value;
    var namel_val = document.getElementById("namel_text" + x).value;
    var email_val = document.getElementById("email_text" + x).value;
    var phone_val = document.getElementById("phone_text" + x).value;
    var id_val = ids[x]

    document.getElementById("first_Name" + x).innerHTML = namef_val;
    document.getElementById("last_Name" + x).innerHTML = namel_val;
    document.getElementById("email" + x).innerHTML = email_val;
    document.getElementById("phone" + x).innerHTML = phone_val;

    document.getElementById("edit_button" + x).style.display = "inline-block";
    document.getElementById("save_button" + x).style.display = "none";

    let tmp = {
        phoneNumber: phone_val,
        emailAddress: email_val,
        newFirstName: namef_val,
        newLastName: namel_val,
        id: id_val
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/UpdateContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log("Contact has been updated");
                loadContacts();
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.log(err.message);
    }
}

function edit_row(id) {
    document.getElementById("edit_button" + id).style.display = "none";
    document.getElementById("save_button" + id).style.display = "inline-block";

    var firstNameI = document.getElementById("first_Name" + id);
    var lastNameI = document.getElementById("last_Name" + id);
    var email = document.getElementById("email" + id);
    var phone = document.getElementById("phone" + id);

    var namef_data = firstNameI.innerText;
    var namel_data = lastNameI.innerText;
    var email_data = email.innerText;
    var phone_data = phone.innerText;

    firstNameI.innerHTML = "<input type='text' id='namef_text" + id + "' value='" + namef_data + "'>";
    lastNameI.innerHTML = "<input type='text' id='namel_text" + id + "' value='" + namel_data + "'>";
    email.innerHTML = "<input type='text' id='email_text" + id + "' value='" + email_data + "'>";
    phone.innerHTML = "<input type='text' id='phone_text" + id + "' value='" + phone_data + "'>"
}

function validSignUpForm(fName, lName, user, pass) {

    var fNameErr = lNameErr = userErr = passErr = true;

    if (fName == "") {
        console.log("FIRST NAME IS BLANK");
    }
    else {
        console.log("first name IS VALID");
        fNameErr = false;
    }

    if (lName == "") {
        console.log("LAST NAME IS BLANK");
    }
    else {
        console.log("LAST name IS VALID");
        lNameErr = false;
    }

    if (user == "") {
        console.log("USERNAME IS BLANK");
    }
    else {
        var regex = /(?=.*[a-zA-Z])([a-zA-Z0-9-_]).{3,18}$/;

        if (regex.test(user) == false) {
            console.log("USERNAME IS NOT VALID");
        }

        else {

            console.log("USERNAME IS VALID");
            userErr = false;
        }
    }

    if (pass == "") {
        console.log("PASSWORD IS BLANK");
    }
    else {
        var regex = /(?=.*\d)(?=.*[A-Za-z])(?=.*[!@#$%^&*]).{8,32}/;

        if (regex.test(pass) == false) {
            console.log("PASSWORD IS NOT VALID");
        }

        else {

            console.log("PASSWORD IS VALID");
            passErr = false;
        }
    }

    if ((fNameErr || lNameErr || userErr || passErr) == true) {
        return false;

    }

    return true;
}
