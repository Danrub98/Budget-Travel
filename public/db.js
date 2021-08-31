//First we need to declare the database that we will use
var dataBase;
//We open the database
const request = indexedDB.open("budget_travel", 1)

request.onupgradeneeded = (data) => {
    console.log("upgrade test")
    const dataBase = data.target.result
    dataBase.createObjectStore("new_transaction_recorded", { autoIncrement: true });

}

//The "if" statement is going to check if the page is back online, then the function "checkUpload" is called to fetch the information added
request.onsuccess = (data) => {
    dataBase = data.target.result;
    if (navigator.onLine === true) {
        console.log("Welcome back!")
        checkUpload();
    }
}

request.onerror = (data) => {
    console.log("We have an error:" + data.errorCode)
}

function saveRecord(data) {
    //We create the transaction
    const trans = dataBase.transaction("readwrite")
    //Then we access the store
    const transactionStore = trans.objectStore("new_transaction_recorded")
    //Once the store is access, the transaction get's saved
    transactionStore.add(data)
}


checkUpload = () => {
    console.log("Checking upload")
    //We open a transaction
    const trans = dataBase.transaction('readwrite')
    //Then access the store
    const transactionStore = trans.objectStore("new_transaction_recorded")
    //Once we have access to the transactions, we get all the information the User input
    const getAll = transactionStore.getAll()
    // If the request was made succesfully, we run the function
    getAll.onsuccess = function () {
        // If the User added information, we fetch the information and added them when the page is online
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }) //Then we return the information
                .then(res => res.json())
                    .then((response) => {
                    //I added this "if", in case there's a problem uploading the information, if the statement is not met, the else variable creates a transaction and clears the store
                    if (response.length < 1) {
                        console.log("Error uploading")
                    } else {
                        const trans = dataBase.transaction("readwrite")
                        const transactionStore = trans.objectStore("new_transaction_recorded")
                        transactionStore.clear()
                        console.log('The store is empty')
                    }
                })

        }
    }
}

//This check's when the page is back online
window.addEventListener('online', checkUpload)
