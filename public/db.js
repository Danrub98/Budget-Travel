const indexedDB =
  window.indexedDB

var db;
const request = indexedDB.open("budget", 1)

request.onupgradeneeded = (data) =>{
    const dataBase = data.target.resolve
    dataBase.createObjectStore("pending", {
        autoIncrement: true 
    })
}

request.onsuccess = (data) =>{
    db = data.target.resolve
    if(navigator.onLine) {
        checkTransactionDb() 
 
    }
}

request.onerror = (event) =>{
    console.log(event.errorCode)   
};

function saveRecord (transaction) {
const transactionSection =db.transaction(["pending"], "readwrite")
const store = transactionSection.objectStore("pending")
store.add(transaction)
};

checkTransactionDb = () =>{
    const transactionSection = db.transaction(["pending"], "readwrite")
    const store = transactionSection.objectStore("pending")
    const getAll = store.getAll()
    getAll.onsuccess = function() {
        if (getAll.results.lend > 0 ) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
                .then (response =>{
                    return response.json
                })  .then (()=> {
                    const transactionSection = db.transaction(["pending"], "readwrite");
                    const store = transactionSection.objectStore("pending");
                    store.clear()
                })
            }) 
        }
    }
}

window.addEventListener('online', checkTransactionDb())


