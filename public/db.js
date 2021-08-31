//First we need to declare the database that we will use
var dataBase;
//We open the database
const dataOpen = indexedDB.open("budget_travel", 1)

dataOpen.onupgradeneeded = (data) => {
    console.log("upgrade test")
    const dataBase = data.target.result
    dataBase.createObjectStore("new_transaction_recorded", { autoIncrement: true });

}

//The "if" statement is going to check if the page is back online, then the function "checkUpload" is called to fetch the information added
dataOpen.onsuccess = (data) => {
    console.log('test')
    dataBase = data.target.result;
    if (navigator.onLine === true) {
        console.log("Welcome back!")
        checkUpload();
    }
}

dataOpen.onerror = (data) => {
    console.log("We have an error" + data.errorCode)
}

function saveRecord(data) {
    //We create the transaction
    const transSection = dataBase.transaction("readwrite")
    //Then we access the store
    const transactionStore = transSection.objectStore("new_transaction_recorded")
    //Once the store is access, the transaction get's saved
    transactionStore.add(data)
}


checkUpload = () => {
    console.log("Checking upload")
    //We open a transaction
    var trans = dataBase.transaction('readwrite')
    //Then access the store
    var budgetTransactionStore = trans.objectStore("new_transaction_recorded")
    //Once we have access to the transactions, we get all the information the User input
    const getAll = budgetTransactionStore.getAll()
    // If the request was made succesfully, we run the function
    getAll.onsuccess = function () {
        // If the User added information, we fetch the information and added them when the page is online
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            }) //Then we return the information
                .then(res => {
                    console.log('Response' + res)
                    return res.json()
                }).then((res) => {
                    //I added this "if", in case there's a problem uploading the information, if the statement is not met, the else variable creates a transaction and clears the store
                    if (res.length < 1) {
                        console.log("Error uploading")
                    } else {
                        var transaction = dataBase("readwrite")
                        const store = transaction.objectStore("new_transaction_recorded")
                        store.clear()
                        console.log('The store is empty')
                    }
                })

        }
    }
}

//This check's when the page is back online
window.addEventListener('online', checkUpload)
