export async function getAllPantries() {
    try {
        const res = await fetch("/api/pantries");
        if (!res.ok) 
            throw new Error(res.status);
        return await res.json();
    } catch (err) {
        console.log("ERROR: getAllPantries(): " + err);
        return null;
    }
}

export async function getPantryByID(id) {
    try {
        const res = await fetch("/api/pantries/" + id);
        if (!res.ok) 
            throw new Error(res.status);
        return await res.json();
    } catch (err) {
        console.log("ERROR: getPantryByID(): " + err);
        return null;
    }
}

export async function getPantryHours(id) {
    try {
        const res = await fetch("/api/pantries/" + id + "/hours");
        if (!res.ok) 
            throw new Error(res.status);
        return await res.json();
    } catch (err) {
        console.log("ERROR: getPantryHours(): " + err);
        return null;
    }
}

// Function tests here
console.log("Testing getAllPantries()");
console.log("  getAllPantries(): " + JSON.stringify(await getAllPantries()));

console.log("Testing getPantryById() with ID 1");
console.log("  getPantryById(1): " + JSON.stringify(await getPantryByID(1)));

console.log("Testing getPantryById() error handling, with ID -1");
console.log("  getPantryById(-1): " + JSON.stringify(await getPantryByID(-1)));

console.log("Testing getPantryHours() with ID 1");
console.log("  getPantryHours(1): " + JSON.stringify(await getPantryHours(1)));

console.log("Testing getPantryHours() error handling, with ID -1");
console.log("  getPantryHours(-1): " + JSON.stringify(await getPantryHours(-1)));