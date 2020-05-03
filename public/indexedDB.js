//inedexedDB.js will store the pending requests and upload them to database when connected
const database;

//the pending request transactions index database
const request = indexedDB.open("transaction", 1);

//creates a pending object store with autoincrements
request.onupgradeneeded = function(event) {
    const database = event.target.result;
    database.createObjectStore("pendingTransactions", { autoIncrement: true });
};

request.onsuccess = function(event) {
    database = event.target.result;

    //check to see if working in online, or offline mode
    if(navigator.onLine){
        //function will write all pending transactions if online, and if there are pending transactions 
        checkDatabase();
    }
}

//checks for error
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

//declared functions
//saveRecord will be called by the index.js file if we are working offline
function saveRecord(record){
    //creates a new Transaction
    const transaction = database.transaction(["pendingTransactions"], "readwrite");
    //variable that will represent our objectStore
    const store = transaction.objectStore("pendingTransactions");
    //adds the pending transaction
    store.add(record);
}

function checkDatabase() {
    //opens up a list of pending saved transactions
    const transaction = database.transaction(["pendingTransactions"], "readwrite");
    //accesses the pending objects
    const store = transaction.objectStore("pendingTransactions");
    //getAll function to get all the pending transactions
    const all = store.getAll();

    all.onsuccess = function() {
        //if there is anything to add, call the bulk transaction api to post it
        if(all.result.length > 0) {
            console.log("Sending bulk transactions: ", all.result);
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(all.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                  }
            }).then(response => response.json())
            .then(() => {
                // if successful, open transaction on database
                const transaction = database.transaction(["pendingTransactions"], "readwrite");
        
                // accesses pending object store
                const store = transaction.objectStore("pendingTransactions");
        
                // clear all items 
                store.clear();
              });
        }
    };
}

//when app comes back online, run the check database function and update the online database
window.addEventListener("online", checkDatabase);