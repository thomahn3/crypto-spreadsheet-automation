function findDuplicates(arr) {
    // Object to store occurrences of each element
    const elementCounts = {};
    const duplicates = [];

    for (let item of arr) {
        // Increment count or initialize to 1
        elementCounts[item] = (elementCounts[item] || 0) + 1;
    }

    // Check for duplicates
    for (let [key, count] of Object.entries(elementCounts)) {
        if (count > 1) {
            duplicates.push({ element: key, count });
        }
    }

    return duplicates;
}

// Example usage:
const inputArray = [
    
    ];
const duplicates = findDuplicates(inputArray);

if (duplicates.length > 0) {
    console.log("Duplicates found:");
    duplicates.forEach(({ element, count }) => {
        console.log(`Element: ${element}, Count: ${count}`);
    });
} else {
    console.log("No duplicates found.");
}

