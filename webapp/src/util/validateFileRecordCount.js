import Papa from 'papaparse';

const validateCSVRecordCount = (file, maxRecords) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            complete: (results) => {
                //#PROD logger.log(" In VFRC js file 2");
                if (results.data.length > maxRecords) {
                    //#PROD logger.log(" In VFRC js file 3");
                    resolve(`The number of records in the CSV file exceeds the limit of ${maxRecords}.`);
                }
                resolve(null);
            },
        });
    });
};

export const validateFileRecordCount = (file) => {
    //#PROD logger.log(" In VFRC js file 1");
    const maxRecords = 50;

    return validateCSVRecordCount(file, maxRecords);
};
